import OpenAI from 'openai';
import { ComponentExecutor, type ExecutionContext as OldExecutionContext, type ExecutionResult as OldExecutionResult, type RuntimeType } from '../ComponentExecutor';
import { ExecutorFramework, type ToolDefinition, type ValidationResult, type ExecutionContext, type ExecutionResult, type StreamingEvent } from '../ExecutorFramework';

export class VercelAIExecutor extends ExecutorFramework {
  readonly name = 'vercel-ai'
  readonly version = '1.0.0'
  readonly displayName = 'Vercel AI SDK'

  async getAvailableTools(): Promise<ToolDefinition[]> {
    return [
      {
        id: 'input',
        name: 'Entrada de Texto',
        description: 'Ingresa tu texto o datos aquí',
        framework: 'vercel-ai',
        category: 'Input/Output',
        icon: '✏️',
        defaultConfig: {
          text: '',
          placeholder: 'Escribe tu prompt aquí...'
        }
      },
      {
        id: 'agent',
        name: 'Agente IA',
        description: 'Procesamiento inteligente con IA',
        framework: 'vercel-ai',
        category: 'visual_agents',
        icon: '🤖',
        defaultConfig: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
          stream: false,
          systemPrompt: 'You are a helpful AI assistant.'
        }
      },
      {
        id: 'output',
        name: 'Resultado',
        description: 'Salida final del procesamiento',
        framework: 'vercel-ai',
        category: 'Input/Output',
        icon: '✨',
        defaultConfig: {}
      },
      {
        id: 'ffmpeg',
        name: 'FFmpeg Video',
        description: 'Crear videos con FFmpeg',
        framework: 'vercel-ai',
        category: 'Media Tools',
        icon: '🎬',
        defaultConfig: {
          inputFormat: 'images',
          outputFormat: 'mp4',
          fps: 30,
          quality: 'high'
        }
      },
      {
        id: 'imageGenerator',
        name: 'Generador de Imágenes',
        description: 'Genera imágenes con AI',
        framework: 'vercel-ai',
        category: 'Media Tools',
        icon: '🎨',
        defaultConfig: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard'
        }
      },
      {
        id: 'prompt',
        name: 'Plantilla de Prompt',
        description: 'Prompt estructurado con variables',
        framework: 'vercel-ai',
        category: 'Utilities',
        icon: '📋',
        defaultConfig: {
          template: 'Hello {{name}}, how can I help you with {{topic}}?',
          variables: {}
        }
      },
      {
        id: 'function',
        name: 'Función Personalizada',
        description: 'Ejecuta funciones personalizadas',
        framework: 'vercel-ai',
        category: 'Utilities',
        icon: '⚙️',
        defaultConfig: {
          functionName: 'transform',
          code: 'return { processed: true, input: data };'
        }
      },
      {
        id: 'tool',
        name: 'Tool',
        description: 'Herramientas para agentes IA',
        framework: 'vercel-ai',
        category: 'Utilities',
        icon: '🛠️',
        defaultConfig: {
          toolName: 'custom_tool',
          description: 'Una herramienta personalizada',
          parameters: {}
        }
      }
    ]
  }

  validateConfig(toolId: string, config: any): ValidationResult {
    const tools = this.getAvailableTools();
    // Note: This is async but we need sync validation for now
    // In a real implementation, we might cache tool definitions
    
    switch (toolId) {
      case 'agent':
        if (!config.model) {
          return { valid: false, errors: ['Model is required'] };
        }
        if (config.temperature < 0 || config.temperature > 2) {
          return { valid: false, errors: ['Temperature must be between 0 and 2'] };
        }
        return { valid: true };
      
      case 'input':
      case 'output':
        return { valid: true }; // Input/Output nodes are always valid
      
      case 'prompt':
        if (!config.template) {
          return { valid: false, errors: ['Template is required'] };
        }
        return { valid: true };
      
      case 'function':
        if (!config.functionName) {
          return { valid: false, errors: ['Function name is required'] };
        }
        return { valid: true };
      
      case 'tool':
        if (!config.toolName) {
          return { valid: false, errors: ['Tool name is required'] };
        }
        return { valid: true };
      
      case 'ffmpeg':
        return { valid: true }; // FFmpeg tools are always valid
        
      case 'imageGenerator':
        return { valid: true }; // Image generator tools are always valid
      
      default:
        return { valid: true, warnings: ['Unknown tool, using default validation'] };
    }
  }


  private getGlobalConfig() {
    try {
      const saved = localStorage.getItem('ai-flow-global-config');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  canExecute(context: ExecutionContext): boolean {
    const nodeType = context.componentName.toLowerCase();
    const framework = context.framework.toLowerCase();

    // Handle agent nodes and vercel-ai specific components
    return nodeType === 'agent' ||
           framework === 'vercel-ai' ||
           nodeType.includes('agent') ||
           nodeType === 'openai' ||
           nodeType === 'anthropic';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(`Executing Vercel AI component: ${context.componentName}`);
      
      // Handle different component types
      switch (context.componentName) {
        case 'input':
          return this.executeInputNode(context, logs);
        case 'output':
          return this.executeOutputNode(context, logs);
        case 'agent':
        case 'AgentNode':
        case 'ChatOpenAI':
        case 'GPT4':
          return await this.executeRealVercelAI(context, logs);
        case 'prompt':
          return this.executePromptNode(context, logs);
        case 'function':
          return this.executeFunctionNode(context, logs);
        case 'tool':
          return this.executeToolNode(context, logs);
        default:
          // For any unknown component, try AI execution first, fallback to generic
          if (context.framework === 'vercel-ai' || context.framework === 'custom') {
            return await this.executeRealVercelAI(context, logs);
          } else {
            return this.executeGenericNode(context, logs);
          }
      }
      
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
    context: OldExecutionContext, 
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
    
    // Obtener el prompt desde los inputs - debug completo
    const prompt = inputs.prompt || inputs.input || inputs.message || inputs.text || '';
    const systemPrompt = inputs.system || config.systemPrompt;
    
    
    if (!prompt || prompt.trim() === '') {
      // En lugar de throw, crear una respuesta mock informativa
      logs.push('⚠️ No prompt provided, using default message');
      const mockPrompt = 'Hello! Please provide a message or question.';
      
      return {
        success: true,
        result: {
          response: `Mock AI Response: I didn't receive a prompt to respond to. Please connect an Input node with text to this Agent node.`,
          tokens: { prompt: 0, completion: 0, total: 0 },
          finishReason: 'stop',
          model: config.model
        },
        logs,
        metadata: {
          nodeId: context.nodeId,
          executionTime: 0
        }
      };
    }

    logs.push(`📝 Using model: ${config.model}`);
    logs.push(`🌡️ Temperature: ${config.temperature}`);  
    logs.push(`🌊 Streaming: ${config.stream}`);
    // Get API key from global config  
    const globalConfig = this.getGlobalConfig();
    const apiKey = globalConfig.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY;
    
    logs.push(`🔑 API Key available: ${apiKey ? 'Yes' : 'No'}`);
    logs.push(`📝 Prompt: "${prompt}"`);

    try {
      // Check if there's an external API endpoint for this component
      const externalEndpoint = parameters.apiEndpoint || import.meta.env.VITE_AI_AGENT_ENDPOINT;
      
      if (externalEndpoint) {
        // Distributed execution via fetch
        return await this.executeDistributed(externalEndpoint, context, logs);
      } else {
        // Local execution with Vercel AI SDK
        if (config.stream) {
          const result = await this.executeStreaming(prompt, systemPrompt, config, logs);
          return {
            success: true,
            result: {
              response: result.response,
              stream: result.stream,
              tokens: result.tokens,
              finishReason: result.finishReason,
              model: config.model
            },
            logs,
            metadata: {
              nodeId: context.nodeId,
              executionTime: 0
            }
          };
        } else {
          const result = await this.executeGenerate(prompt, systemPrompt, config, logs);
          return {
            success: true,
            result: {
              response: result.response,
              tokens: result.tokens,
              finishReason: result.finishReason,
              model: config.model
            },
            logs,
            metadata: {
              nodeId: context.nodeId,
              executionTime: 0
            }
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
        success: true,
        result: result.outputs || result,
        logs: [...logs, ...(result.logs || [])],
        metadata: {
          nodeId: context.nodeId,
          executionTime: result.executionTime || 0
        }
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
    const apiKey = globalConfig.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      logs.push('⚠️ No OpenAI API key found, using mock response');
      return {
        response: `Mock AI Response for: "${prompt}"\n\nThis is a simulated response because no OpenAI API key was provided. To get real responses:\n1. Click the settings button ⚙️ in the sidebar\n2. Add your OpenAI API key\n3. Run the flow again`,
        tokens: { prompt: 0, completion: 0, total: 0 },
        finishReason: 'stop'
      };
    }
    
    
    // Create OpenAI client for browser usage
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true 
    });
    
    const result = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const responseText = result.choices[0]?.message?.content || '';
    logs.push(`✅ Generated ${responseText.length} characters`);

    return {
      response: responseText,
      tokens: {
        prompt: result.usage?.prompt_tokens || 0,
        completion: result.usage?.completion_tokens || 0,
        total: result.usage?.total_tokens || 0
      },
      finishReason: result.choices[0]?.finish_reason || 'stop'
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
    const apiKey = globalConfig.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      logs.push('⚠️ No OpenAI API key found, using mock response');
      return {
        response: `Mock AI Response for: "${prompt}"\n\nThis is a simulated response because no OpenAI API key was provided. To get real responses:\n1. Click the settings button ⚙️ in the sidebar\n2. Add your OpenAI API key\n3. Run the flow again`,
        stream: [`Mock AI Response for: "${prompt}"`, `\n\nThis is a simulated response...`],
        tokens: { prompt: 0, completion: 0, total: 0 },
        finishReason: 'stop'
      };
    }
    
    
    // Create OpenAI client for browser usage
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true 
    });
    
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    });

    let fullResponse = '';
    const chunks: string[] = [];

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        chunks.push(content);
      }
    }

    logs.push(`📝 Streamed ${chunks.length} chunks, total: ${fullResponse.length} characters`);

    return {
      response: fullResponse,
      stream: chunks,
      tokens: {
        prompt: 0, // Usage not available in streaming mode
        completion: 0,
        total: 0
      },
      finishReason: 'stop'
    };
  }

  private executeInputNode(context: OldExecutionContext, logs: string[]): ExecutionResult {
    logs.push('📝 Processing input node...');
    
    // Get text from the node's inputs
    const text = context.inputs.text || context.inputs.prompt || context.parameters.text || '';
    
    logs.push(`📤 Input text: "${text}"`);
    
    return {
      success: true,
      result: {
        prompt: text,
        input: text,
        text: text
      },
      logs,
      metadata: {
        nodeId: context.nodeId,
        executionTime: 0
      }
    };
  }

  private executeOutputNode(context: OldExecutionContext, logs: string[]): ExecutionResult {
    logs.push('📥 Processing output node...');
    
    // Collect all available inputs as the result
    const result = context.inputs.response || context.inputs.output || context.inputs.result || context.inputs;
    
    logs.push(`📊 Received result: ${typeof result === 'string' ? result.substring(0, 100) + '...' : JSON.stringify(result).substring(0, 100) + '...'}`);
    
    return {
      success: true,
      result: {
        result: result,
        display: result
      },
      logs,
      metadata: {
        nodeId: context.nodeId,
        executionTime: 0
      }
    };
  }

  private executePromptNode(context: OldExecutionContext, logs: string[]): ExecutionResult {
    logs.push('📝 Processing prompt node...');
    
    const template = context.inputs.template || context.parameters.template || '';
    const variables = context.inputs.variables || context.parameters.variables || {};
    
    // Simple template replacement
    let prompt = template;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    logs.push(`📤 Generated prompt: "${prompt}"`);
    
    return {
      nodeId: context.nodeId,
      outputs: {
        prompt: prompt,
        text: prompt,
        result: prompt
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private executeFunctionNode(context: ExecutionContext, logs: string[]): ExecutionResult {
    logs.push('⚙️ Processing function node...');
    
    const functionName = context.parameters.functionName || 'generic';
    const inputData = context.inputs.data || context.inputs.input || {};
    
    logs.push(`🔧 Function: ${functionName}`);
    logs.push(`📥 Input: ${JSON.stringify(inputData).substring(0, 100)}...`);
    
    // Simple function execution simulation
    let result;
    switch (functionName) {
      case 'transform':
        result = { transformed: true, data: inputData, timestamp: new Date().toISOString() };
        break;
      case 'validate':
        result = { valid: true, data: inputData };
        break;
      case 'format':
        result = { formatted: JSON.stringify(inputData, null, 2) };
        break;
      default:
        result = { processed: true, function: functionName, input: inputData };
    }
    
    logs.push(`📤 Function result: ${JSON.stringify(result).substring(0, 100)}...`);
    
    return {
      nodeId: context.nodeId,
      outputs: {
        result: result,
        output: result,
        data: result
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private executeToolNode(context: ExecutionContext, logs: string[]): ExecutionResult {
    logs.push('🔨 Processing tool node...');
    
    const toolName = context.parameters.toolName || context.parameters.name || 'generic_tool';
    const action = context.parameters.action || 'execute';
    const input = context.inputs.input || context.inputs.data || {};
    
    logs.push(`🛠️ Tool: ${toolName}, Action: ${action}`);
    
    const result = {
      tool: toolName,
      action: action,
      result: `Tool ${toolName} executed ${action} successfully`,
      input: input,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    logs.push(`✅ Tool execution completed`);
    
    return {
      nodeId: context.nodeId,
      outputs: {
        result: result,
        tool_output: result,
        data: result
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private executeGenericNode(context: ExecutionContext, logs: string[]): ExecutionResult {
    logs.push(`🔧 Processing generic node: ${context.componentName}`);
    
    const inputKeys = Object.keys(context.inputs);
    const paramKeys = Object.keys(context.parameters);
    
    logs.push(`📥 Inputs: ${inputKeys.join(', ')}`);
    logs.push(`⚙️ Parameters: ${paramKeys.join(', ')}`);
    
    const result = {
      component: context.componentName,
      framework: context.framework,
      inputs_processed: inputKeys,
      parameters_used: paramKeys,
      result: `Generic node ${context.componentName} executed successfully`,
      timestamp: new Date().toISOString()
    };
    
    return {
      nodeId: context.nodeId,
      outputs: {
        result: result,
        output: result,
        data: result
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }
}