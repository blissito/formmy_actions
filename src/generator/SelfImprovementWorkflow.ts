import { BootstrapGenerator } from './BootstrapGenerator';
import { IntelligentGenerator } from './IntelligentGenerator';
import { ComponentValidator } from '../validator/ComponentValidator';
import fs from 'fs';
import path from 'path';

export class SelfImprovementWorkflow {
  private generator: BootstrapGenerator;
  private intelligentGenerator: IntelligentGenerator;
  private validator: ComponentValidator;
  private componentsDir = './components';
  private outputDir = './src/components/generated';

  constructor() {
    this.generator = new BootstrapGenerator();
    this.intelligentGenerator = new IntelligentGenerator();
    this.validator = new ComponentValidator();
  }

  /**
   * The meta magic: Use the generator to improve itself
   */
  async bootstrapSelf(): Promise<void> {
    console.log('🚀 Starting self-improvement bootstrap...');
    
    // 1. Read the generator's own YAML definition
    const selfDefYaml = await fs.promises.readFile(
      path.join(this.componentsDir, 'meta-generator.yaml'), 
      'utf-8'
    );
    
    // 2. Parse it using itself
    const selfDef = this.generator.parseComponent(selfDefYaml);
    console.log(`📖 Parsed self-definition: ${selfDef.name}`);
    
    // 3. Generate a React Flow node for itself
    const selfNode = this.generator.generateReactFlowNode(selfDef, 'bootstrap-generator');
    console.log(`🎯 Generated self-node with ID: ${selfNode.id}`);
    
    // 4. Generate the React component code for itself
    const selfComponentCode = this.generator.generateComponentCode(selfDef);
    
    // 5. Save the generated code
    await this.ensureOutputDir();
    await fs.promises.writeFile(
      path.join(this.outputDir, 'MetaBootstrapGenerator.tsx'),
      selfComponentCode
    );
    
    console.log('✨ Self-improvement complete! Generator can now generate itself.');
    
    return;
  }

  /**
   * Generate all components from YAML files (basic mode)
   */
  async generateAllComponents(): Promise<void> {
    console.log('🔄 Generating all components from YAML definitions...');
    
    const yamlFiles = await fs.promises.readdir(this.componentsDir);
    const yamlFilesFiltered = yamlFiles.filter(file => file.endsWith('.yaml'));
    
    await this.ensureOutputDir();
    
    for (const yamlFile of yamlFilesFiltered) {
      try {
        const yamlContent = await fs.promises.readFile(
          path.join(this.componentsDir, yamlFile),
          'utf-8'
        );
        
        const component = this.generator.parseComponent(yamlContent);
        const componentCode = this.generator.generateComponentCode(component);
        
        const outputFileName = `${component.framework.charAt(0).toUpperCase()}${component.framework.slice(1)}${component.name.replace(/[^a-zA-Z0-9]/g, '')}.tsx`;
        
        await fs.promises.writeFile(
          path.join(this.outputDir, outputFileName),
          componentCode
        );
        
        console.log(`✅ Generated: ${outputFileName}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${yamlFile}:`, error);
      }
    }
  }

  /**
   * Generate with intelligent validation and regeneration loop
   */
  async generateIntelligent(): Promise<void> {
    console.log('🧠 Starting intelligent generation with validation...');
    await this.intelligentGenerator.generateAllIntelligent();
  }

  /**
   * Validate all generated components
   */
  async validateAll(): Promise<void> {
    console.log('🔍 Validating all generated components...');
    
    const results = await this.validator.validateAllGeneratedComponents();
    
    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total components: ${results.length}`);
    console.log(`   Valid components: ${results.filter(r => r.valid).length}`);
    console.log(`   Components with errors: ${results.filter(r => r.errors.length > 0).length}`);
    console.log(`   Components with warnings: ${results.filter(r => r.warnings.length > 0).length}`);
    
    results.forEach(result => {
      console.log(`\n🔸 ${result.componentName}:`);
      console.log(`   Valid: ${result.valid ? '✅' : '❌'}`);
      console.log(`   TypeScript: ${result.checks.typescriptCompiles ? '✅' : '❌'}`);
      console.log(`   React: ${result.checks.reactRenders ? '✅' : '❌'}`);
      console.log(`   Handles: ${result.checks.handlesValid ? '✅' : '❌'}`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors:`);
        result.errors.forEach(error => console.log(`     ❌ ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`   Warnings:`);
        result.warnings.forEach(warning => console.log(`     ⚠️ ${warning}`));
      }
    });
  }

  /**
   * The ultimate meta move: Generate an improved version of itself
   */
  async improveItself(): Promise<void> {
    console.log('🧠 Attempting self-improvement...');
    
    // This would analyze the current generator code,
    // identify improvements, and generate a new version
    const improvements = [
      'Add better error handling',
      'Support for custom node types',
      'Advanced parameter validation',
      'Plugin system for custom generators'
    ];
    
    console.log('🎯 Identified potential improvements:');
    improvements.forEach(improvement => console.log(`   - ${improvement}`));
    
    // For now, let's generate an enhanced YAML definition
    const enhancedYaml = `name: BootstrapGeneratorV2
framework: meta
category: tool
description: Enhanced self-improving React Flow component generator

inputs:
  - name: yaml_definition
    type: string
    required: true
    description: YAML component definition
  - name: improvement_hints
    type: string[]
    required: false
    description: Suggestions for improvements

outputs:
  - name: enhanced_component
    type: ReactComponent
    required: true
    description: Enhanced generated component
  - name: improvement_report
    type: ImprovementReport
    required: true
    description: Report of applied improvements

parameters:
  ai_enhancement_level:
    type: number
    default: 1
    min: 1
    max: 10
    description: Level of AI-driven enhancements
  auto_optimize:
    type: boolean
    default: true
    description: Enable automatic code optimization
  learn_from_usage:
    type: boolean
    default: true
    description: Learn and adapt from component usage patterns

ui:
  icon: "🧠"
  color: "#ec4899"
  position: [600, 300]`;

    await fs.promises.writeFile(
      path.join(this.componentsDir, 'meta-generator-v2.yaml'),
      enhancedYaml
    );
    
    console.log('🎉 Self-improvement iteration complete!');
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.promises.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}

// CLI interface for running the workflow
if (import.meta.url === `file://${process.argv[1]}`) {
  const workflow = new SelfImprovementWorkflow();
  
  const command = process.argv[2];
  switch (command) {
    case 'bootstrap':
      workflow.bootstrapSelf();
      break;
    case 'generate':
      workflow.generateAllComponents();
      break;
    case 'intelligent':
      workflow.generateIntelligent();
      break;
    case 'validate':
      workflow.validateAll();
      break;
    case 'improve':
      workflow.improveItself();
      break;
    case 'all':
      workflow.bootstrapSelf()
        .then(() => workflow.generateAllComponents())
        .then(() => workflow.validateAll())
        .then(() => workflow.improveItself());
      break;
    case 'full':
      workflow.bootstrapSelf()
        .then(() => workflow.generateIntelligent())
        .then(() => workflow.validateAll())
        .then(() => workflow.improveItself());
      break;
    default:
      console.log(`
🚀 AI Flow Generator - Self-Improving Component Builder

Commands:
  bootstrap    - Generate the generator's own React component
  generate     - Generate all components from YAML files (basic)
  intelligent  - Generate with validation loop and auto-fixes
  validate     - Validate all generated components
  improve      - Create an improved version of the generator
  all          - Run basic workflow (bootstrap → generate → validate → improve)
  full         - Run intelligent workflow (bootstrap → intelligent → validate → improve)

Examples:
  npm run meta-gen bootstrap     # Start the meta-generation
  npm run meta-gen intelligent   # Generate with validation loop
  npm run meta-gen validate      # Check component quality
  npm run meta-gen full          # Complete intelligent workflow
`);
  }
}