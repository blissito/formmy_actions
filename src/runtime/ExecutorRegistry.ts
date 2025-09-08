// Central registry initialization for all executors
import { executorRegistry } from './ExecutorFramework';
import { VercelAIExecutor } from './executors/VercelAIExecutor';
import { LlamaIndexExecutor } from './executors/LlamaIndexExecutor';

// Initialize and register all available executors
export const initializeExecutors = () => {
  // Register Vercel AI SDK executor
  const vercelAIExecutor = new VercelAIExecutor();
  executorRegistry.register(vercelAIExecutor);

  // Register LlamaIndex executor
  const llamaIndexExecutor = new LlamaIndexExecutor();
  executorRegistry.register(llamaIndexExecutor);

  // Future executors will be registered here:
  // executorRegistry.register(new LangChainExecutor());

  console.log('✅ Executors initialized:', executorRegistry.getAvailableFrameworks().map(f => f.displayName));
};

// Auto-initialize when this module is imported
initializeExecutors();

// Export the registry for use in components
export { executorRegistry };