import React from 'react';
import { Toaster } from 'react-hot-toast';
import App from './App';
import StyleIsolator from './StyleIsolator';
import AggressiveStyleIsolator from './AggressiveStyleIsolator';
import './isolated-styles.css';

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
  
  /**
   * Whether to show the toaster notifications
   */
  showToaster?: boolean;
  
  /**
   * Force aggressive CSS isolation with !important declarations
   * Use this when external frameworks (Tailwind, Bootstrap) interfere
   */
  forceIsolation?: boolean;
  
  /**
   * CSS reset strategy for style isolation
   * - 'revert': Reverts to browser defaults (good for Tailwind override)
   * - 'unset': Removes all styles (most aggressive)
   * - 'initial': Sets to CSS initial values
   */
  resetCSS?: 'revert' | 'unset' | 'initial';
  
  /**
   * Custom styles for the container (applied with high specificity)
   */
  customStyles?: React.CSSProperties;
  
  /**
   * Override Tailwind classes for styling (uses tailwind-merge for conflict resolution)
   * 
   * @example
   * // Change button color from green to purple
   * <AIFlowCanvas className="[&_[data-execute-btn]]:bg-purple-500 [&_[data-execute-btn]:hover]:bg-purple-600" />
   * 
   * // Change sidebar background
   * <AIFlowCanvas className="[&_[data-sidebar]]:bg-gray-100" />
   * 
   * // Multiple customizations
   * <AIFlowCanvas className="[&_[data-execute-btn]]:bg-red-500 [&_[data-node-item]]:border-blue-500" />
   */
  
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
  showToaster = true,
  forceIsolation = false,
  resetCSS = 'revert',
  customStyles = {},
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

  // Create the container styles with aggressive isolation if needed
  const containerStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    minHeight: '400px', // Minimum height for usability
    display: 'block',
    position: 'relative',
    overflow: 'hidden', // Prevent scroll generation
    boxSizing: 'border-box',
    ...customStyles,
    ...(forceIsolation && {
      all: resetCSS as any,
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#374151',
      isolation: 'isolate',
      overflow: 'hidden',
    }),
    ...style, // Legacy style prop override
  };

  // Temporarily disable AggressiveStyleIsolator to prevent Tailwind blocking
  const IsolatorComponent = StyleIsolator; // forceIsolation ? AggressiveStyleIsolator : StyleIsolator;

  return (
    <IsolatorComponent 
      className={`ai-flow-canvas ${className}`} 
      style={containerStyles}
    >
      <div 
        data-theme={theme} 
        style={{ 
          width: '100%', 
          height: '100%',
          maxHeight: '100%',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <App 
          onSave={onSave}
          onExecute={onExecute}
          readonly={readonly}
        />
        {showToaster && <Toaster position="top-right" />}
      </div>
    </IsolatorComponent>
  );
}