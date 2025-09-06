// Tipos base para configuración de nodos AI

export interface NodeInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'json' | 'array';
  required: boolean;
  description?: string;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
}

export interface NodeOutput {
  name: string;
  type: 'string' | 'object' | 'stream' | 'array' | 'file';
  description?: string;
}

export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  default?: any;
  required?: boolean;
  description?: string;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
}

// Configuración específica para cada tipo de nodo
export interface InputNodeConfig {
  type: 'input';
  inputs: [];
  outputs: NodeOutput[];
  parameters: NodeParameter[];
  data: {
    content?: string;
    placeholder?: string;
  };
}

export interface AgentNodeConfig {
  type: 'agent';
  inputs: NodeInput[];
  outputs: NodeOutput[];
  parameters: NodeParameter[];
  data: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    tools?: string[];
  };
}

export interface OutputNodeConfig {
  type: 'output';
  inputs: NodeInput[];
  outputs: [];
  parameters: NodeParameter[];
  data: {
    format?: 'text' | 'json' | 'html' | 'markdown';
    saveToFile?: boolean;
    fileName?: string;
  };
}

export interface PromptNodeConfig {
  type: 'prompt';
  inputs: NodeInput[];
  outputs: NodeOutput[];
  parameters: NodeParameter[];
  data: {
    template?: string;
    variables?: Record<string, string>;
    instructions?: string;
  };
}

export interface FunctionNodeConfig {
  type: 'function';
  inputs: NodeInput[];
  outputs: NodeOutput[];
  parameters: NodeParameter[];
  data: {
    functionName?: string;
    code?: string;
    runtime?: 'javascript' | 'python' | 'typescript';
    dependencies?: string[];
  };
}

// Unión de todos los tipos de configuración
export type NodeConfig = 
  | InputNodeConfig 
  | AgentNodeConfig 
  | OutputNodeConfig 
  | PromptNodeConfig 
  | FunctionNodeConfig;

// Datos extendidos para React Flow
export interface ExtendedNodeData {
  label: string;
  config: NodeConfig;
  execution?: {
    status: 'idle' | 'running' | 'completed' | 'error';
    result?: any;
    error?: string;
    startTime?: Date;
    endTime?: Date;
  };
  ui: {
    icon: React.ComponentType;
    color: string;
    gradient: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  };
}

// Definiciones específicas para cada tipo de nodo según Vercel AI SDK
export const NODE_DEFINITIONS = {
  input: {
    inputs: [],
    outputs: [
      { name: 'text', type: 'string' as const, description: 'Texto de entrada' }
    ],
    parameters: [
      {
        name: 'placeholder',
        type: 'string' as const,
        default: 'Ingresa tu texto aquí...',
        description: 'Texto de placeholder'
      }
    ]
  },
  
  agent: {
    inputs: [
      { name: 'prompt', type: 'string' as const, required: true, description: 'Prompt de entrada' },
      { name: 'context', type: 'string' as const, required: false, description: 'Contexto adicional' }
    ],
    outputs: [
      { name: 'response', type: 'string' as const, description: 'Respuesta del agente' },
      { name: 'usage', type: 'object' as const, description: 'Estadísticas de uso' }
    ],
    parameters: [
      {
        name: 'model',
        type: 'select' as const,
        default: 'gpt-3.5-turbo',
        options: [
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' }
        ],
        description: 'Modelo de lenguaje a utilizar'
      },
      {
        name: 'temperature',
        type: 'number' as const,
        default: 0.7,
        min: 0,
        max: 2,
        step: 0.1,
        description: 'Creatividad del modelo'
      },
      {
        name: 'maxTokens',
        type: 'number' as const,
        default: 1000,
        min: 1,
        max: 4000,
        description: 'Máximo número de tokens'
      }
    ]
  },
  
  output: {
    inputs: [
      { name: 'data', type: 'string' as const, required: true, description: 'Datos a mostrar' }
    ],
    outputs: [],
    parameters: [
      {
        name: 'format',
        type: 'select' as const,
        default: 'text',
        options: [
          { label: 'Texto', value: 'text' },
          { label: 'JSON', value: 'json' },
          { label: 'HTML', value: 'html' },
          { label: 'Markdown', value: 'markdown' }
        ],
        description: 'Formato de salida'
      }
    ]
  },
  
  prompt: {
    inputs: [
      { name: 'variables', type: 'json' as const, required: false, description: 'Variables del template' }
    ],
    outputs: [
      { name: 'prompt', type: 'string' as const, description: 'Prompt generado' }
    ],
    parameters: [
      {
        name: 'template',
        type: 'string' as const,
        default: 'Eres un asistente útil. {{input}}',
        description: 'Template del prompt'
      }
    ]
  },
  
  function: {
    inputs: [
      { name: 'input', type: 'json' as const, required: true, description: 'Datos de entrada' }
    ],
    outputs: [
      { name: 'output', type: 'json' as const, description: 'Resultado de la función' }
    ],
    parameters: [
      {
        name: 'functionName',
        type: 'string' as const,
        default: 'processData',
        description: 'Nombre de la función'
      },
      {
        name: 'runtime',
        type: 'select' as const,
        default: 'javascript',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Python', value: 'python' }
        ],
        description: 'Runtime de ejecución'
      }
    ]
  }
};