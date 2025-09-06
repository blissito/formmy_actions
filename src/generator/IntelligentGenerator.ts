import { BootstrapGenerator } from './BootstrapGenerator';
import type { ComponentYAML } from '../types/ComponentTypes';
import { ComponentValidator, type ValidationResult } from '../validator/ComponentValidator';
import fs from 'fs';

export interface AIFeedback {
  suggestions: string[];
  improvements: string[];
  regenerateRecommended: boolean;
  newYamlSuggestions?: Partial<ComponentYAML>;
}

export class IntelligentGenerator {
  private generator: BootstrapGenerator;
  private validator: ComponentValidator;
  private maxRetries = 3;

  constructor() {
    this.generator = new BootstrapGenerator();
    this.validator = new ComponentValidator();
  }

  /**
   * Generate component with validation loop and AI-powered improvements
   */
  async generateWithValidation(yamlContent: string, outputPath: string): Promise<{
    success: boolean;
    finalCode: string;
    validationResults: ValidationResult[];
    iterations: number;
    improvements: string[];
  }> {
    let currentYaml = yamlContent;
    let currentCode = '';
    let validationResults: ValidationResult[] = [];
    let iterations = 0;
    let improvements: string[] = [];

    console.log('🎯 Starting intelligent generation with validation loop...');

    while (iterations < this.maxRetries) {
      iterations++;
      console.log(`\n🔄 Iteration ${iterations}/${this.maxRetries}`);

      try {
        // 1. Parse current YAML
        const component = this.generator.parseComponent(currentYaml);
        console.log(`📋 Parsed component: ${component.name}`);

        // 2. Generate code
        currentCode = this.generator.generateComponentCode(component);
        console.log(`⚡ Generated code (${currentCode.length} chars)`);

        // 3. Validate
        const validation = await this.validator.validateComponent(
          currentYaml,
          currentCode,
          component.name
        );
        validationResults.push(validation);

        console.log(`✅ Validation complete - Valid: ${validation.valid}`);
        console.log(`   Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);

        // 4. If valid, we're done!
        if (validation.valid && validation.errors.length === 0) {
          console.log('🎉 Component is valid! Saving...');
          await fs.promises.writeFile(outputPath, currentCode);
          break;
        }

        // 5. Generate improvements based on validation
        const feedback = this.analyzeValidationResults(validation);
        improvements.push(...feedback.suggestions);

        console.log('🧠 AI Feedback:');
        feedback.suggestions.forEach(s => console.log(`   💡 ${s}`));

        if (!feedback.regenerateRecommended) {
          console.log('⚠️ No regeneration recommended, saving current version');
          await fs.promises.writeFile(outputPath, currentCode);
          break;
        }

        // 6. Apply improvements to YAML
        currentYaml = this.applyImprovements(currentYaml, feedback);
        console.log('🔧 Applied improvements to YAML');

      } catch (error) {
        console.error(`❌ Iteration ${iterations} failed:`, error);
        if (iterations === this.maxRetries && currentCode) {
          console.log('💾 Saving last generated version despite errors');
          await fs.promises.writeFile(outputPath, currentCode);
        }
      }
    }

    await this.validator.cleanup();

    return {
      success: validationResults[validationResults.length - 1]?.valid || false,
      finalCode: currentCode,
      validationResults,
      iterations,
      improvements
    };
  }

  /**
   * AI-powered analysis of validation results
   * This simulates intelligent feedback without external APIs
   */
  private analyzeValidationResults(validation: ValidationResult): AIFeedback {
    const suggestions: string[] = [];
    const improvements: string[] = [];
    let regenerateRecommended = false;

    // Analyze common patterns and suggest fixes
    if (!validation.checks.typescriptCompiles) {
      suggestions.push('Fix TypeScript compilation errors');
      improvements.push('Add proper type annotations');
      regenerateRecommended = true;
    }

    if (!validation.checks.handlesValid) {
      suggestions.push('Fix React Flow handle configuration');
      improvements.push('Ensure all inputs/outputs have corresponding handles');
      regenerateRecommended = true;
    }

    if (!validation.checks.reactRenders) {
      suggestions.push('Fix React component structure');
      improvements.push('Add missing React imports or JSX structure');
      regenerateRecommended = true;
    }

    // Analyze specific error patterns
    validation.errors.forEach(error => {
      if (error.includes('Missing target handle')) {
        suggestions.push('Add missing input handles with correct IDs');
        regenerateRecommended = true;
      }
      
      if (error.includes('Missing source handle')) {
        suggestions.push('Add missing output handles with correct IDs');
        regenerateRecommended = true;
      }

      if (error.includes('YAML')) {
        suggestions.push('Fix YAML structure - ensure all required fields are present');
        regenerateRecommended = true;
      }
    });

    // Smart suggestions based on warnings
    validation.warnings.forEach(warning => {
      if (warning.includes('color not found')) {
        suggestions.push('Ensure UI color is properly applied to component styling');
      }
      
      if (warning.includes('icon not found')) {
        suggestions.push('Include the specified UI icon in the component display');
      }
    });

    // If no specific issues, suggest optimizations
    if (suggestions.length === 0 && validation.warnings.length > 0) {
      suggestions.push('Apply styling optimizations and ensure consistent theming');
    }

    return {
      suggestions,
      improvements,
      regenerateRecommended,
      newYamlSuggestions: this.generateYamlImprovements(validation)
    };
  }

  /**
   * Apply AI feedback to YAML definition
   */
  private applyImprovements(yamlContent: string, feedback: AIFeedback): string {
    let improvedYaml = yamlContent;

    // Apply specific fixes based on feedback
    feedback.suggestions.forEach(suggestion => {
      if (suggestion.includes('input handles')) {
        // This is a simplistic approach - in a real system you'd have more sophisticated logic
        console.log('🔧 Attempting to fix input handle issues...');
      }
      
      if (suggestion.includes('output handles')) {
        console.log('🔧 Attempting to fix output handle issues...');
      }
    });

    // Apply YAML improvements if suggested
    if (feedback.newYamlSuggestions) {
      try {
        const yaml = require('js-yaml');
        const parsed = yaml.load(improvedYaml);
        
        // Merge improvements (this is where AI would make smart changes)
        const enhanced = { ...parsed, ...feedback.newYamlSuggestions };
        improvedYaml = yaml.dump(enhanced);
        
        console.log('🔧 Applied YAML structure improvements');
      } catch (error) {
        console.log('⚠️ Could not apply YAML improvements:', error);
      }
    }

    return improvedYaml;
  }

  /**
   * Generate smart YAML improvements based on validation results
   */
  private generateYamlImprovements(validation: ValidationResult): Partial<ComponentYAML> {
    const improvements: Partial<ComponentYAML> = {};

    // Smart defaults based on common patterns
    if (validation.warnings.some(w => w.includes('styling'))) {
      improvements.ui = {
        icon: '🔧',
        color: '#6366f1', 
        position: [200, 200]
      };
    }

    return improvements;
  }

  /**
   * Generate and validate all components with intelligence loop
   */
  async generateAllIntelligent(): Promise<void> {
    const componentsDir = './components';
    const outputDir = './src/components/generated';
    
    console.log('🧠 Starting intelligent batch generation...');
    
    try {
      const yamlFiles = await fs.promises.readdir(componentsDir);
      const yamlFilesFiltered = yamlFiles.filter(file => file.endsWith('.yaml'));
      
      await fs.promises.mkdir(outputDir, { recursive: true });
      
      for (const yamlFile of yamlFilesFiltered) {
        console.log(`\n🎯 Processing ${yamlFile}...`);
        
        const yamlPath = `${componentsDir}/${yamlFile}`;
        const yamlContent = await fs.promises.readFile(yamlPath, 'utf-8');
        
        const component = this.generator.parseComponent(yamlContent);
        const outputFileName = `${component.framework.charAt(0).toUpperCase()}${component.framework.slice(1)}${component.name.replace(/[^a-zA-Z0-9]/g, '')}.tsx`;
        const outputPath = `${outputDir}/${outputFileName}`;
        
        const result = await this.generateWithValidation(yamlContent, outputPath);
        
        console.log(`\n📊 Results for ${yamlFile}:`);
        console.log(`   ✅ Success: ${result.success}`);
        console.log(`   🔄 Iterations: ${result.iterations}`);
        console.log(`   💡 Improvements: ${result.improvements.length}`);
        
        if (result.improvements.length > 0) {
          console.log('   Applied improvements:');
          result.improvements.forEach(imp => console.log(`     - ${imp}`));
        }
      }
      
      console.log('\n🎉 Intelligent batch generation complete!');
      
    } catch (error) {
      console.error('❌ Intelligent generation failed:', error);
    }
  }
}