import type { Node, Edge } from '@xyflow/react';
import yaml from 'js-yaml';

export interface FlowExport {
  flow: {
    id: string;
    name: string;
    version: string;
    meta: {
      created: string;
      author: string;
      description: string;
    };
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data?: any;
      executor?: string;
      config?: any;
    }>;
    edges: Array<{
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    executors?: Record<string, {
      runtime: string;
      code: string;
    }>;
  };
}

export class FlowExporter {
  /**
   * Export flow to YAML format
   */
  static exportToYAML(
    nodes: Node[], 
    edges: Edge[], 
    metadata?: {
      name?: string;
      description?: string;
      author?: string;
    }
  ): string {
    const flowExport: FlowExport = {
      flow: {
        id: `flow-${Date.now()}`,
        name: metadata?.name || 'Untitled Flow',
        version: '1.0.0',
        meta: {
          created: new Date().toISOString(),
          author: metadata?.author || 'formmy',
          description: metadata?.description || 'AI workflow'
        },
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'custom',
          position: node.position,
          data: node.data,
          executor: node.data?.executor as string,
          config: node.data?.config
        })),
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined
        }))
      }
    };
    
    return yaml.dump(flowExport, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
  }
  
  /**
   * Export flow to JSON format
   */
  static exportToJSON(nodes: Node[], edges: Edge[], metadata?: any): string {
    const flowExport: FlowExport = {
      flow: {
        id: `flow-${Date.now()}`,
        name: metadata?.name || 'Untitled Flow',
        version: '1.0.0',
        meta: {
          created: new Date().toISOString(),
          author: metadata?.author || 'formmy',
          description: metadata?.description || 'AI workflow'
        },
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'custom',
          position: node.position,
          data: node.data,
          executor: node.data?.executor as string,
          config: node.data?.config
        })),
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined
        }))
      }
    };
    
    return JSON.stringify(flowExport, null, 2);
  }
  
  /**
   * Import flow from YAML
   */
  static importFromYAML(yamlContent: string): { nodes: Node[], edges: Edge[] } {
    try {
      const parsed = yaml.load(yamlContent) as FlowExport;
      
      const nodes: Node[] = parsed.flow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          executor: node.executor,
          config: node.config
        }
      }));
      
      const edges: Edge[] = parsed.flow.edges.map(edge => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }));
      
      return { nodes, edges };
    } catch (error) {
      console.error('Failed to import YAML:', error);
      throw new Error('Invalid YAML format');
    }
  }
  
  /**
   * Import flow from JSON
   */
  static importFromJSON(jsonContent: string): { nodes: Node[], edges: Edge[] } {
    try {
      const parsed = JSON.parse(jsonContent) as FlowExport;
      
      const nodes: Node[] = parsed.flow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          executor: node.executor,
          config: node.config
        }
      }));
      
      const edges: Edge[] = parsed.flow.edges.map(edge => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }));
      
      return { nodes, edges };
    } catch (error) {
      console.error('Failed to import JSON:', error);
      throw new Error('Invalid JSON format');
    }
  }
  
  /**
   * Download flow as file
   */
  static downloadFlow(
    nodes: Node[], 
    edges: Edge[], 
    format: 'yaml' | 'json' = 'yaml',
    filename?: string
  ): void {
    const content = format === 'yaml' 
      ? this.exportToYAML(nodes, edges)
      : this.exportToJSON(nodes, edges);
    
    const blob = new Blob([content], { 
      type: format === 'yaml' ? 'text/yaml' : 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `flow-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Load flow from file
   */
  static async loadFlowFromFile(file: File): Promise<{ nodes: Node[], edges: Edge[] }> {
    const content = await file.text();
    const format = file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : 'json';
    
    return format === 'yaml' 
      ? this.importFromYAML(content)
      : this.importFromJSON(content);
  }
}