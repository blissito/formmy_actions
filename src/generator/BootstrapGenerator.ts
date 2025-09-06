import yaml from 'js-yaml';
import type { Node } from '@xyflow/react';
import type { ComponentYAML } from '../types/ComponentTypes';

export class BootstrapGenerator {
  /**
   * Parse YAML component definition
   */
  parseComponent(yamlString: string): ComponentYAML {
    try {
      return yaml.load(yamlString) as ComponentYAML;
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error}`);
    }
  }

  /**
   * Generate React Flow node from YAML component
   */
  generateReactFlowNode(component: ComponentYAML, id?: string): Node {
    const nodeId = id || `${component.framework}-${component.name.toLowerCase()}-${Date.now()}`;
    
    return {
      id: nodeId,
      type: 'custom', // We'll create a custom node type
      position: { x: component.ui.position[0], y: component.ui.position[1] },
      data: {
        label: `${component.ui.icon} ${component.name}`,
        component: component.name,
        framework: component.framework,
        category: component.category,
        description: component.description,
        inputs: component.inputs,
        outputs: component.outputs,
        parameters: this.initializeParameters(component.parameters),
        ui: component.ui
      },
      style: {
        background: 'white',
        border: `2px solid ${component.ui.color}`,
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        minWidth: '200px',
        padding: '10px'
      }
    };
  }

  /**
   * Initialize parameters with default values
   */
  private initializeParameters(parameterDefs: ComponentYAML['parameters']): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const [key, def] of Object.entries(parameterDefs)) {
      params[key] = def.default;
    }
    
    return params;
  }

  /**
   * Generate TypeScript component code
   */
  generateComponentCode(component: ComponentYAML): string {
    const componentName = `${component.framework.charAt(0).toUpperCase()}${component.framework.slice(1)}${component.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    return `// Generated from ${component.framework}-${component.name.toLowerCase()}.yaml
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface ${componentName}Props {
  data: {
    label: string;
    parameters: {${Object.entries(component.parameters).map(([key, def]) => 
      `\n      ${key}: ${def.type === 'number' ? 'number' : def.type === 'boolean' ? 'boolean' : 'string'};`
    ).join('')}
    };
  };
}

export const ${componentName}: React.FC<${componentName}Props> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2" style={{ borderColor: '${component.ui.color}' }}>
      ${component.inputs.map((input, i) => 
        `<Handle type="target" position={Position.Left} id="${input.name}" style={{ top: ${20 + i * 25} }} />`
      ).join('\n      ')}
      
      <div className="flex">
        <div className="text-lg">${component.ui.icon}</div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">${component.description}</div>
        </div>
      </div>

      ${component.outputs.map((output, i) => 
        `<Handle type="source" position={Position.Right} id="${output.name}" style={{ top: ${20 + i * 25} }} />`
      ).join('\n      ')}
    </div>
  );
};
`;
  }

  /**
   * The meta part: Create YAML definition for the generator itself!
   */
  createSelfDefinition(): string {
    return `name: BootstrapGenerator
framework: meta
category: tool
description: Generates React Flow components from YAML definitions

inputs:
  - name: yaml_definition
    type: string
    required: true
    description: YAML component definition
  - name: target_framework
    type: string
    required: false
    description: Target framework filter

outputs:
  - name: react_component
    type: ReactComponent
    required: true
    description: Generated React component
  - name: flow_node
    type: ReactFlowNode
    required: true
    description: React Flow node definition

parameters:
  generate_typescript:
    type: boolean
    default: true
    description: Generate TypeScript instead of JavaScript
  include_tests:
    type: boolean
    default: false
    description: Generate test files
  output_directory:
    type: string
    default: "./src/components"
    description: Output directory for generated files

ui:
  icon: "⚡"
  color: "#8b5cf6"
  position: [100, 300]`;
  }
}