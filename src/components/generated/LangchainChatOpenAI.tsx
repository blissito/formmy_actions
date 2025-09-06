// Generated from langchain-chatopenai.yaml
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface LangchainChatOpenAIProps {
  data: {
    label: string;
    parameters: {
      model_name: string;
      temperature: number;
      max_tokens: number;
    };
  };
}

export const LangchainChatOpenAI: React.FC<LangchainChatOpenAIProps> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2" style={{ borderColor: '#f59e0b' }}>
      <Handle type="target" position={Position.Left} id="messages" style={{ top: 20 }} />
      <Handle type="target" position={Position.Left} id="system_prompt" style={{ top: 45 }} />
      
      <div className="flex">
        <div className="text-lg">🤖</div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">OpenAI Chat model for conversational AI</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="response" style={{ top: 20 }} />
      <Handle type="source" position={Position.Right} id="token_usage" style={{ top: 45 }} />
    </div>
  );
};
