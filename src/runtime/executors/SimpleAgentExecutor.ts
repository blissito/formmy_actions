/**
 * Simple Agent Executor
 * UI-only version for formmy-actions (no LangChain dependencies)
 */

import type {
  ExecutorFramework,
  ToolDefinition,
  ExecutionContext,
  ExecutionResult,
  ValidationResult
} from '../ExecutorFramework';

export class SimpleAgentExecutor implements ExecutorFramework {
  readonly name = 'agents';
  readonly version = '1.0.0';
  readonly displayName = 'AI Agents';

  async initialize(): Promise<void> {
    console.log('✅ SimpleAgentExecutor initialized (UI-only mode)');
  }

  async getAvailableTools(): Promise<ToolDefinition[]> {
    return [
      {
        id: 'start',
        name: 'Workflow Start',
        description: 'Triggers and controls workflow execution',
        category: 'Flow Control',
        framework: 'agents',
        icon: '▶️'
      },
      {
        id: 'chat',
        name: 'Chat Interface',
        description: 'Interactive conversation interface',
        category: 'Interface',
        framework: 'agents',
        icon: '💬'
      },
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
        icon: '💭'
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
    // This is a UI-only implementation
    return {
      success: false,
      error: `Agent execution requires full LangChain setup. Tool "${toolId}" is for UI design only. To enable real agent execution, install LangChain dependencies and configure API keys.`,
      metadata: {
        uiOnly: true,
        toolId,
        config
      }
    };
  }

  async cleanup(): Promise<void> {
    // Nothing to cleanup in UI-only mode
  }
}