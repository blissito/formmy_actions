/**
 * Agent Executor
 * Provides AI Agent tools for formmy-actions
 */

import type {
  ExecutorFramework,
  ToolDefinition,
  ExecutionContext,
  ExecutionResult,
  ValidationResult
} from '../ExecutorFramework';
// Placeholder types to avoid compilation errors
interface ReActAgentConfig {
  model: any;
  tools: any[];
  maxIterations?: number;
  verbose?: boolean;
}

interface ConversationalAgentConfig {
  model: any;
  tools: any[];
  systemMessage?: string;
  verbose?: boolean;
}

interface AgentFlowConfig {
  model: any;
  availableTools: string[];
  availableAgents?: string[];
}

export interface AgentExecutorConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  models?: {
    [key: string]: BaseChatModel;
  };
  defaultModel?: string;
}

export class AgentExecutor implements ExecutorFramework {
  readonly name = 'agents';
  readonly version = '1.0.0';
  readonly displayName = 'AI Agents';

  private config: AgentExecutorConfig;
  private agents: Map<string, any> = new Map();
  private agentGenerator?: any;

  constructor(config: AgentExecutorConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Try to initialize LangChain dependencies
      try {
        // Initialize default models if API keys are provided
        if (this.config.openaiApiKey) {
          const { ChatOpenAI } = await import('@langchain/openai');
          const model = new ChatOpenAI({
            modelName: 'gpt-4',
            openAIApiKey: this.config.openaiApiKey
          });

          if (!this.config.models) this.config.models = {};
          this.config.models['gpt-4'] = model;

          if (!this.config.defaultModel) {
            this.config.defaultModel = 'gpt-4';
          }
        }

        // Initialize AgentFlow generator if we have a model
        if (this.config.models && this.config.defaultModel) {
          const { AgentFlowV2Generator } = await import('../agentflow/AgentFlowV2Generator');
          this.agentGenerator = new AgentFlowV2Generator({
            model: this.config.models[this.config.defaultModel],
            availableTools: this.getAvailableTools().map(t => t.id),
            availableAgents: ['react', 'conversational']
          });
        }

        console.log('✅ AgentExecutor initialized successfully with LangChain');
      } catch (error) {
        console.warn('⚠️ LangChain dependencies not available, using placeholder implementation');
        console.log('✅ AgentExecutor initialized in placeholder mode');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AgentExecutor:', error);
    }
  }

  async getAvailableTools(): Promise<ToolDefinition[]> {
    return [
      {
        id: 'react-agent',
        name: 'ReAct Agent',
        description: 'Reasoning and Acting agent for complex tasks',
        category: 'Agents',
        framework: 'agents',
        icon: '🤖'
      },
      {
        id: 'conversational-agent',
        name: 'Conversational Agent',
        description: 'Natural conversation agent with memory',
        category: 'Agents',
        framework: 'agents',
        icon: '💬'
      },
      {
        id: 'workflow-generator',
        name: 'Workflow Generator',
        description: 'Generate workflows from natural language',
        category: 'Generation',
        framework: 'agents',
        icon: '⚡'
      }
    ];
  }

  validateConfig(toolId: string, config: any): ValidationResult {
    return { valid: true };
  }

  async execute(
    toolId: string,
    config: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const tools = await this.getAvailableTools();
    const tool = tools.find(t => t.id === toolId);
    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolId} not found`
      };
    }

    try {
      switch (toolId) {
        case 'react-agent':
          return await this.executeReActAgent(config, context);

        case 'conversational-agent':
          return await this.executeConversationalAgent(config, context);

        case 'workflow-generator':
          return await this.executeWorkflowGenerator(config, context);

        default:
          return {
            success: false,
            error: `Tool ${toolId} not implemented`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Execution failed'
      };
    }
  }

  private async executeReActAgent(
    inputs: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      const { ReActAgent } = await import('../agents/ReActAgent');

      if (!this.config.models || !this.config.defaultModel) {
        return {
          success: false,
          error: 'No model configured for agent execution'
        };
      }

      const model = this.config.models[this.config.defaultModel];
      const tools: any[] = []; // TODO: Convert available tools to LangChain tools

      const agentConfig: ReActAgentConfig = {
        model,
        tools,
        maxIterations: inputs.maxIterations || 5,
        verbose: context.debug
      };

      const agentKey = `react-${context.nodeId}`;
      let agent = this.agents.get(agentKey);

      if (!agent) {
        agent = new ReActAgent(agentConfig, context.sessionId || 'default');
        await agent.initialize();
        this.agents.set(agentKey, agent);
      }

      if (context.streaming) {
        // Handle streaming execution
        const events: any[] = [];
        for await (const event of agent.stream(inputs.task)) {
          events.push(event);
          if (context.onProgress) {
            context.onProgress({
              type: event.type,
              data: event.content
            });
          }
        }

        const finalEvent = events[events.length - 1];
        return {
          success: true,
          output: {
            result: finalEvent?.content || 'No result',
            toolsUsed: [],
            reasoning: events
              .filter((e: any) => e.type === 'thought')
              .map((e: any) => e.content)
          }
        };
      } else {
        const result = await agent.run(inputs.task);
        return {
          success: true,
          output: {
            result: result.output,
            toolsUsed: result.usedTools || [],
            reasoning: result.intermediateSteps?.map((s: any) => s.action?.log).filter(Boolean) || []
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `ReAct agent not available: ${error.message}. Please install LangChain dependencies.`
      };
    }
  }

  private async executeConversationalAgent(
    inputs: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      const { ConversationalAgent } = await import('../agents/ConversationalAgent');

      if (!this.config.models || !this.config.defaultModel) {
        return {
          success: false,
          error: 'No model configured for agent execution'
        };
      }

      const model = this.config.models[this.config.defaultModel];
      const tools: any[] = []; // TODO: Convert available tools

      const agentConfig: ConversationalAgentConfig = {
        model,
        tools,
        systemMessage: inputs.systemMessage,
        verbose: context.debug
      };

      const agentKey = `conv-${context.nodeId}`;
      let agent = this.agents.get(agentKey);

      if (!agent) {
        agent = new ConversationalAgent(agentConfig, context.sessionId || 'default');
        await agent.initialize();
        this.agents.set(agentKey, agent);
      }

      if (context.streaming) {
        let finalResponse = '';
        const toolsUsed: string[] = [];
        const thinking: string[] = [];

        for await (const event of agent.streamChat(inputs.message)) {
          if (event.type === 'response') {
            finalResponse = event.content;
          } else if (event.type === 'tool') {
            if (event.metadata?.tool) {
              toolsUsed.push(event.metadata.tool);
            }
          } else if (event.type === 'thinking') {
            thinking.push(event.content);
          }

          if (context.onProgress) {
            context.onProgress({
              type: event.type,
              data: event.content
            });
          }
        }

        return {
          success: true,
          output: {
            response: finalResponse,
            toolsUsed: [...new Set(toolsUsed)],
            thinking
          }
        };
      } else {
        const result = await agent.chat(inputs.message);
        return {
          success: true,
          output: result
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Conversational agent not available: ${error.message}. Please install LangChain dependencies.`
      };
    }
  }

  private async executeWorkflowGenerator(
    inputs: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      if (!this.agentGenerator) {
        return {
          success: false,
          error: 'Workflow generator not initialized'
        };
      }

      const workflow = await this.agentGenerator.generateWorkflow(
        inputs.description,
        inputs.goal
      );

      if (workflow.error) {
        return {
          success: false,
          error: workflow.error
        };
      }

      return {
        success: true,
        output: {
          workflow,
          description: workflow.description,
          nodes: workflow.nodes.length,
          edges: workflow.edges.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Workflow generator not available: ${error.message}. Please install LangChain dependencies.`
      };
    }
  }

  async cleanup(): Promise<void> {
    // Clear agent instances
    this.agents.clear();
  }
}