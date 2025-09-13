/**
 * ReAct Agent
 * Adapted from Flowise for formmy-actions
 * Uses ReAct (Reasoning + Acting) pattern for decision making
 */

import { AgentExecutor } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { pull } from 'langchain/hub';
import { createReactAgent } from '@langchain/agents';
import type { PromptTemplate } from '@langchain/core/prompts';

export interface ReActAgentConfig {
  model: BaseChatModel;
  tools: Tool[];
  systemMessage?: string;
  maxIterations?: number;
  verbose?: boolean;
  memory?: any; // FlowiseMemory type
}

export interface ReActAgentResult {
  output: string;
  intermediateSteps?: any[];
  usedTools?: string[];
}

export class ReActAgent {
  private config: ReActAgentConfig;
  private executor?: AgentExecutor;
  private sessionId: string;

  constructor(config: ReActAgentConfig, sessionId: string = 'default') {
    this.config = config;
    this.sessionId = sessionId;
  }

  /**
   * Initialize the ReAct agent
   */
  async initialize(): Promise<void> {
    try {
      // Pull the ReAct prompt template from LangChain Hub
      const prompt = await pull<PromptTemplate>('hwchase17/react-chat');

      // Create the ReAct agent
      const agent = await createReactAgent({
        llm: this.config.model,
        tools: this.config.tools,
        prompt
      });

      // Create the executor
      this.executor = new AgentExecutor({
        agent,
        tools: this.config.tools,
        verbose: this.config.verbose || false,
        maxIterations: this.config.maxIterations || 5,
        returnIntermediateSteps: true
      });
    } catch (error) {
      console.error('Failed to initialize ReAct agent:', error);
      throw error;
    }
  }

  /**
   * Run the agent with a given input
   */
  async run(
    input: string,
    chatHistory?: BaseMessage[]
  ): Promise<ReActAgentResult> {
    if (!this.executor) {
      await this.initialize();
    }

    try {
      // Format chat history if provided
      const chatHistoryString = chatHistory
        ? chatHistory.map(msg => {
            if (msg instanceof HumanMessage) {
              return `Human: ${msg.content}`;
            } else if (msg instanceof AIMessage) {
              return `Assistant: ${msg.content}`;
            }
            return msg.content;
          }).join('\n')
        : '';

      // Run the executor
      const result = await this.executor!.invoke({
        input,
        chat_history: chatHistoryString
      });

      // Extract used tools from intermediate steps
      const usedTools = result.intermediateSteps
        ?.map((step: any) => step.action?.tool)
        .filter((tool: string) => tool);

      return {
        output: result.output,
        intermediateSteps: result.intermediateSteps,
        usedTools: [...new Set(usedTools)]
      };
    } catch (error) {
      console.error('ReAct agent execution failed:', error);
      throw error;
    }
  }

  /**
   * Stream the agent execution
   */
  async *stream(
    input: string,
    chatHistory?: BaseMessage[]
  ): AsyncGenerator<{
    type: 'thought' | 'action' | 'observation' | 'output';
    content: string;
  }> {
    if (!this.executor) {
      await this.initialize();
    }

    const chatHistoryString = chatHistory
      ? chatHistory.map(msg => `${msg._getType()}: ${msg.content}`).join('\n')
      : '';

    try {
      // Stream events from the executor
      const stream = await this.executor!.streamEvents(
        {
          input,
          chat_history: chatHistoryString
        },
        { version: 'v1' }
      );

      for await (const event of stream) {
        if (event.event === 'on_llm_stream') {
          // Agent's reasoning
          yield {
            type: 'thought',
            content: event.data?.chunk?.text || ''
          };
        } else if (event.event === 'on_tool_start') {
          // Tool being used
          yield {
            type: 'action',
            content: `Using tool: ${event.name}`
          };
        } else if (event.event === 'on_tool_end') {
          // Tool result
          yield {
            type: 'observation',
            content: event.data?.output || ''
          };
        } else if (event.event === 'on_chain_end' && event.name === 'AgentExecutor') {
          // Final output
          yield {
            type: 'output',
            content: event.data?.output || ''
          };
        }
      }
    } catch (error) {
      console.error('ReAct agent streaming failed:', error);
      throw error;
    }
  }

  /**
   * Get available tools
   */
  getTools(): Tool[] {
    return this.config.tools;
  }

  /**
   * Add a new tool
   */
  addTool(tool: Tool): void {
    this.config.tools.push(tool);
    // Reset executor to reinitialize with new tools
    this.executor = undefined;
  }

  /**
   * Remove a tool by name
   */
  removeTool(toolName: string): void {
    this.config.tools = this.config.tools.filter(
      tool => tool.name !== toolName
    );
    // Reset executor to reinitialize
    this.executor = undefined;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReActAgentConfig>): void {
    this.config = { ...this.config, ...config };
    // Reset executor to reinitialize with new config
    this.executor = undefined;
  }
}