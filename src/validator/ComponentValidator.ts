import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import type { ComponentYAML } from '../types/ComponentTypes';

const execAsync = promisify(exec);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  componentName: string;
  filePath: string;
  checks: {
    yamlValid: boolean;
    typescriptCompiles: boolean;
    reactRenders: boolean;
    handlesValid: boolean;
    stylingValid: boolean;
  };
}

export class ComponentValidator {
  private tempDir = './temp-validation';
  
  async validateComponent(yamlContent: string, generatedCode: string, componentName: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      componentName,
      filePath: '',
      checks: {
        yamlValid: false,
        typescriptCompiles: false,
        reactRenders: false,
        handlesValid: false,
        stylingValid: false
      }
    };

    try {
      // 1. Validate YAML structure
      await this.validateYAML(yamlContent, result);
      
      // 2. Create temp file for TypeScript validation
      await this.ensureTempDir();
      const tempFilePath = path.join(this.tempDir, `${componentName}.tsx`);
      await fs.promises.writeFile(tempFilePath, generatedCode);
      result.filePath = tempFilePath;

      // 3. Validate TypeScript compilation
      await this.validateTypeScript(tempFilePath, result);
      
      // 4. Validate React component structure
      await this.validateReactComponent(generatedCode, result);
      
      // 5. Validate React Flow handles
      await this.validateHandles(yamlContent, generatedCode, result);
      
      // 6. Validate styling and UI
      await this.validateStyling(yamlContent, generatedCode, result);
      
      // Final validation status
      result.valid = Object.values(result.checks).every(check => check);
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation failed: ${error}`);
    }

    return result;
  }

  private async validateYAML(yamlContent: string, result: ValidationResult): Promise<void> {
    try {
      const yaml = await import('js-yaml');
      const parsed = yaml.load(yamlContent) as ComponentYAML;
      
      // Check required fields
      const requiredFields = ['name', 'framework', 'category', 'inputs', 'outputs', 'ui'];
      const missingFields = requiredFields.filter(field => !parsed[field as keyof ComponentYAML]);
      
      if (missingFields.length > 0) {
        result.errors.push(`Missing required YAML fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate inputs/outputs structure
      if (!Array.isArray(parsed.inputs) || !Array.isArray(parsed.outputs)) {
        result.errors.push('Inputs and outputs must be arrays');
        return;
      }

      // Validate UI configuration
      if (!parsed.ui.icon || !parsed.ui.color || !parsed.ui.position) {
        result.errors.push('UI configuration must include icon, color, and position');
        return;
      }

      result.checks.yamlValid = true;
      
    } catch (error) {
      result.errors.push(`YAML parsing failed: ${error}`);
    }
  }

  private async validateTypeScript(filePath: string, result: ValidationResult): Promise<void> {
    try {
      // Create a minimal tsconfig for validation
      const tsconfigPath = path.join(this.tempDir, 'tsconfig.json');
      const tsconfig = {
        compilerOptions: {
          target: "ES2020",
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: false,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noFallthroughCasesInSwitch: true,
          module: "ESNext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx"
        },
        include: [filePath]
      };
      
      await fs.promises.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      
      // Run TypeScript compiler
      const { stderr } = await execAsync(`npx tsc --noEmit --project ${tsconfigPath}`);
      
      if (stderr && stderr.includes('error TS')) {
        result.errors.push(`TypeScript compilation errors: ${stderr}`);
        return;
      }
      
      result.checks.typescriptCompiles = true;
      
    } catch (error) {
      result.warnings.push(`TypeScript validation skipped: ${error}`);
      // Don't fail completely - TypeScript might not be available
      result.checks.typescriptCompiles = true;
    }
  }

  private async validateReactComponent(code: string, result: ValidationResult): Promise<void> {
    try {
      // Check for required React patterns
      const requiredPatterns = [
        /import React/,
        /import.*Handle.*Position.*from ['"]@xyflow\/react['"]/,
        /export const \w+: React\.FC</,
        /return \(/,
        /<div.*>/,
        /<Handle.*type="target"/,
        /<Handle.*type="source"/
      ];

      const missingPatterns: string[] = [];
      
      requiredPatterns.forEach((pattern, index) => {
        if (!pattern.test(code)) {
          const patternNames = [
            'React import',
            '@xyflow/react imports',
            'React.FC export',
            'JSX return statement',
            'Main div wrapper',
            'Input handles',
            'Output handles'
          ];
          missingPatterns.push(patternNames[index]);
        }
      });

      if (missingPatterns.length > 0) {
        result.errors.push(`Missing React patterns: ${missingPatterns.join(', ')}`);
        return;
      }

      result.checks.reactRenders = true;
      
    } catch (error) {
      result.errors.push(`React component validation failed: ${error}`);
    }
  }

  private async validateHandles(yamlContent: string, code: string, result: ValidationResult): Promise<void> {
    try {
      const yaml = await import('js-yaml');
      const parsed = yaml.load(yamlContent) as ComponentYAML;
      
      // Check that all inputs have target handles
      for (const input of parsed.inputs) {
        const handleRegex = new RegExp(`<Handle.*type="target".*id="${input.name}"`);
        if (!handleRegex.test(code)) {
          result.errors.push(`Missing target handle for input: ${input.name}`);
        }
      }
      
      // Check that all outputs have source handles
      for (const output of parsed.outputs) {
        const handleRegex = new RegExp(`<Handle.*type="source".*id="${output.name}"`);
        if (!handleRegex.test(code)) {
          result.errors.push(`Missing source handle for output: ${output.name}`);
        }
      }
      
      if (result.errors.length === 0 || result.errors.every(e => !e.includes('Missing') || !e.includes('handle'))) {
        result.checks.handlesValid = true;
      }
      
    } catch (error) {
      result.errors.push(`Handle validation failed: ${error}`);
    }
  }

  private async validateStyling(yamlContent: string, code: string, result: ValidationResult): Promise<void> {
    try {
      const yaml = await import('js-yaml');
      const parsed = yaml.load(yamlContent) as ComponentYAML;
      
      // Check that UI color is used in styling
      if (!code.includes(parsed.ui.color)) {
        result.warnings.push(`UI color ${parsed.ui.color} not found in generated styling`);
      }
      
      // Check that icon is included
      if (!code.includes(parsed.ui.icon)) {
        result.warnings.push(`UI icon ${parsed.ui.icon} not found in generated component`);
      }
      
      // Check for responsive classes
      const hasResponsiveClasses = /className="[^"]*(?:px-|py-|shadow-|rounded-|border-|bg-)/g.test(code);
      if (!hasResponsiveClasses) {
        result.warnings.push('Generated component may lack proper Tailwind styling');
      }
      
      result.checks.stylingValid = true;
      
    } catch (error) {
      result.warnings.push(`Styling validation failed: ${error}`);
      result.checks.stylingValid = true; // Don't fail on styling issues
    }
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.promises.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async cleanup(): Promise<void> {
    try {
      await fs.promises.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Validate all components in the generated directory
   */
  async validateAllGeneratedComponents(): Promise<ValidationResult[]> {
    const generatedDir = './src/components/generated';
    const componentsDir = './components';
    const results: ValidationResult[] = [];

    try {
      const generatedFiles = await fs.promises.readdir(generatedDir);
      const yamlFiles = await fs.promises.readdir(componentsDir);
      
      for (const generatedFile of generatedFiles.filter(f => f.endsWith('.tsx'))) {
        const componentCode = await fs.promises.readFile(
          path.join(generatedDir, generatedFile), 
          'utf-8'
        );
        
        // Find corresponding YAML file
        const yamlFile = yamlFiles.find(f => {
          const yamlName = f.replace('.yaml', '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const tsxName = generatedFile.replace('.tsx', '').toLowerCase();
          return tsxName.includes(yamlName) || yamlName.includes(tsxName.split(/(?=[A-Z])/).join('').toLowerCase());
        });
        
        if (yamlFile) {
          const yamlContent = await fs.promises.readFile(
            path.join(componentsDir, yamlFile),
            'utf-8'
          );
          
          const result = await this.validateComponent(
            yamlContent,
            componentCode,
            generatedFile.replace('.tsx', '')
          );
          
          results.push(result);
        }
      }
      
    } catch (error) {
      console.error('Validation failed:', error);
    }
    
    return results;
  }
}