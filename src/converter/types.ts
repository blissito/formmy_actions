// Framework Component Types
export interface FrameworkComponent {
  name: string;
  framework: 'llamaindex' | 'langchain' | 'haystack' | 'generic';
  category: 'input' | 'processor' | 'output' | 'memory' | 'tool';
  inputs: FrameworkPort[];
  outputs: FrameworkPort[];
  parameters: FrameworkParameter[];
  description: string;
  documentation?: string;
}

export interface FrameworkPort {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface FrameworkParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[]; // for enum-like parameters
}

// React Flow Conversion Types
export interface ConvertedNode {
  id: string;
  type: string;
  data: {
    label: string;
    inputs: ReactFlowPort[];
    outputs: ReactFlowPort[];
    parameters: Record<string, any>;
    category: string;
    framework: string;
    originalComponent: string;
  };
  position: { x: number; y: number };
}

export interface ReactFlowPort {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

// Converter Configuration
export interface ConversionConfig {
  generateId: () => string;
  defaultPosition: { x: number; y: number };
  componentTypePrefix: string;
  includeDocumentation: boolean;
}