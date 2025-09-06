import React from 'react';
import { Toaster } from 'react-hot-toast';
import App from './App';

export interface AIFlowCanvasProps {
  /**
   * API keys for different providers
   */
  apiKeys?: {
    openai?: string;
    anthropic?: string;
  };
  
  /**
   * Initial flow data to load
   */
  initialFlow?: any;
  
  /**
   * Callback when flow is saved
   */
  onSave?: (flowData: any) => void;
  
  /**
   * Callback when flow is executed
   */
  onExecute?: (flowData: any) => Promise<any>;
  
  /**
   * Theme configuration
   */
  theme?: 'light' | 'dark' | 'auto';
  
  /**
   * Whether the canvas is read-only
   */
  readonly?: boolean;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}

/**
 * AIFlowCanvas - Visual AI workflow builder component
 * 
 * @example
 * ```tsx
 * import { AIFlowCanvas } from 'formmy-actions';
 * 
 * function MyApp() {
 *   return (
 *     <AIFlowCanvas 
 *       apiKeys={{ openai: 'your-key' }}
 *       onSave={(flow) => console.log('Saved:', flow)}
 *       onExecute={(flow) => console.log('Executing:', flow)}
 *     />
 *   );
 * }
 * ```
 */
export default function AIFlowCanvas({
  apiKeys,
  initialFlow,
  onSave,
  onExecute,
  theme = 'light',
  readonly = false,
  className = '',
  style = {},
}: AIFlowCanvasProps) {
  React.useEffect(() => {
    // Set up global API keys if provided
    if (apiKeys?.openai) {
      const globalConfig = JSON.parse(localStorage.getItem('ai-flow-global-config') || '{}');
      globalConfig.openaiApiKey = apiKeys.openai;
      localStorage.setItem('ai-flow-global-config', JSON.stringify(globalConfig));
    }
    
    // Load initial flow if provided
    if (initialFlow) {
      localStorage.setItem('ai-flow-canvas-state', JSON.stringify(initialFlow));
    }
  }, [apiKeys, initialFlow]);

  return (
    <div className={`ai-flow-canvas ${className}`} style={style} data-theme={theme}>
      <App 
        onSave={onSave}
        onExecute={onExecute}
        readonly={readonly}
      />
      <Toaster position="top-right" />
    </div>
  );
}