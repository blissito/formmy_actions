// Generated from llamaindex-vectorstoreindex.yaml
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface LlamaindexVectorStoreIndexProps {
  data: {
    label: string;
    parameters: {
      chunk_size: number;
      chunk_overlap: number;
      embedding_model: string;
    };
  };
}

export const LlamaindexVectorStoreIndex: React.FC<LlamaindexVectorStoreIndexProps> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2" style={{ borderColor: '#10b981' }}>
      <Handle type="target" position={Position.Left} id="documents" style={{ top: 20 }} />
      <Handle type="target" position={Position.Left} id="service_context" style={{ top: 45 }} />
      
      <div className="flex">
        <div className="text-lg">🗄️</div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">Creates a vector store index from documents for semantic search</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="index" style={{ top: 20 }} />
    </div>
  );
};
