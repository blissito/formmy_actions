/**
 * Conversational Agent
 * Adapted from Flowise for formmy-actions
 * Optimized for natural conversations with memory and context
 */

import { AgentExecutor } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage
} from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '@langchain/core/prompts';
import { ChatConversationalAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';

const DEFAULT_SYSTEM_MESSAGE = `You are a helpful AI assistant designed to have natural conversations while helping users accomplish their goals. You have access to various tools that you can use when needed.

Key guidelines:
- Be conversational and friendly
- Use tools when they would be helpful
- Explain your reasoning when making decisions
- Ask for clarification when needed
- Maintain context throughout the conversation`;

export interface ConversationalAgentConfig {
  model: BaseChatModel;
  tools: Tool[];
  systemMessage?: string;
  maxIterations?: number;
  verbose?: boolean;
  memoryKey?: string;
  returnIntermediateSteps?: boolean;
}

export interface ConversationTurn {
  input: string;
  output: string;
  timestamp: Date;
  toolsUsed?: string[];
}

export class ConversationalAgent {
  private config: ConversationalAgentConfig;
  private executor?: AgentExecutor;
  private memory: BufferMemory;
  private conversationHistory: ConversationTurn[] = [];
  private sessionId: string;

  constructor(config: ConversationalAgentConfig, sessionId: string = 'default') {
    this.config = {
      ...config,
      systemMessage: config.systemMessage || DEFAULT_SYSTEM_MESSAGE
    };
    this.sessionId = sessionId;

    // Initialize memory
    this.memory = new BufferMemory({
      memoryKey: config.memoryKey || 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output'
    });
  }

  /**
   * Initialize the conversational agent
   */
  async initialize(): Promise<void> {
    try {
      // Create the prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(this.config.systemMessage!),
        new MessagesPlaceholder('chat_history'),
        HumanMessagePromptTemplate.fromTemplate('{input}'),
        new MessagesPlaceholder('agent_scratchpad')
      ]);

      // Create the conversational agent
      const agent = ChatConversationalAgent.fromLLMAndTools(
        this.config.model,
        this.config.tools,
        {
          systemMessage: this.config.systemMessage,
          humanMessage: '{input}',
          outputParser: undefined // Use default output parser
        }
      );

      // Create the executor
      this.executor = new AgentExecutor({
        agent,
        tools: this.config.tools,
        memory: this.memory,
        verbose: this.config.verbose || false,
        maxIterations: this.config.maxIterations || 5,
        returnIntermediateSteps: this.config.returnIntermediateSteps || false
      });
    } catch (error) {
      console.error('Failed to initialize conversational agent:', error);
      throw error;
    }
  }

  /**
   * Have a conversation with the agent
   */
  async chat(input: string): Promise<{
    response: string;
    toolsUsed?: string[];
    thinking?: string[];
  }> {
    if (!this.executor) {
      await this.initialize();
    }

    try {
      // Run the executor
      const result = await this.executor!.invoke({ input });

      // Extract tools used
      const toolsUsed = result.intermediateSteps
        ?.map((step: any) => step.action?.tool)
        .filter((tool: string) => tool);

      // Store in conversation history
      const turn: ConversationTurn = {
        input,
        output: result.output,
        timestamp: new Date(),
        toolsUsed: toolsUsed ? [...new Set(toolsUsed)] : undefined
      };
      this.conversationHistory.push(turn);

      return {
        response: result.output,
        toolsUsed: turn.toolsUsed,
        thinking: result.intermediateSteps?.map((step: any) =>
          step.action?.log || ''
        ).filter(Boolean)
      };
    } catch (error) {
      console.error('Conversational agent chat failed:', error);
      throw error;
    }
  }

  /**
   * Stream the conversation
   */
  async *streamChat(input: string): AsyncGenerator<{
    type: 'thinking' | 'tool' | 'response' | 'error';
    content: string;
    metadata?: any;
  }> {
    if (!this.executor) {
      await this.initialize();
    }

    try {
      const stream = await this.executor!.streamEvents(
        { input },
        { version: 'v1' }
      );

      for await (const event of stream) {
        if (event.event === 'on_llm_stream') {
          // Agent's thinking process
          const content = event.data?.chunk?.text || '';
          if (content) {
            yield {
              type: 'thinking',
              content,
              metadata: { event: event.name }
            };
          }
        } else if (event.event === 'on_tool_start') {
          // Tool being called
          yield {
            type: 'tool',
            content: `Calling ${event.name}...`,
            metadata: { tool: event.name, input: event.data }
          };
        } else if (event.event === 'on_tool_end') {
          // Tool result
          yield {
            type: 'tool',
            content: `Tool result: ${JSON.stringify(event.data?.output).slice(0, 100)}...`,
            metadata: { tool: event.name, output: event.data?.output }
          };
        } else if (event.event === 'on_chain_end' && event.name === 'AgentExecutor') {
          // Final response
          yield {
            type: 'response',
            content: event.data?.output || '',
            metadata: { final: true }
          };
        }
      }
    } catch (error: any) {
      yield {
        type: 'error',
        content: error.message || 'An error occurred',
        metadata: { error }
      };
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationTurn[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    this.memory.clear();
  }

  /**
   * Get memory messages
   */
  async getMemoryMessages(): Promise<BaseMessage[]> {
    const memoryVariables = await this.memory.loadMemoryVariables({});
    return memoryVariables[this.config.memoryKey || 'chat_history'] || [];
  }

  /**
   * Add a message to memory
   */
  async addMessage(message: BaseMessage): Promise<void> {
    const messages = await this.getMemoryMessages();
    messages.push(message);
    await this.memory.saveContext(
      { input: '' },
      { output: '' }
    );
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    turnCount: number;
    toolsUsed: string[];
    duration: number;
  } {
    const toolsSet = new Set<string>();
    this.conversationHistory.forEach(turn => {
      turn.toolsUsed?.forEach(tool => toolsSet.add(tool));
    });

    const duration = this.conversationHistory.length > 0
      ? Date.now() - this.conversationHistory[0].timestamp.getTime()
      : 0;

    return {
      turnCount: this.conversationHistory.length,
      toolsUsed: Array.from(toolsSet),
      duration
    };
  }

  /**
   * Export conversation
   */
  exportConversation(): {
    sessionId: string;
    history: ConversationTurn[];
    summary: ReturnType<typeof this.getSummary>;
  } {
    return {
      sessionId: this.sessionId,
      history: this.conversationHistory,
      summary: this.getSummary()
    };
  }
}