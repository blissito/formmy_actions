import React, { useState, useEffect } from 'react';
import { FiPlay, FiSettings } from 'react-icons/fi';
import { executorRegistry } from '../runtime/ExecutorFramework';
import type { ToolDefinition } from '../runtime/ExecutorFramework';
import { cn } from '../utils/cn';
import InlineBetaBadge from '../InlineBetaBadge';

interface FrameworkSidebarProps {
  isExecuting: boolean;
  onExecuteFlow: () => void;
  onShowGlobalSettings: () => void;
  onDragStart: (event: React.DragEvent, toolId: string, framework: string) => void;
  executionResult: any;
  executionLogs: string[];
}

interface ToolsByFramework {
  [frameworkName: string]: ToolDefinition[];
}

interface ToolsByCategory {
  [frameworkName: string]: {
    [category: string]: ToolDefinition[];
  };
}

export default function FrameworkSidebar({
  isExecuting,
  onExecuteFlow,
  onShowGlobalSettings,
  onDragStart,
  executionResult,
  executionLogs,
}: FrameworkSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('vercel-ai');
  const [toolsByFramework, setToolsByFramework] = useState<ToolsByCategory>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tools from all registered executors
    const loadTools = async () => {
      try {
        const categorizedTools = await executorRegistry.getToolsByCategory();
        setToolsByFramework(categorizedTools);
        
        // Set first available framework as active if vercel-ai is not available
        const frameworks = Object.keys(categorizedTools);
        if (frameworks.length > 0 && !categorizedTools['vercel-ai']) {
          setActiveTab(frameworks[0]);
        }
      } catch (error) {
        console.error('Error loading tools:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const frameworks = Object.keys(toolsByFramework);
  const currentFrameworkTools = toolsByFramework[activeTab] || {};

  const getFrameworkDisplayName = (frameworkName: string): string => {
    const executor = executorRegistry.getExecutor(frameworkName);
    return executor?.displayName || frameworkName;
  };

  const getFrameworkColor = (frameworkName: string): string => {
    switch (frameworkName) {
      case 'vercel-ai':
        return 'border-blue-500 text-blue-600 bg-blue-50';
      case 'llamaindex':
        return 'border-purple-500 text-purple-600 bg-purple-50';
      case 'langchain':
        return 'border-green-500 text-green-600 bg-green-50';
      default:
        return 'border-gray-500 text-gray-600 bg-gray-50';
    }
  };

  const getActiveFrameworkColor = (frameworkName: string): string => {
    switch (frameworkName) {
      case 'vercel-ai':
        return 'border-blue-500 bg-blue-500 text-white';
      case 'llamaindex':
        return 'border-purple-500 bg-purple-500 text-white';
      case 'langchain':
        return 'border-green-500 bg-green-500 text-white';
      default:
        return 'border-gray-500 bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div
        data-sidebar
        className="w-72 min-w-72 max-w-72 flex-shrink-0 bg-white border-r border-gray-200 shadow-lg z-20 flex flex-col max-h-screen"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading tools...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-sidebar
      className="w-72 min-w-72 max-w-72 flex-shrink-0 bg-white border-r border-gray-200 shadow-lg z-20 flex flex-col max-h-screen"
      style={{ maxWidth: "288px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          AI Tools
          <InlineBetaBadge />
        </h3>
        <button
          onClick={onShowGlobalSettings}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Global Settings"
        >
          <FiSettings size={16} />
        </button>
      </div>

      {/* Framework Tabs */}
      {frameworks.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {frameworks.map((framework) => (
              <button
                key={framework}
                onClick={() => setActiveTab(framework)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                  activeTab === framework
                    ? getActiveFrameworkColor(framework)
                    : getFrameworkColor(framework)
                )}
              >
                {getFrameworkDisplayName(framework)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Execute Button */}
        <div className="mb-6">
          <button
            data-execute-btn
            onClick={onExecuteFlow}
            disabled={isExecuting}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2",
              isExecuting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl"
            )}
          >
            <FiPlay size={16} />
            {isExecuting ? "Executing..." : "Execute Flow"}
          </button>

          {executionResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
              <div className="font-bold text-gray-700 mb-2">
                Status: {executionResult.status}
              </div>
              {executionLogs.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  {executionLogs.slice(-5).map((log, i) => (
                    <div key={i} className="text-gray-600 text-[10px] py-1">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tools by Category */}
        <div className="space-y-6">
          {Object.entries(currentFrameworkTools).map(([category, tools]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {category}
              </h4>
              <div className="space-y-2">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    data-node-item
                    className="w-full bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:border-gray-400 cursor-grab active:cursor-grabbing transition-all flex items-center p-3"
                    draggable
                    onDragStart={(event) => onDragStart(event, tool.id, tool.framework)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm flex-shrink-0 mr-3">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                        {tool.name}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h4 className="font-semibold text-xs text-gray-700 mb-3">
            💡 How to use:
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Drag tools to canvas</li>
            <li>• Connect left → right</li>
            <li>• Configure each tool</li>
            <li>• Execute flow</li>
            <li>• Use Cmd/Ctrl+S to save</li>
          </ul>
        </div>

        {/* No Vendor Lock-in Badge */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            🔓 No Vendor Lock-in
          </div>
          <div className="text-xs text-gray-600">
            Mix and match tools from different AI frameworks in the same workflow.
          </div>
        </div>
      </div>
    </div>
  );
}