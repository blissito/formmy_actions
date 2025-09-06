import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ComponentExecutor, type ExecutionContext, type ExecutionResult, type RuntimeType } from '../ExecutionEngine';

export class VercelAIExecutor extends ComponentExecutor {
  runtime: RuntimeType = 'vercel-ai';

  private getGlobalConfig() {
    try {
      const saved = localStorage.getItem('ai-flow-global-config');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  canExecute(context: ExecutionContext): boolean {
    return context.framework === 'vercel-ai' || 
           context.componentName === 'agent' ||
           context.componentName === 'AgentNode' ||
           context.componentName === 'ChatOpenAI' ||
           context.componentName === 'GPT4' ||
           context.componentName === 'input' ||
           context.componentName === 'output';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(`Executing Vercel AI component: ${context.componentName}`);
      
      // Handle simple input/output nodes
      if (context.componentName === 'input') {
        return this.executeInputNode(context, logs);
      } else if (context.componentName === 'output') {
        return this.executeOutputNode(context, logs);
      }
      
      // Route to real Vercel AI execution for agent nodes
      return await this.executeRealVercelAI(context, logs);
      
    } catch (error) {
      return {
        nodeId: context.nodeId,
        outputs: {},
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        logs
      };
    }
  }

  private async executeRealVercelAI(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push(`🤖 Executing distributed Vercel AI: ${context.componentName}`);
    
    const { inputs, parameters } = context;
    
    // Configuración del agente desde parameters o defaults
    const config = {
      model: parameters.model || 'gpt-3.5-turbo',
      temperature: parameters.temperature || 0.7,
      maxTokens: parameters.maxTokens || 1000,
      stream: parameters.stream || false,
      systemPrompt: parameters.systemPrompt || 'You are a helpful AI assistant.',
    };
    
    // Obtener el prompt desde los inputs
    const prompt = inputs.prompt || inputs.input || inputs.message || '';
    const systemPrompt = inputs.system || config.systemPrompt;
    
    if (!prompt) {
      throw new Error('No prompt provided to AI agent');
    }

    logs.push(`📝 Using model: ${config.model}`);
    logs.push(`🌡️ Temperature: ${config.temperature}`);
    logs.push(`📊 Max tokens: ${config.maxTokens}`);
    logs.push(`🌊 Streaming: ${config.stream}`);

    try {
      // Check if there's an external API endpoint for this component
      const externalEndpoint = parameters.apiEndpoint || process.env.VITE_AI_AGENT_ENDPOINT;
      
      if (externalEndpoint) {
        // Distributed execution via fetch
        return await this.executeDistributed(externalEndpoint, context, logs);
      } else {
        // Local execution with Vercel AI SDK
        if (config.stream) {
          const result = await this.executeStreaming(prompt, systemPrompt, config, logs);
          return {
            nodeId: context.nodeId,
            outputs: {
              response: result.response,
              stream: result.stream,
              tokens: result.tokens,
              finishReason: result.finishReason,
              model: config.model
            },
            status: 'success',
            executionTime: 0,
            logs
          };
        } else {
          const result = await this.executeGenerate(prompt, systemPrompt, config, logs);
          return {
            nodeId: context.nodeId,
            outputs: {
              response: result.response,
              tokens: result.tokens,
              finishReason: result.finishReason,
              model: config.model
            },
            status: 'success',
            executionTime: 0,
            logs
          };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Vercel AI execution failed: ${errorMessage}`);
    }
  }

  private async executeDistributed(
    endpoint: string,
    context: ExecutionContext,
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push(`🌐 Making distributed API call to: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Component-Type': 'vercel-ai',
          'X-Node-Id': context.nodeId
        },
        body: JSON.stringify({
          inputs: context.inputs,
          parameters: context.parameters,
          nodeId: context.nodeId,
          componentName: context.componentName
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      logs.push(`✅ Distributed execution completed`);
      
      return {
        nodeId: context.nodeId,
        outputs: result.outputs || result,
        status: result.status || 'success',
        executionTime: result.executionTime || 0,
        logs: [...logs, ...(result.logs || [])]
      };

    } catch (error) {
      logs.push(`❌ Distributed execution failed: ${error}`);
      throw error;
    }
  }

  private async executeGenerate(
    prompt: string, 
    systemPrompt: string, 
    config: any, 
    logs: string[]
  ) {
    logs.push(`🎯 Generating text response...`);
    
    // Get API key from global config
    const globalConfig = this.getGlobalConfig();
    const apiKey = globalConfig.openaiApiKey || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set it in Global Settings.');
    }
    
    
    process.env.OPENAI_API_KEY = apiKey;
    const model = openai(config.model);
    
    const result = await generateText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
    });

    logs.push(`✅ Generated ${result.text.length} characters`);

    return {
      response: result.text,
      tokens: {
        prompt: result.usage?.inputTokens || 0,
        completion: result.usage?.outputTokens || 0,
        total: result.usage?.totalTokens || 0
      },
      finishReason: result.finishReason
    };
  }

  private async executeStreaming(
    prompt: string, 
    systemPrompt: string, 
    config: any, 
    logs: string[]
  ) {
    logs.push(`🌊 Starting streaming response...`);
    
    // Get API key from global config
    const globalConfig = this.getGlobalConfig();
    const apiKey = globalConfig.openaiApiKey || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set it in Global Settings.');
    }
    
    
    process.env.OPENAI_API_KEY = apiKey;
    const model = openai(config.model);
    
    const stream = await streamText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
    });

    let fullResponse = '';
    const chunks: string[] = [];

    for await (const chunk of stream.textStream) {
      fullResponse += chunk;
      chunks.push(chunk);
    }

    const usage = await stream.usage;

    logs.push(`📝 Streamed ${chunks.length} chunks, total: ${fullResponse.length} characters`);

    return {
      response: fullResponse,
      stream: chunks,
      tokens: {
        prompt: usage?.inputTokens || 0,
        completion: usage?.outputTokens || 0,
        total: usage?.totalTokens || 0
      },
      finishReason: 'stop'
    };
  }

  private executeInputNode(context: ExecutionContext, logs: string[]): ExecutionResult {
    logs.push('📝 Processing input node...');
    
    // Get text from the node's inputs
    const text = context.inputs.text || context.inputs.prompt || context.parameters.text || '';
    
    logs.push(`📤 Input text: "${text}"`);
    
    return {
      nodeId: context.nodeId,
      outputs: {
        prompt: text,
        input: text,
        text: text
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private executeOutputNode(context: ExecutionContext, logs: string[]): ExecutionResult {
    logs.push('📥 Processing output node...');
    
    // Collect all available inputs as the result
    const result = context.inputs.response || context.inputs.output || context.inputs.result || context.inputs;
    
    logs.push(`📊 Received result: ${typeof result === 'string' ? result.substring(0, 100) + '...' : JSON.stringify(result).substring(0, 100) + '...'}`);
    
    return {
      nodeId: context.nodeId,
      outputs: {
        result: result,
        display: result
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }
}