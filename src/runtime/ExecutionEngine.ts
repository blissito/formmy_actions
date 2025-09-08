import type { Node, Edge } from '@xyflow/react';

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

export interface FlowExecution {
  flowId: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  results: Map<string, ExecutionResult>;
  startTime?: Date;
  endTime?: Date;
}

export abstract class ComponentExecutor {
  abstract runtime: RuntimeType;
  abstract canExecute(context: ExecutionContext): boolean;
  abstract execute(context: ExecutionContext): Promise<ExecutionResult>;
}

export class ExecutionEngine {
  private executors: Map<RuntimeType, ComponentExecutor> = new Map();
  private executions: Map<string, FlowExecution> = new Map();

  constructor() {
    this.registerBuiltinExecutors();
  }

  registerExecutor(executor: ComponentExecutor): void {
    this.executors.set(executor.runtime, executor);
  }

  async executeFlow(
    flowId: string, 
    nodes: Node[], 
    edges: Edge[], 
    inputs: Record<string, any> = {},
    onNodeStatusUpdate?: (nodeId: string, status: 'running' | 'success' | 'error', result?: any) => void
  ): Promise<FlowExecution> {
    console.log(`🚀 Starting flow execution: ${flowId}`);
    
    const execution: FlowExecution = {
      flowId,
      status: 'running',
      results: new Map(),
      startTime: new Date()
    };
    
    this.executions.set(flowId, execution);

    try {
      // 1. Build execution graph
      const executionOrder = this.buildExecutionOrder(nodes, edges);
      console.log(`📊 Execution order: ${executionOrder.map(n => n.id).join(' → ')}`);

      // 2. Execute nodes in order
      for (const node of executionOrder) {
        // Notify that we're starting execution of this node
        if (onNodeStatusUpdate) {
          onNodeStatusUpdate(node.id, 'running');
        }

        const result = await this.executeNode(node, inputs);
        execution.results.set(node.id, result);
        
        // Notify of the result
        if (onNodeStatusUpdate) {
          if (result.status === 'error') {
            onNodeStatusUpdate(node.id, 'error', { ...result, logs: result.logs });
          } else {
            onNodeStatusUpdate(node.id, 'success', { ...result.outputs, logs: result.logs });
          }
        }
        
        if (result.status === 'error') {
          execution.status = 'error';
          console.error(`❌ Node ${node.id} failed:`, result.error);
          break;
        }

        // Pass outputs to connected nodes
        inputs = { ...inputs, ...result.outputs };
        
        // Also pass node's own data for simple flow connections
        if (node.type === 'input' && node.data?.text) {
          inputs.prompt = node.data.text;
          inputs.input = node.data.text;
        }
        
        console.log(`✅ Node ${node.id} completed in ${result.executionTime}ms`);
        console.log(`📤 Available inputs for next nodes:`, inputs);
      }

      execution.status = execution.status === 'running' ? 'completed' : execution.status;
      execution.endTime = new Date();

      console.log(`🎉 Flow ${flowId} ${execution.status}`);
      
    } catch (error) {
      execution.status = 'error';
      execution.endTime = new Date();
      console.error(`💥 Flow execution failed:`, error);
    }

    return execution;
  }

  private async executeNode(
    node: Node, 
    availableInputs: Record<string, any>
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    const gatheredInputs = this.gatherNodeInputs(node, availableInputs);
    const context: ExecutionContext = {
      nodeId: node.id,
      inputs: gatheredInputs,
      parameters: node.data?.parameters || {},
      framework: String(node.data?.framework || 'custom'),
      componentName: String(node.data?.component || node.type || 'unknown')
    };

    console.log(`⚡ Executing node ${node.id} (${context.componentName})`);

    try {
      // Find appropriate executor
      const executor = this.findExecutor(context);
      if (!executor) {
        throw new Error(`No executor found for ${context.framework}:${context.componentName}`);
      }

      const result = await executor.execute(context);
      result.executionTime = Date.now() - startTime;
      
      return result;
      
    } catch (error) {
      return {
        nodeId: node.id,
        outputs: {},
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        logs: [`Error executing node: ${error}`]
      };
    }
  }

  private findExecutor(context: ExecutionContext): ComponentExecutor | undefined {
    for (const executor of this.executors.values()) {
      if (executor.canExecute(context)) {
        return executor;
      }
    }
    return undefined;
  }

  private gatherNodeInputs(node: Node, availableInputs: Record<string, any>): Record<string, any> {
    const nodeInputs: Record<string, any> = {};
    
    // Map available inputs to node's expected inputs
    if (node.data?.inputs && Array.isArray(node.data.inputs)) {
      for (const input of node.data.inputs) {
        if (availableInputs[input.name] !== undefined) {
          nodeInputs[input.name] = availableInputs[input.name];
        }
      }
    } else {
      // For nodes without explicit input definitions (like our custom nodes),
      // pass all available inputs based on node type
      if (node.type === 'agent' || node.type === 'output') {
        // Agent and Output nodes should receive all available inputs
        Object.assign(nodeInputs, availableInputs);
      } else if (node.type === 'input') {
        // Input nodes provide their own text/data
        nodeInputs.text = node.data?.text || "";
        nodeInputs.prompt = node.data?.text || "";
      }
    }
    
    return nodeInputs;
  }

  private buildExecutionOrder(nodes: Node[], edges: Edge[]): Node[] {
    // Simple topological sort
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();
    
    // Initialize
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    });
    
    // Build graph
    edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Topological sort
    const queue: string[] = [];
    const result: Node[] = [];
    
    // Start with nodes that have no dependencies
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        result.push(node);
      }
      
      // Update in-degrees of connected nodes
      adjacencyList.get(nodeId)?.forEach(targetId => {
        inDegree.set(targetId, (inDegree.get(targetId) || 0) - 1);
        if (inDegree.get(targetId) === 0) {
          queue.push(targetId);
        }
      });
    }
    
    return result;
  }

  getExecution(flowId: string): FlowExecution | undefined {
    return this.executions.get(flowId);
  }

  getAllExecutions(): FlowExecution[] {
    return Array.from(this.executions.values());
  }

  private registerBuiltinExecutors(): void {
    console.log('🔧 Registering built-in executors...');
    
    // Import and register VercelAI executor
    import('./executors/VercelAIExecutor').then(({ VercelAIExecutor }) => {
      const vercelExecutor = new VercelAIExecutor();
      this.registerExecutor(vercelExecutor);
      console.log('✅ Registered VercelAI executor');
    }).catch(error => {
      console.warn('⚠️ Failed to register VercelAI executor:', error);
    });
    
    // Register FFmpeg executor
    import('../tools/FFmpegTool').then(({ FFmpegExecutor }) => {
      const ffmpegExecutor = new FFmpegExecutor();
      this.registerExecutor(ffmpegExecutor);
      console.log('✅ Registered FFmpeg executor');
    }).catch(error => {
      console.warn('⚠️ Failed to register FFmpeg executor:', error);
    });
    
    // Register Image Generator executor
    import('../tools/ImageGeneratorTool').then(({ ImageGeneratorExecutor }) => {
      const imageExecutor = new ImageGeneratorExecutor();
      this.registerExecutor(imageExecutor);
      console.log('✅ Registered ImageGenerator executor');
    }).catch(error => {
      console.warn('⚠️ Failed to register ImageGenerator executor:', error);
    });
  }
}