// Central registry initialization for all executors
import { executorRegistry } from './ExecutorFramework';
import { VercelAIExecutor } from './executors/VercelAIExecutor';
import { LlamaIndexExecutor } from './executors/LlamaIndexExecutor';
import { SimpleAgentExecutor } from './executors/SimpleAgentExecutor';

// Initialize and register all available executors
export const initializeExecutors = () => {
  // Register Vercel AI SDK executor
  const vercelAIExecutor = new VercelAIExecutor();
  executorRegistry.register(vercelAIExecutor);

  // Register LlamaIndex executor
  const llamaIndexExecutor = new LlamaIndexExecutor();
  executorRegistry.register(llamaIndexExecutor);

  // Register Simple Agent executor (UI-only)
  const simpleAgentExecutor = new SimpleAgentExecutor();
  simpleAgentExecutor.initialize();
  executorRegistry.register(simpleAgentExecutor);

  // Future executors will be registered here:
  // executorRegistry.register(new LangChainExecutor());

};

// Auto-initialize when this module is imported
initializeExecutors();

// Export the registry for use in components
export { executorRegistry };