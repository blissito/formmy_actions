import { ExecutorFramework, type ToolDefinition, type ValidationResult, type ExecutionContext, type ExecutionResult, type StreamingEvent } from '../ExecutorFramework';

export class LlamaIndexExecutor extends ExecutorFramework {
  readonly name = 'llamaindex'
  readonly version = '1.0.0'
  readonly displayName = 'LlamaIndex TS'

  async getAvailableTools(): Promise<ToolDefinition[]> {
    return [
      // Agent Flow v2 - Start Node
      {
        id: 'agent-start',
        name: 'Start',
        description: 'Starting point of Agent Flow v2 workflow',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🚀',
        defaultConfig: {
          inputType: 'chatInput', // chatInput, formInput
          formTitle: 'Agent Flow Input',
          formDescription: 'Provide input to start the agent workflow',
          stateStructure: {
            messages: {
              operation: 'append',
              defaultValue: []
            },
            context: {
              operation: 'replace',
              defaultValue: null
            }
          }
        }
      },

      // Agent Flow v2 - Agent Node
      {
        id: 'agent-node',
        name: 'Agent',
        description: 'Sequential agent with tools and state management',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🤖',
        defaultConfig: {
          // Agent Configuration
          agentName: 'Agent',
          agentDescription: 'Specialized agent in the workflow',

          // System Prompt
          systemMessage: 'You are a helpful AI assistant specialized in this workflow step. Use available tools when needed.',

          // Tools Configuration
          tools: [
            {
              name: 'calculator',
              description: 'Perform mathematical calculations',
              enabled: true
            },
            {
              name: 'web_search',
              description: 'Search web for information',
              enabled: false
            },
            {
              name: 'code_interpreter',
              description: 'Execute code dynamically',
              enabled: false
            }
          ],

          // State Management
          stateInput: ['messages', 'context'],
          stateOutput: {
            messages: 'append', // append agent response
            result: 'replace'   // replace with agent output
          },

          // Tool Approval
          requireToolApproval: false,
          approvalPrompt: 'You are about to execute {toolName}. Do you want to proceed?',

          // Advanced Settings
          maxIterations: 15,
          recursionLimit: 100,
          streaming: true,
          interruptBefore: false, // Interrupt before this node
          interruptAfter: false   // Interrupt after this node
        }
      },

      // Agent Flow v2 - State Node
      {
        id: 'agent-state',
        name: 'State',
        description: 'Centralized state management for Agent Flow v2',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '💾',
        defaultConfig: {
          stateStructure: [
            {
              key: 'messages',
              operation: 'append',
              defaultValue: []
            },
            {
              key: 'context',
              operation: 'replace',
              defaultValue: null
            },
            {
              key: 'results',
              operation: 'append',
              defaultValue: []
            }
          ]
        }
      },

      // Agent Flow v2 - Tool Node
      {
        id: 'tool-node',
        name: 'Tool',
        description: 'Execute specific tools in Agent Flow v2',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🔧',
        defaultConfig: {
          toolType: 'calculator', // calculator, web_search, code_interpreter
          toolConfig: {
            timeout: 30000,
            retries: 3
          },
          stateInput: ['messages'],
          stateOutput: {
            toolResults: 'append',
            lastResult: 'replace'
          }
        }
      },

      // Agent Flow v2 - Condition Node
      {
        id: 'condition-node',
        name: 'Condition',
        description: 'Conditional routing in Agent Flow v2',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🔀',
        defaultConfig: {
          conditionType: 'javascript', // javascript, llm
          condition: 'return state.messages.length > 5;',
          llmCondition: 'Should we continue based on the conversation?',
          trueRoute: 'continue',
          falseRoute: 'end'
        }
      },

      // Agent Flow v2 - Loop Node
      {
        id: 'loop-node',
        name: 'Loop',
        description: 'Iterative processing in Agent Flow v2',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🔄',
        defaultConfig: {
          maxIterations: 10,
          breakCondition: 'return state.completed === true;',
          loopTarget: 'agent-node'
        }
      },

      // Agent Flow v2 - End Node
      {
        id: 'agent-end',
        name: 'End',
        description: 'End point of Agent Flow v2 workflow',
        framework: 'llamaindex',
        category: 'Sequential Agents',
        icon: '🏁',
        defaultConfig: {
          outputFormat: 'text', // text, json, markdown
          finalState: ['messages', 'results']
        }
      },

      // Multi-Agent Workflows
      {
        id: 'multi-agent-workflow',
        name: 'Multi-Agent Workflow',
        description: 'Orchestrate multiple specialized agents',
        framework: 'llamaindex',
        category: 'Workflows',
        icon: '🤖',
        defaultConfig: {
          agents: [
            {
              name: 'analyzer',
              description: 'Analyzes input data',
              tools: []
            },
            {
              name: 'processor',
              description: 'Processes analyzed data',
              tools: []
            }
          ],
          rootAgent: 'analyzer'
        }
      },
      {
        id: 'natural-language-workflow',
        name: 'Natural Language Workflow',
        description: 'Define workflows using natural language',
        framework: 'llamaindex',
        category: 'Workflows',
        icon: '📝',
        defaultConfig: {
          instructions: 'Process the input data and return a summary',
          events: ['start', 'process', 'complete'],
          tools: []
        }
      },
      {
        id: 'rag-pipeline',
        name: 'RAG Pipeline',
        description: 'Retrieval-Augmented Generation workflow',
        framework: 'llamaindex',
        category: 'Workflows',
        icon: '📚',
        defaultConfig: {
          retriever: 'vector-store',
          embedModel: 'text-embedding-ada-002',
          llmModel: 'gpt-3.5-turbo',
          topK: 5
        }
      },
      
      // Tools & Data Sources - Following Flowise pattern exactly
      {
        id: 'calculator-tool',
        name: 'Calculator',
        description: 'Perform calculations on response',
        framework: 'llamaindex',
        category: 'Tools',
        icon: '🧮',
        defaultConfig: {
          precision: 10
        }
      },
      {
        id: 'google-search-tool',
        name: 'Google Search API',
        description: 'A wrapper around Google Search. Useful when you need to answer questions about current events.',
        framework: 'llamaindex',
        category: 'Tools',
        icon: '🔍',
        defaultConfig: {
          googleCSEId: '',
          googleAPIKey: '',
          maxResults: 5
        }
      },
      {
        id: 'web-scraper-tool',
        name: 'Web Scraper',
        description: 'Extract and summarize content from web pages',
        framework: 'llamaindex',
        category: 'Tools',
        icon: '🕷️',
        defaultConfig: {
          userAgent: 'formmy-actions-bot/1.0',
          timeout: 10000,
          maxContentLength: 50000
        }
      },
      {
        id: 'code-interpreter',
        name: 'Code Interpreter',
        description: 'Execute Python/JavaScript code dynamically',
        framework: 'llamaindex',
        category: 'Tools',
        icon: '💻',
        defaultConfig: {
          language: 'python',
          timeout: 30000,
          allowedModules: ['pandas', 'numpy', 'matplotlib']
        }
      },
      {
        id: 'wikipedia-tool',
        name: 'Wikipedia Search',
        description: 'Search and retrieve Wikipedia articles',
        framework: 'llamaindex',
        category: 'Data Sources',
        icon: '🌐',
        defaultConfig: {
          language: 'en',
          topK: 3,
          summaryLength: 500
        }
      },
      {
        id: 'web-scraper-tool',
        name: 'Web Scraper',
        description: 'Extract content from web pages',
        framework: 'llamaindex',
        category: 'Data Sources',
        icon: '🕷️',
        defaultConfig: {
          userAgent: 'LlamaIndex-Bot',
          timeout: 10000,
          extractText: true,
          extractLinks: false
        }
      },
      {
        id: 'google-drive-tool',
        name: 'Google Drive',
        description: 'Access Google Drive documents',
        framework: 'llamaindex',
        category: 'Data Sources',
        icon: '📁',
        defaultConfig: {
          credentialsPath: '',
          mimeTypes: ['application/pdf', 'text/plain'],
          maxFiles: 10
        }
      },
      {
        id: 'notion-tool',
        name: 'Notion Database',
        description: 'Query Notion databases and pages',
        framework: 'llamaindex',
        category: 'Data Sources',
        icon: '📄',
        defaultConfig: {
          apiKey: '',
          databaseId: '',
          properties: []
        }
      },

      // Vector & Search
      {
        id: 'vector-store',
        name: 'Vector Store',
        description: 'Store and search document embeddings',
        framework: 'llamaindex',
        category: 'Vector Search',
        icon: '🔍',
        defaultConfig: {
          provider: 'memory', // memory, pinecone, weaviate, etc.
          embeddingModel: 'text-embedding-ada-002',
          dimensions: 1536
        }
      },
      {
        id: 'document-loader',
        name: 'Document Loader',
        description: 'Load and parse various document formats',
        framework: 'llamaindex',
        category: 'Data Processing',
        icon: '📥',
        defaultConfig: {
          formats: ['pdf', 'txt', 'docx', 'md'],
          chunkSize: 1000,
          chunkOverlap: 200
        }
      }
    ];
  }

  validateConfig(toolId: string, config: any): ValidationResult {
    switch (toolId) {
      case 'agent-start':
        const errors: string[] = [];

        if (!config.inputType || !['chatInput', 'formInput'].includes(config.inputType)) {
          errors.push('Input type must be either "chatInput" or "formInput"');
        }

        if (config.inputType === 'formInput' && !config.formTitle) {
          errors.push('Form title is required when using form input');
        }

        return {
          valid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined
        };

      case 'agent-node':
        if (!config.systemMessage) {
          return { valid: false, errors: ['System message is required'] };
        }

        if (config.maxIterations && (config.maxIterations < 1 || config.maxIterations > 50)) {
          return {
            valid: true,
            warnings: ['Max iterations should be between 1 and 50']
          };
        }

        return { valid: true };

      case 'agent-state':
        if (!config.stateStructure || !Array.isArray(config.stateStructure)) {
          return { valid: false, errors: ['State structure must be an array'] };
        }

        const invalidKeys = config.stateStructure.filter((item: any) =>
          !item.key || !item.operation || !['append', 'replace'].includes(item.operation)
        );

        if (invalidKeys.length > 0) {
          return {
            valid: false,
            errors: ['Each state item must have key, operation (append/replace), and defaultValue']
          };
        }

        return { valid: true };

      case 'calculator-tool':
        return { valid: true }; // Calculator has no required config

      case 'google-search-tool':
        if (!config.googleCSEId || !config.googleAPIKey) {
          return {
            valid: false,
            errors: ['Google CSE ID and API Key are required']
          };
        }
        return { valid: true };

      case 'web-scraper-tool':
        if (config.timeout && config.timeout < 1000) {
          return {
            valid: true,
            warnings: ['Timeout should be at least 1000ms for reliability']
          };
        }
        return { valid: true };

      case 'tool-node':
        if (!config.toolType) {
          return { valid: false, errors: ['Tool type is required'] };
        }
        return { valid: true };

      case 'condition-node':
        if (config.conditionType === 'javascript' && !config.condition) {
          return { valid: false, errors: ['JavaScript condition is required'] };
        }

        if (config.conditionType === 'llm' && !config.llmCondition) {
          return { valid: false, errors: ['LLM condition prompt is required'] };
        }

        return { valid: true };

      case 'loop-node':
        if (!config.maxIterations || config.maxIterations < 1) {
          return { valid: false, errors: ['Max iterations must be greater than 0'] };
        }
        return { valid: true };

      case 'agent-end':
        if (!config.outputFormat || !['text', 'json', 'markdown'].includes(config.outputFormat)) {
          return {
            valid: true,
            warnings: ['Output format should be text, json, or markdown']
          };
        }
        return { valid: true };

      case 'conversational-agent':
        const convErrors: string[] = [];
        const convWarnings: string[] = [];

        // Model validation
        if (!config.modelName) {
          convErrors.push('Model name is required');
        }

        // Temperature validation
        if (config.temperature < 0 || config.temperature > 2) {
          convWarnings.push('Temperature should be between 0 and 2');
        }

        // Memory validation
        if (config.memoryK && (config.memoryK < 1 || config.memoryK > 50)) {
          convWarnings.push('Memory K should be between 1 and 50');
        }

        // Tools validation
        if (config.tools && Array.isArray(config.tools)) {
          const enabledTools = config.tools.filter((t: any) => t.enabled);
          if (enabledTools.length > 10) {
            convWarnings.push('Too many tools enabled, performance may be affected');
          }
        }

        // Max tokens validation
        if (config.maxTokens && (config.maxTokens < 100 || config.maxTokens > 8000)) {
          convWarnings.push('Max tokens should be between 100 and 8000');
        }

        return {
          valid: convErrors.length === 0,
          errors: convErrors.length > 0 ? convErrors : undefined,
          warnings: convWarnings.length > 0 ? convWarnings : undefined
        };

      case 'multi-agent-workflow':
        if (!config.agents || config.agents.length === 0) {
          return { valid: false, errors: ['At least one agent is required'] };
        }
        if (!config.rootAgent) {
          return { valid: false, errors: ['Root agent must be specified'] };
        }
        return { valid: true };

      case 'rag-pipeline':
        if (!config.embedModel || !config.llmModel) {
          return { valid: false, errors: ['Embedding and LLM models are required'] };
        }
        return { valid: true };

      case 'code-interpreter':
        if (!['python', 'javascript'].includes(config.language)) {
          return { valid: false, errors: ['Language must be python or javascript'] };
        }
        return { valid: true };

      case 'wikipedia-tool':
      case 'web-scraper-tool':
        return { valid: true }; // Basic tools are usually valid

      case 'google-drive-tool':
        if (!config.credentialsPath) {
          return { valid: false, errors: ['Google Drive credentials path is required'] };
        }
        return { valid: true };

      case 'notion-tool':
        if (!config.apiKey || !config.databaseId) {
          return { valid: false, errors: ['Notion API key and database ID are required'] };
        }
        return { valid: true };

      case 'vector-store':
        if (!config.embeddingModel) {
          return { valid: false, errors: ['Embedding model is required'] };
        }
        return { valid: true };

      default:
        return { valid: true, warnings: ['Unknown LlamaIndex tool, using default validation'] };
    }
  }

  async execute(toolId: string, config: any, context: ExecutionContext): Promise<ExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(`Executing LlamaIndex tool: ${toolId}`);

      // For now, we'll return mock responses since full LlamaIndex integration
      // requires more setup (API keys, external services, etc.)
      const result = await this.executeMockLlamaIndex(toolId, config, context, logs);

      return {
        success: true,
        result,
        logs,
        streaming: true, // LlamaIndex supports streaming
        metadata: {
          toolId,
          framework: this.name,
          executionTime: Date.now() - startTime,
          nodeId: context.nodeId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs,
        metadata: {
          toolId,
          framework: this.name,
          executionTime: Date.now() - startTime,
          nodeId: context.nodeId
        }
      };
    }
  }

  private async executeMockLlamaIndex(
    toolId: string,
    config: any,
    context: ExecutionContext,
    logs: string[]
  ): Promise<any> {
    // Simulate streaming events if callback is available
    this.emitStreamingEvent?.({
      type: 'start',
      nodeId: context.nodeId,
      message: `Starting ${toolId} execution`,
      timestamp: Date.now()
    });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    this.emitStreamingEvent?.({
      type: 'progress',
      nodeId: context.nodeId,
      progress: 50,
      message: 'Processing...',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (toolId) {
      case 'agent-start':
        return await this.executeAgentStart(config, context, logs);

      case 'agent-node':
        return await this.executeAgentNode(config, context, logs);

      case 'agent-state':
        return await this.executeAgentState(config, context, logs);

      case 'tool-node':
        return await this.executeToolNode(config, context, logs);

      case 'condition-node':
        return await this.executeConditionNode(config, context, logs);

      case 'loop-node':
        return await this.executeLoopNode(config, context, logs);

      case 'agent-end':
        return await this.executeAgentEnd(config, context, logs);

      case 'calculator-tool':
        return await this.executeCalculatorTool(config, context, logs);

      case 'google-search-tool':
        return await this.executeGoogleSearchTool(config, context, logs);

      case 'web-scraper-tool':
        return await this.executeWebScraperTool(config, context, logs);

      case 'conversational-agent':
        return await this.executeConversationalAgent(config, context, logs);

      case 'multi-agent-workflow':
        logs.push(`🤖 Orchestrating ${config.agents.length} agents`);
        logs.push(`🎯 Starting with root agent: ${config.rootAgent}`);
        return {
          agents_executed: config.agents.length,
          root_agent: config.rootAgent,
          workflow_result: `Multi-agent workflow completed successfully. Root agent "${config.rootAgent}" coordinated with ${config.agents.length - 1} other agents to process the input.`,
          agent_outputs: config.agents.map((agent: any) => ({
            name: agent.name,
            output: `Agent "${agent.name}" processed the task: ${agent.description}`
          }))
        };

      case 'natural-language-workflow':
        logs.push(`📝 Processing natural language instructions`);
        logs.push(`🎭 Events: ${config.events.join(', ')}`);
        return {
          instructions: config.instructions,
          workflow_result: `Natural language workflow executed: "${config.instructions}". All specified events (${config.events.join(', ')}) were processed successfully.`,
          events_processed: config.events
        };

      case 'rag-pipeline':
        logs.push(`📚 Setting up RAG pipeline with ${config.llmModel}`);
        logs.push(`🔍 Using ${config.retriever} retriever with topK=${config.topK}`);
        return {
          model: config.llmModel,
          retriever: config.retriever,
          documents_retrieved: config.topK,
          rag_response: `RAG pipeline executed successfully. Retrieved ${config.topK} relevant documents using ${config.retriever} and generated response with ${config.llmModel}. This is a simulated response demonstrating the RAG workflow.`
        };

      case 'code-interpreter':
        logs.push(`💻 Executing ${config.language} code`);
        return {
          language: config.language,
          execution_result: `Code interpreter (${config.language}) executed successfully. This is a mock execution result. In a real implementation, this would execute the provided code safely in a sandboxed environment.`,
          output: config.language === 'python' ? 'print("Hello from Python!")' : 'console.log("Hello from JavaScript!");'
        };

      case 'wikipedia-tool':
        logs.push(`🌐 Searching Wikipedia in ${config.language}`);
        return {
          language: config.language,
          articles_found: config.topK,
          search_result: `Found ${config.topK} Wikipedia articles. This is a mock search result. In a real implementation, this would query Wikipedia's API and return relevant articles with summaries of ${config.summaryLength} characters.`
        };

      case 'web-scraper-tool':
        logs.push(`🕷️ Scraping web content`);
        return {
          scraping_result: `Web scraping completed successfully. Extracted text content using User-Agent: ${config.userAgent}. This is a mock result - real implementation would fetch and parse web pages.`,
          timeout: config.timeout,
          content_extracted: config.extractText
        };

      case 'google-drive-tool':
        logs.push(`📁 Accessing Google Drive`);
        return {
          drive_result: `Google Drive access successful. Would retrieve up to ${config.maxFiles} files of types: ${config.mimeTypes.join(', ')}. This is a mock result.`,
          max_files: config.maxFiles,
          mime_types: config.mimeTypes
        };

      case 'notion-tool':
        logs.push(`📄 Querying Notion database`);
        return {
          database_id: config.databaseId.substring(0, 8) + '...',
          notion_result: `Notion database query completed. Retrieved data from database and processed ${config.properties.length} properties. This is a mock result.`,
          properties: config.properties
        };

      case 'vector-store':
        logs.push(`🔍 Vector search with ${config.embeddingModel}`);
        return {
          embedding_model: config.embeddingModel,
          dimensions: config.dimensions,
          vector_result: `Vector store operation completed. Using ${config.embeddingModel} embeddings with ${config.dimensions} dimensions. This is a mock result showing vector search capabilities.`,
          provider: config.provider
        };

      case 'document-loader':
        logs.push(`📥 Loading documents: ${config.formats.join(', ')}`);
        return {
          formats_supported: config.formats,
          chunk_size: config.chunkSize,
          document_result: `Document loader processed files successfully. Supports formats: ${config.formats.join(', ')} with chunk size ${config.chunkSize} and overlap ${config.chunkOverlap}. This is a mock result.`,
          chunks_created: Math.floor(Math.random() * 10) + 1
        };

      default:
        return {
          tool_id: toolId,
          result: `LlamaIndex tool "${toolId}" executed successfully. This is a mock result for an unknown tool.`
        };
    }
  }

  // Optional streaming event emitter
  private emitStreamingEvent?: (event: StreamingEvent) => void;

  // Memory storage for conversations
  private conversationMemory = new Map<string, any[]>();

  setupStreaming(toolId: string, config: any, onUpdate: (event: StreamingEvent) => void): void {
    this.emitStreamingEvent = onUpdate;
    console.log(`[LlamaIndex] Streaming enabled for tool: ${toolId}`);
  }

  private async executeConversationalAgent(config: any, context: ExecutionContext, logs: string[]): Promise<any> {
    const {
      modelName,
      systemMessage,
      tools,
      allowToolCalling,
      memoryType,
      memoryK,
      persistSession,
      sessionId: configSessionId,
      temperature,
      maxTokens,
      streaming,
      responseFormat,
      includeThinking
    } = config;

    // Generate or use provided session ID
    const sessionId = configSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logs.push(`🗣️ Starting conversational agent with model: ${modelName}`);
    logs.push(`🧠 Session ID: ${sessionId}`);

    // Initialize or retrieve conversation memory
    let conversation = [];
    if (persistSession && this.conversationMemory.has(sessionId)) {
      conversation = this.conversationMemory.get(sessionId) || [];
      logs.push(`💾 Retrieved ${conversation.length} messages from session memory`);
    }

    // Get user input from context
    const userMessage = context.inputs?.message || context.inputs?.text || 'Hello!';
    logs.push(`👤 User: ${userMessage}`);

    // Add system message if it's the first interaction
    if (conversation.length === 0) {
      conversation.push({
        role: 'system',
        content: systemMessage
      });
    }

    // Add user message to conversation
    conversation.push({
      role: 'user',
      content: userMessage
    });

    // Get enabled tools
    const enabledTools = tools.filter((tool: any) => tool.enabled);
    logs.push(`🔧 Available tools: ${enabledTools.map((t: any) => t.name).join(', ')}`);

    // Simulate AI processing
    this.emitStreamingEvent?.({
      type: 'progress',
      nodeId: context.nodeId,
      message: `Processing with ${modelName}...`,
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if tools should be used (simple keyword detection for demo)
    const shouldUseTool = allowToolCalling && this.shouldUseTools(userMessage, enabledTools);
    let toolResults: any[] = [];

    if (shouldUseTool.use) {
      logs.push(`⚡ Invoking tool: ${shouldUseTool.tool.name}`);

      this.emitStreamingEvent?.({
        type: 'progress',
        nodeId: context.nodeId,
        message: `Using ${shouldUseTool.tool.name} tool...`,
        timestamp: Date.now()
      });

      const toolResult = await this.executeTool(shouldUseTool.tool, userMessage, logs);
      toolResults.push(toolResult);

      logs.push(`✅ Tool ${shouldUseTool.tool.name} completed`);
    }

    // Generate AI response
    const aiResponse = this.generateConversationalResponse(
      userMessage,
      enabledTools,
      toolResults,
      config,
      conversation.slice(-memoryK * 2) // Apply memory limit
    );

    logs.push(`🤖 Assistant: ${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}`);

    // Add AI response to conversation
    conversation.push({
      role: 'assistant',
      content: aiResponse,
      toolCalls: toolResults.length > 0 ? toolResults : undefined
    });

    // Update memory with conversation limit
    if (memoryType === 'buffer') {
      // Keep last K exchanges (user + assistant pairs)
      const maxMessages = (memoryK * 2) + 1; // +1 for system message
      if (conversation.length > maxMessages) {
        conversation = [
          conversation[0], // Keep system message
          ...conversation.slice(-maxMessages + 1)
        ];
      }
    }

    // Persist conversation if enabled
    if (persistSession) {
      this.conversationMemory.set(sessionId, conversation);
      logs.push(`💾 Saved conversation to memory (${conversation.length} messages)`);
    }

    this.emitStreamingEvent?.({
      type: 'complete',
      nodeId: context.nodeId,
      message: 'Conversation completed',
      timestamp: Date.now()
    });

    return {
      response: aiResponse,
      model: modelName,
      sessionId,
      conversationLength: conversation.length,
      toolsUsed: toolResults.map(t => t.toolName),
      memory: {
        type: memoryType,
        messagesInMemory: conversation.length,
        maxMemory: memoryK
      },
      metadata: {
        temperature,
        maxTokens,
        streaming,
        responseFormat,
        includeThinking,
        toolsAvailable: enabledTools.length,
        toolsUsed: toolResults.length
      }
    };
  }

  private shouldUseTools(userMessage: string, enabledTools: any[]): { use: boolean, tool?: any } {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword detection for tool usage
    for (const tool of enabledTools) {
      switch (tool.name) {
        case 'calculator':
          if (lowerMessage.includes('calculate') || lowerMessage.includes('math') ||
              /\d+[\+\-\*\/]\d+/.test(lowerMessage) || lowerMessage.includes('compute')) {
            return { use: true, tool };
          }
          break;

        case 'web_search':
          if (lowerMessage.includes('search') || lowerMessage.includes('google') ||
              lowerMessage.includes('find online') || lowerMessage.includes('latest')) {
            return { use: true, tool };
          }
          break;

        case 'file_operations':
          if (lowerMessage.includes('file') || lowerMessage.includes('save') ||
              lowerMessage.includes('read') || lowerMessage.includes('write')) {
            return { use: true, tool };
          }
          break;
      }
    }

    return { use: false };
  }

  private async executeTool(tool: any, userMessage: string, logs: string[]): Promise<any> {
    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (tool.name) {
      case 'calculator':
        // Extract math expression (basic)
        const mathMatch = userMessage.match(/\d+[\+\-\*\/]\d+/);
        if (mathMatch) {
          try {
            const result = eval(mathMatch[0]); // In real implementation, use a safe math parser
            logs.push(`🧮 Calculated: ${mathMatch[0]} = ${result}`);
            return {
              toolName: 'calculator',
              input: mathMatch[0],
              result: result,
              output: `The result of ${mathMatch[0]} is ${result}`
            };
          } catch (e) {
            return {
              toolName: 'calculator',
              input: mathMatch[0],
              error: 'Invalid calculation',
              output: 'I encountered an error while calculating that.'
            };
          }
        }
        return {
          toolName: 'calculator',
          output: 'I detected a math-related request but couldn\'t extract a calculation.'
        };

      case 'web_search':
        logs.push(`🔍 Performing web search...`);
        return {
          toolName: 'web_search',
          query: userMessage,
          results: [
            'Mock search result 1: Recent information about the topic',
            'Mock search result 2: Additional relevant information',
            'Mock search result 3: Latest updates and news'
          ],
          output: 'I found several relevant results from my web search. Here\'s what I discovered: [Mock search results would appear here in a real implementation]'
        };

      case 'file_operations':
        logs.push(`📁 Performing file operation...`);
        return {
          toolName: 'file_operations',
          operation: 'read',
          filename: 'mock_file.txt',
          result: 'Mock file content would be displayed here',
          output: 'I\'ve accessed the file. In a real implementation, this would show the actual file content or confirm the operation was completed.'
        };

      default:
        return {
          toolName: tool.name,
          output: `Tool "${tool.name}" was called but not implemented in this mock version.`
        };
    }
  }

  private generateConversationalResponse(
    userMessage: string,
    enabledTools: any[],
    toolResults: any[],
    config: any,
    recentConversation: any[]
  ): string {
    let response = '';

    // Include thinking process if enabled
    if (config.includeThinking) {
      response += '**Thinking:** I need to analyze the user\'s request and determine the best response.\n\n';
    }

    // Include tool results if any
    if (toolResults.length > 0) {
      response += 'I used some tools to help answer your question:\n\n';

      toolResults.forEach(result => {
        response += `🔧 **${result.toolName}**: ${result.output}\n\n`;
      });
    }

    // Generate contextual response based on user message
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      response += `Hello! I'm here to help you. I have access to ${enabledTools.length} tools including: ${enabledTools.map(t => t.name).join(', ')}. What would you like to do today?`;
    } else if (toolResults.length > 0) {
      response += `Based on the tool results above, I hope this helps answer your question. Is there anything else you'd like me to help you with?`;
    } else {
      response += `I understand you're asking about "${userMessage}". This is a conversational agent demonstration. In a real implementation, I would provide a more detailed and contextually appropriate response based on your specific question and the conversation history.`;
    }

    // Add verbose mode details if enabled
    if (config.verboseMode) {
      response += `\n\n**Debug Info:**\n- Model: ${config.modelName}\n- Temperature: ${config.temperature}\n- Available Tools: ${enabledTools.length}\n- Tools Used: ${toolResults.length}\n- Memory Messages: ${recentConversation.length}`;
    }

    return response;
  }

  // Tool execution methods following Flowise pattern
  private async executeCalculatorTool(config: any, context: ExecutionContext, logs: string[]): Promise<any> {
    const { precision = 10 } = config;
    const input = context.inputs?.expression || context.inputs?.text || '2+2';

    logs.push(`🧮 Calculating: ${input}`);

    try {
      // Simple math evaluation (in production, use a safer math parser)
      const result = Function('"use strict"; return (' + input + ')')();
      const formattedResult = Number(result.toFixed(precision));

      logs.push(`✅ Result: ${formattedResult}`);

      return {
        input: input,
        result: formattedResult,
        calculation: `${input} = ${formattedResult}`,
        precision: precision
      };
    } catch (error) {
      logs.push(`❌ Calculation error: ${error}`);
      return {
        input: input,
        error: error instanceof Error ? error.message : String(error),
        result: null
      };
    }
  }

  private async executeGoogleSearchTool(config: any, context: ExecutionContext, logs: string[]): Promise<any> {
    const { maxResults = 5 } = config;
    const query = context.inputs?.query || context.inputs?.text || 'test search';

    logs.push(`🔍 Searching Google for: ${query}`);
    logs.push(`📊 Max results: ${maxResults}`);

    // Mock implementation (in production, integrate with Google Search API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResults = Array.from({ length: Math.min(maxResults, 3) }, (_, i) => ({
      title: `Search Result ${i + 1} for "${query}"`,
      link: `https://example.com/result-${i + 1}`,
      snippet: `This is a mock search result snippet for ${query}. Contains relevant information about the topic.`,
      displayLink: 'example.com'
    }));

    logs.push(`✅ Found ${mockResults.length} results`);

    return {
      query: query,
      results: mockResults,
      totalResults: mockResults.length,
      searchTime: '0.42 seconds (mock)'
    };
  }

  private async executeWebScraperTool(config: any, context: ExecutionContext, logs: string[]): Promise<any> {
    const { userAgent, timeout = 10000, maxContentLength = 50000 } = config;
    const url = context.inputs?.url || context.inputs?.text || 'https://example.com';

    logs.push(`🕷️ Scraping: ${url}`);
    logs.push(`⏱️ Timeout: ${timeout}ms`);

    try {
      // Mock implementation (in production, use real web scraping)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockContent = `
        Mock scraped content from ${url}

        This is a simulated web page content that would be extracted from the URL.
        In a real implementation, this would contain:
        - Page title
        - Main content text
        - Metadata
        - Structured data

        Content length: ${Math.floor(Math.random() * maxContentLength)} characters
      `.trim();

      logs.push(`✅ Successfully scraped ${mockContent.length} characters`);

      return {
        url: url,
        content: mockContent.substring(0, maxContentLength),
        contentLength: mockContent.length,
        userAgent: userAgent,
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      logs.push(`❌ Scraping error: ${error}`);
      return {
        url: url,
        error: error instanceof Error ? error.message : String(error),
        content: null
      };
    }
  }
}