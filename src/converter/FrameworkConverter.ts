import { FrameworkComponent, ConvertedNode, ConversionConfig, ReactFlowPort } from './types';

export class FrameworkConverter {
  private config: ConversionConfig;

  constructor(config: ConversionConfig) {
    this.config = config;
  }

  /**
   * Convert a framework component to React Flow node
   */
  convertComponent(component: FrameworkComponent): ConvertedNode {
    const id = this.config.generateId();
    
    const inputs: ReactFlowPort[] = component.inputs.map(input => ({
      id: `${id}-in-${input.name}`,
      name: input.name,
      type: input.type,
      required: input.required
    }));

    const outputs: ReactFlowPort[] = component.outputs.map(output => ({
      id: `${id}-out-${output.name}`,
      name: output.name,
      type: output.type,
      required: output.required
    }));

    // Create parameters object with default values
    const parameters: Record<string, any> = {};
    component.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        parameters[param.name] = param.defaultValue;
      }
    });

    return {
      id,
      type: `${this.config.componentTypePrefix}-${component.framework}-${component.category}`,
      data: {
        label: component.name,
        inputs,
        outputs,
        parameters,
        category: component.category,
        framework: component.framework,
        originalComponent: component.name
      },
      position: this.config.defaultPosition
    };
  }

  /**
   * Convert multiple components to React Flow nodes
   */
  convertMultipleComponents(components: FrameworkComponent[]): ConvertedNode[] {
    return components.map((component, index) => {
      const node = this.convertComponent(component);
      // Offset positions to avoid overlapping
      node.position = {
        x: this.config.defaultPosition.x + (index % 3) * 300,
        y: this.config.defaultPosition.y + Math.floor(index / 3) * 200
      };
      return node;
    });
  }

  /**
   * Generate React Flow node type from framework component
   */
  generateNodeType(component: FrameworkComponent): string {
    return `${this.config.componentTypePrefix}-${component.framework}-${component.category}`;
  }

  /**
   * Create a self-describing component definition for the meta generator
   */
  createSelfDescribingComponent(): FrameworkComponent {
    return {
      name: 'FrameworkConverter',
      framework: 'generic',
      category: 'processor',
      inputs: [
        {
          name: 'component_definition',
          type: 'FrameworkComponent',
          required: true,
          description: 'Framework component to convert'
        }
      ],
      outputs: [
        {
          name: 'react_flow_node',
          type: 'ConvertedNode',
          required: true,
          description: 'Converted React Flow node'
        }
      ],
      parameters: [
        {
          name: 'generateId',
          type: 'boolean',
          required: false,
          defaultValue: true,
          description: 'Whether to generate new IDs'
        },
        {
          name: 'includeDocumentation',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Include documentation in output'
        }
      ],
      description: 'Converts framework components to React Flow nodes. Meta-component that can convert itself!'
    };
  }
}