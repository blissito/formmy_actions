// Generated from meta-bootstrapgenerator.yaml
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface MetaBootstrapGeneratorProps {
  data: {
    label: string;
    parameters: {
      generate_typescript: boolean;
      include_tests: boolean;
      output_directory: string;
      self_improvement_mode: boolean;
    };
  };
}

export const MetaBootstrapGenerator: React.FC<MetaBootstrapGeneratorProps> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2" style={{ borderColor: '#8b5cf6' }}>
      <Handle type="target" position={Position.Left} id="yaml_definition" style={{ top: 20 }} />
      <Handle type="target" position={Position.Left} id="target_framework" style={{ top: 45 }} />
      
      <div className="flex">
        <div className="text-lg">⚡</div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">Generates React Flow components from YAML definitions - the tool that builds itself!</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="react_component" style={{ top: 20 }} />
      <Handle type="source" position={Position.Right} id="flow_node" style={{ top: 45 }} />
    </div>
  );
};
