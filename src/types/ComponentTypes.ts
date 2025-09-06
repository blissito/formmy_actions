export interface ComponentYAML {
  name: string;
  framework: string;
  category: string;
  description: string;
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  parameters: Record<string, {
    type: string;
    default?: any;
    min?: number;
    max?: number;
    options?: string[];
    description?: string;
  }>;
  ui: {
    icon: string;
    color: string;
    position: [number, number];
  };
}

export interface GeneratedComponentInfo {
  name: string;
  framework: string;
  category: string;
  description: string;
  ui: {
    icon: string;
    color: string;
  };
  yamlPath: string;
  componentPath: string;
  available: boolean;
}