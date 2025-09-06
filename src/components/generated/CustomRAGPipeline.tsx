// Generated from custom-ragpipeline.yaml
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomRAGPipelineProps {
  data: {
    label: string;
    parameters: {
      retrieval_count: number;
      model_name: string;
      temperature: number;
      include_sources: boolean;
    };
  };
}

export const CustomRAGPipeline: React.FC<CustomRAGPipelineProps> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2" style={{ borderColor: '#ec4899' }}>
      <Handle type="target" position={Position.Left} id="query" style={{ top: 20 }} />
      <Handle type="target" position={Position.Left} id="documents" style={{ top: 45 }} />
      <Handle type="target" position={Position.Left} id="context" style={{ top: 70 }} />
      
      <div className="flex">
        <div className="text-lg">🔍</div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">Complete RAG pipeline with vector search and answer generation</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="answer" style={{ top: 20 }} />
      <Handle type="source" position={Position.Right} id="sources" style={{ top: 45 }} />
      <Handle type="source" position={Position.Right} id="confidence" style={{ top: 70 }} />
    </div>
  );
};
