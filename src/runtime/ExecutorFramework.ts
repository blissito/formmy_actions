// Base interfaces for multi-framework executor system
export interface ToolDefinition {
  id: string
  name: string
  description: string
  framework: 'vercel-ai' | 'llamaindex' | 'langchain' | 'custom'
  category: string
  icon: string
  configSchema?: any
  defaultConfig?: any
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
}

export interface ExecutionContext {
  previousResults: Record<string, any>
  globalConfig: Record<string, any>
  nodeId: string
  flowId?: string
}

export interface ExecutionResult {
  success: boolean
  result?: any
  error?: string
  logs?: string[]
  metadata?: Record<string, any>
  streaming?: boolean
}

// Base interface that all framework executors must implement
export abstract class ExecutorFramework {
  abstract readonly name: string
  abstract readonly version: string
  abstract readonly displayName: string

  // Get all available tools for this framework
  abstract getAvailableTools(): Promise<ToolDefinition[]>

  // Execute a specific tool with given config and context
  abstract execute(
    toolId: string, 
    config: any, 
    context: ExecutionContext
  ): Promise<ExecutionResult>

  // Validate tool configuration
  abstract validateConfig(toolId: string, config: any): ValidationResult

  // Optional: Setup streaming for real-time updates
  setupStreaming?(
    toolId: string, 
    config: any, 
    onUpdate: (event: StreamingEvent) => void
  ): void
}

export interface StreamingEvent {
  type: 'start' | 'progress' | 'update' | 'complete' | 'error'
  nodeId: string
  data?: any
  message?: string
  progress?: number
  timestamp: number
}

// Registry to manage all available executor frameworks
export class ExecutorRegistry {
  private executors = new Map<string, ExecutorFramework>()

  register(executor: ExecutorFramework): void {
    this.executors.set(executor.name, executor)
    console.log(`[ExecutorRegistry] Registered framework: ${executor.displayName}`)
  }

  unregister(frameworkName: string): void {
    this.executors.delete(frameworkName)
    console.log(`[ExecutorRegistry] Unregistered framework: ${frameworkName}`)
  }

  getExecutor(frameworkName: string): ExecutorFramework | undefined {
    return this.executors.get(frameworkName)
  }

  getAvailableFrameworks(): ExecutorFramework[] {
    return Array.from(this.executors.values())
  }

  async getAllTools(): Promise<Record<string, ToolDefinition[]>> {
    const result: Record<string, ToolDefinition[]> = {}
    
    for (const [name, executor] of this.executors) {
      try {
        result[name] = await executor.getAvailableTools()
      } catch (error) {
        console.error(`[ExecutorRegistry] Error loading tools for ${name}:`, error)
        result[name] = []
      }
    }
    
    return result
  }

  async getToolsByCategory(): Promise<Record<string, Record<string, ToolDefinition[]>>> {
    const allTools = await this.getAllTools()
    const categorized: Record<string, Record<string, ToolDefinition[]>> = {}

    for (const [frameworkName, tools] of Object.entries(allTools)) {
      categorized[frameworkName] = {}
      
      for (const tool of tools) {
        if (!categorized[frameworkName][tool.category]) {
          categorized[frameworkName][tool.category] = []
        }
        categorized[frameworkName][tool.category].push(tool)
      }
    }

    return categorized
  }
}

// Global singleton registry instance
export const executorRegistry = new ExecutorRegistry()