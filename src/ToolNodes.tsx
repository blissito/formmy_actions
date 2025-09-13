/**
 * Tool Nodes - Flowise v2 Pattern
 * Each tool is an independent node that connects to agents
 */

import React, { useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import {
  FiCalculator,
  FiSearch,
  FiFileText,
  FiCode,
  FiSettings,
  FiCopy,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

// Base Tool Node Component
interface BaseToolProps {
  data: any;
  id: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  borderColor: string;
  handleColor: string;
}

function BaseToolNode({
  data,
  id,
  children,
  icon,
  title,
  bgColor,
  borderColor,
  handleColor,
}: BaseToolProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getNodes, setNodes } = useReactFlow();

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}_${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        selected: false,
        data: { ...currentNode.data },
      };
      setNodes((prev) => [...prev, newNode]);
    }
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <div className={`min-w-[180px] max-w-[200px] ${bgColor} border-2 ${borderColor} rounded-2xl shadow hover:shadow-lg transition-all duration-200`}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold text-gray-800">{title}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ?
                <FiChevronUp size={10} className="text-gray-600" /> :
                <FiChevronDown size={10} className="text-gray-600" />
              }
            </button>
            <button
              onClick={handleDuplicate}
              className="w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Duplicate"
            >
              <FiCopy size={10} className="text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <FiTrash2 size={10} className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="mt-3 transition-all duration-300">
            {children}
          </div>
        )}

        {/* Status */}
        <div className="text-center text-xs text-gray-600 mt-2">
          Ready to connect
        </div>
      </div>

      {/* Output Handle - Tools output their results to agents */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${handleColor} border-2 border-white shadow-sm`}
      />
    </div>
  );
}

// Calculator Tool Node
export function CalculatorToolNode({ data, id }: NodeProps) {
  const [expression, setExpression] = useState(String(data?.expression || ''));
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    setExpression(String(data?.expression || ''));
  }, [data]);

  const handleExpressionChange = (newExpression: string) => {
    setExpression(newExpression);
    updateNodeData(id, { ...data, expression: newExpression });
  };

  return (
    <BaseToolNode
      data={data}
      id={id}
      icon={<FiCalculator className="text-blue-600" size={16} />}
      title="Calculator"
      bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
      borderColor="border-blue-300"
      handleColor="bg-blue-500"
    >
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700 block">
          Expression
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => handleExpressionChange(e.target.value)}
          className="w-full p-2 border border-blue-200 rounded text-xs"
          placeholder="2 + 2 * 3"
        />
        <div className="text-xs text-gray-500">
          Performs mathematical calculations
        </div>
      </div>
    </BaseToolNode>
  );
}

// Web Search Tool Node
export function WebSearchToolNode({ data, id }: NodeProps) {
  const [query, setQuery] = useState(String(data?.query || ''));
  const [maxResults, setMaxResults] = useState(Number(data?.maxResults || 5));
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    setQuery(String(data?.query || ''));
    setMaxResults(Number(data?.maxResults || 5));
  }, [data]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    updateNodeData(id, { ...data, query: newQuery });
  };

  const handleMaxResultsChange = (newMax: number) => {
    setMaxResults(newMax);
    updateNodeData(id, { ...data, maxResults: newMax });
  };

  return (
    <BaseToolNode
      data={data}
      id={id}
      icon={<FiSearch className="text-green-600" size={16} />}
      title="Web Search"
      bgColor="bg-gradient-to-br from-green-50 to-green-100"
      borderColor="border-green-300"
      handleColor="bg-green-500"
    >
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-gray-700 block">
            Search Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full p-2 border border-green-200 rounded text-xs"
            placeholder="AI news 2024"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block">
            Max Results
          </label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => handleMaxResultsChange(parseInt(e.target.value) || 5)}
            className="w-full p-2 border border-green-200 rounded text-xs"
            min={1}
            max={20}
          />
        </div>
        <div className="text-xs text-gray-500">
          Searches the web for information
        </div>
      </div>
    </BaseToolNode>
  );
}

// File Reader Tool Node
export function FileReaderToolNode({ data, id }: NodeProps) {
  const [filePath, setFilePath] = useState(String(data?.filePath || ''));
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    setFilePath(String(data?.filePath || ''));
  }, [data]);

  const handleFilePathChange = (newPath: string) => {
    setFilePath(newPath);
    updateNodeData(id, { ...data, filePath: newPath });
  };

  return (
    <BaseToolNode
      data={data}
      id={id}
      icon={<FiFileText className="text-orange-600" size={16} />}
      title="File Reader"
      bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
      borderColor="border-orange-300"
      handleColor="bg-orange-500"
    >
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700 block">
          File Path
        </label>
        <input
          type="text"
          value={filePath}
          onChange={(e) => handleFilePathChange(e.target.value)}
          className="w-full p-2 border border-orange-200 rounded text-xs"
          placeholder="/path/to/file.txt"
        />
        <div className="text-xs text-gray-500">
          Reads content from local files
        </div>
      </div>
    </BaseToolNode>
  );
}

// Code Interpreter Tool Node
export function CodeInterpreterToolNode({ data, id }: NodeProps) {
  const [language, setLanguage] = useState(String(data?.language || 'python'));
  const [code, setCode] = useState(String(data?.code || ''));
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    setLanguage(String(data?.language || 'python'));
    setCode(String(data?.code || ''));
  }, [data]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    updateNodeData(id, { ...data, language: newLang });
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    updateNodeData(id, { ...data, code: newCode });
  };

  return (
    <BaseToolNode
      data={data}
      id={id}
      icon={<FiCode className="text-purple-600" size={16} />}
      title="Code Interpreter"
      bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
      borderColor="border-purple-300"
      handleColor="bg-purple-500"
    >
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium text-gray-700 block">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full p-2 border border-purple-200 rounded text-xs"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="bash">Bash</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block">
            Code
          </label>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full p-2 border border-purple-200 rounded text-xs font-mono"
            rows={3}
            placeholder="print('Hello World')"
          />
        </div>
        <div className="text-xs text-gray-500">
          Executes code in various languages
        </div>
      </div>
    </BaseToolNode>
  );
}