export type RuntimeType = 'vercel-ai' | 'langchain' | 'typescript' | 'custom' | 'ffmpeg' | 'image-generator';

export interface ExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  parameters: Record<string, any>;
  framework: string;
  componentName: string;
}

export interface ExecutionResult {
  nodeId: string;
  outputs: Record<string, any>;
  status: 'success' | 'error' | 'running';
  error?: string;
  executionTime: number;
  logs: string[];
}

export abstract class ComponentExecutor {
  abstract runtime: RuntimeType;
  abstract canExecute(context: ExecutionContext): boolean;
  abstract execute(context: ExecutionContext): Promise<ExecutionResult>;
}