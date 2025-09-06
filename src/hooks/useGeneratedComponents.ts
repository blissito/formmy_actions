import { useState, useEffect } from 'react';
import type { GeneratedComponentInfo } from '../types/ComponentTypes';

export function useGeneratedComponents() {
  const [components, setComponents] = useState<GeneratedComponentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGeneratedComponents();
  }, []);

  const loadGeneratedComponents = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, you'd fetch this from the file system
      // For now, we'll simulate reading the generated components
      const mockComponents: GeneratedComponentInfo[] = [
        {
          name: 'ChatOpenAI',
          framework: 'langchain',
          category: 'processor',
          description: 'OpenAI Chat model for conversational AI',
          ui: {
            icon: '🤖',
            color: '#f59e0b'
          },
          yamlPath: './components/langchain-chatgpt.yaml',
          componentPath: './src/components/generated/LangchainChatOpenAI.tsx',
          available: true
        },
        {
          name: 'VectorStoreIndex',
          framework: 'llamaindex',
          category: 'memory',
          description: 'Creates a vector store index from documents',
          ui: {
            icon: '🗄️',
            color: '#10b981'
          },
          yamlPath: './components/llamaindex-vectorstore.yaml',
          componentPath: './src/components/generated/LlamaindexVectorStoreIndex.tsx',
          available: true
        },
        {
          name: 'RAGPipeline',
          framework: 'custom',
          category: 'processor',
          description: 'Complete RAG pipeline with vector search',
          ui: {
            icon: '🔍',
            color: '#ec4899'
          },
          yamlPath: './components/custom-rag-pipeline.yaml',
          componentPath: './src/components/generated/CustomRAGPipeline.tsx',
          available: true
        },
        {
          name: 'BootstrapGenerator',
          framework: 'meta',
          category: 'tool',
          description: 'The generator that builds itself!',
          ui: {
            icon: '⚡',
            color: '#8b5cf6'
          },
          yamlPath: './components/meta-generator.yaml',
          componentPath: './src/components/generated/MetaBootstrapGenerator.tsx',
          available: true
        }
      ];

      // In a real implementation, you would:
      // 1. Read the components directory to find YAML files
      // 2. Parse each YAML to get component info
      // 3. Check if corresponding .tsx file exists in generated directory
      
      setComponents(mockComponents);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  const refreshComponents = () => {
    loadGeneratedComponents();
  };

  const getComponentsByFramework = (framework: string) => {
    return components.filter(comp => comp.framework === framework);
  };

  const getComponentsByCategory = (category: string) => {
    return components.filter(comp => comp.category === category);
  };

  const getAvailableComponents = () => {
    return components.filter(comp => comp.available);
  };

  return {
    components,
    loading,
    error,
    refreshComponents,
    getComponentsByFramework,
    getComponentsByCategory,
    getAvailableComponents
  };
}

// Hook to dynamically import and register components
export function useComponentImports() {
  const [importedComponents, setImportedComponents] = useState<Record<string, any>>({});
  const [importLoading, setImportLoading] = useState(false);

  const importComponent = async (componentInfo: GeneratedComponentInfo) => {
    try {
      setImportLoading(true);
      
      // Dynamic import of the generated component
      // Note: This is a simplified version. In a real app, you'd need proper module loading
      const componentKey = `${componentInfo.framework}_${componentInfo.name}`;
      
      // Simulate component import
      const mockComponent = {
        name: componentInfo.name,
        render: ({ data }: any) => ({
          type: 'div',
          props: {
            className: 'px-4 py-2 shadow-md rounded-md bg-white border-2',
            style: { borderColor: componentInfo.ui.color },
            children: [
              {
                type: 'div',
                props: {
                  className: 'flex items-center gap-2',
                  children: [
                    { type: 'span', props: { children: componentInfo.ui.icon } },
                    { type: 'span', props: { children: data.label || componentInfo.name } }
                  ]
                }
              }
            ]
          }
        })
      };
      
      setImportedComponents(prev => ({
        ...prev,
        [componentKey]: mockComponent
      }));
      
      return mockComponent;
      
    } catch (error) {
      console.error(`Failed to import component ${componentInfo.name}:`, error);
      return null;
    } finally {
      setImportLoading(false);
    }
  };

  const importAllComponents = async (components: GeneratedComponentInfo[]) => {
    for (const component of components) {
      await importComponent(component);
    }
  };

  return {
    importedComponents,
    importLoading,
    importComponent,
    importAllComponents
  };
}