/**
 * Simple Chat Agent
 * Lightweight conversational agent using OpenAI directly
 * Integrates with formmy-actions workflow state
 */

import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatAgentConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  timestamp: Date;
}

export class SimpleChatAgent {
  private openai: OpenAI;
  private config: Required<ChatAgentConfig>;
  private conversationHistory: ChatMessage[] = [];

  constructor(config: ChatAgentConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      systemMessage: this.getDefaultSystemMessage(),
      ...config
    };

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true
    });

    // Add system message to conversation
    this.conversationHistory.push({
      role: 'system',
      content: this.config.systemMessage,
      timestamp: new Date()
    });
  }

  private getDefaultSystemMessage(): string {
    return `You are a helpful AI assistant integrated with a visual workflow builder called formmy-actions. You can help users test and interact with their AI workflows.

Key capabilities:
- Help users understand workflow execution
- Explain workflow state and configuration
- Provide guidance on building AI workflows
- Answer questions about the current workflow state

Guidelines:
- Be conversational and helpful
- Reference workflow state information when relevant
- Explain technical concepts clearly
- Ask clarifying questions when needed

Current context: You're in a chat interface that's connected to a running workflow. Users can test their workflows by chatting with you.`;
  }

  /**
   * Add workflow state context to the conversation
   */
  setWorkflowContext(flowState: Record<string, any>, globalData: Record<string, any>): void {
    const contextMessage = `Current Workflow Context:
📊 Flow State: ${JSON.stringify(flowState, null, 2)}
🔧 Global Data: ${JSON.stringify(globalData, null, 2)}

Please use this information when responding to user queries about their workflow.`;

    // Update system message with context
    this.conversationHistory[0] = {
      role: 'system',
      content: this.config.systemMessage + '\n\n' + contextMessage,
      timestamp: new Date()
    };
  }

  /**
   * Send a message to the agent and get a response
   */
  async chat(userMessage: string): Promise<ChatResponse> {
    try {
      // Add user message to history
      const userChatMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      this.conversationHistory.push(userChatMessage);

      // Prepare messages for OpenAI (limit to last 10 messages to avoid token limits)
      const recentMessages = this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: recentMessages as any,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      // Add assistant response to history
      const assistantChatMessage: ChatMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      };

      this.conversationHistory.push(assistantChatMessage);

      return {
        message: assistantMessage,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined,
        model: completion.model,
        timestamp: new Date()
      };

    } catch (error: any) {
      console.error('Chat agent error:', error);

      // Return error message
      const errorMessage = `❌ Error: ${error.message || 'No se pudo conectar con OpenAI. Verifica tu API key.'}`;

      return {
        message: errorMessage,
        model: this.config.model,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  /**
   * Clear conversation history (keep system message)
   */
  clearHistory(): void {
    const systemMessage = this.conversationHistory[0];
    this.conversationHistory = [systemMessage];
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<ChatAgentConfig>> {
    return { ...this.config };
  }
}