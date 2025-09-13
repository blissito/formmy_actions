import React, { useState, type DragEvent } from 'react';
import { useGeneratedComponents } from '../hooks/useGeneratedComponents';

interface GeneratedComponentsSidebarProps {
  onDragStart: (event: DragEvent, nodeType: string, componentInfo?: any) => void;
}

export const GeneratedComponentsSidebar: React.FC<GeneratedComponentsSidebarProps> = ({ 
  onDragStart 
}) => {
  const { 
    components, 
    loading, 
    error, 
    refreshComponents,
    getComponentsByFramework 
  } = useGeneratedComponents();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['langchain', 'llamaindex', 'custom'])
  );

  const toggleSection = (framework: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(framework)) {
      newExpanded.delete(framework);
    } else {
      newExpanded.add(framework);
    }
    setExpandedSections(newExpanded);
  };

  const frameworks = Array.from(new Set(components.map(c => c.framework)));

  const getFrameworkColor = (framework: string) => {
    const colors: Record<string, string> = {
      'langchain': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'llamaindex': 'text-green-600 bg-green-50 border-green-200', 
      'custom': 'text-purple-600 bg-purple-50 border-purple-200',
      'meta': 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };
    return colors[framework] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      'input': 'from-blue-400 to-blue-600',
      'processor': 'from-amber-400 to-amber-600', 
      'output': 'from-green-400 to-green-600',
      'memory': 'from-purple-400 to-purple-600',
      'tool': 'from-indigo-400 to-indigo-600'
    };
    return gradients[category] || 'from-gray-400 to-gray-600';
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Loading generated components...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-sm mb-2">⚠️ Error loading components</div>
        <button 
          onClick={refreshComponents}
          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">🎯 Generated Components</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {components.filter(c => c.available).length} available
          </span>
          <button
            onClick={refreshComponents}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            title="Refresh components"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {frameworks.map(framework => {
          const frameworkComponents = getComponentsByFramework(framework);
          const isExpanded = expandedSections.has(framework);
          
          return (
            <div key={framework} className="border border-gray-200 rounded-lg">
              {/* Framework Header */}
              <button
                onClick={() => toggleSection(framework)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${getFrameworkColor(framework)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{framework}</span>
                  <span className="text-xs opacity-70">
                    ({frameworkComponents.length} components)
                  </span>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                  ▶️
                </div>
              </button>

              {/* Components List */}
              {isExpanded && (
                <div className="p-2 space-y-2 bg-white">
                  {frameworkComponents.map(component => (
                    <div
                      key={`${component.framework}-${component.name}`}
                      className={`p-3 border-2 border-dashed rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-lg bg-gradient-to-br from-white to-gray-50`}
                      style={{ borderColor: component.ui.color }}
                      draggable={component.available}
                      onDragStart={(event) => onDragStart(event, 'generated', component)}
                      title={component.available ? 'Drag to canvas' : 'Component not available'}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryGradient(component.category)} flex items-center justify-center text-white font-bold shadow-md`}
                        >
                          {component.ui.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-gray-800">
                            {component.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {component.category}
                          </div>
                        </div>
                        {!component.available && (
                          <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs leading-relaxed">
                        {component.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {components.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-sm">No generated components found</div>
          <div className="text-xs mt-1">Run <code>npm run meta-gen generate</code> to create components</div>
        </div>
      )}
    </div>
  );
};