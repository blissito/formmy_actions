/**
 * Agent Node Components
 * Hybrid approach: Flowise functionality + formmy-actions design system
 */

import React, { useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { useWorkflowExecution } from './runtime/WorkflowExecutionContext';
import {
  FiMessageCircle,
  FiZap,
  FiCopy,
  FiTrash2,
  FiSettings,
  FiPlay,
  FiPause,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { TbBrain } from 'react-icons/tb';

// Agent execution statuses
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused';

interface BaseAgentProps {
  data: any;
  id: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  bgGradient: string;
  borderColor: string;
  handleColor: string;
  status?: AgentStatus;
  progress?: number;
}

// Base Agent Component with shared functionality
function BaseAgentNode({
  data,
  id,
  children,
  icon,
  title,
  bgGradient,
  borderColor,
  handleColor,
  status = 'idle',
  progress
}: BaseAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const { getNodes, setNodes } = useReactFlow();

  // Status indicator styling
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-100',
          icon: <FiLoader className="animate-spin" size={12} />
        };
      case 'completed':
        return {
          bg: 'bg-green-500',
          text: 'text-green-100',
          icon: <FiCheck size={12} />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-red-100',
          icon: <FiAlertCircle size={12} />
        };
      case 'paused':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-100',
          icon: <FiPause size={12} />
        };
      default:
        return {
          bg: 'bg-gray-400',
          text: 'text-gray-100',
          icon: <FiPlay size={12} />
        };
    }
  };

  const statusStyles = getStatusStyles();

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}_${Date.now()}`,
        position: {
          x: currentNode.position.x + 60,
          y: currentNode.position.y + 60,
        },
        selected: false,
        data: {
          ...currentNode.data,
        },
      };
      setNodes((prev) => [...prev, newNode]);
    }
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <div className={`min-w-full relative ${bgGradient} border-2 ${borderColor} rounded-3xl shadow hover:shadow-xl transition-all duration-200 ${status === 'running' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>

      {/* Status Badge */}
      {status !== 'idle' && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${statusStyles.bg} ${statusStyles.text} flex items-center justify-center shadow-lg z-10`}>
          {statusStyles.icon}
        </div>
      )}

      {/* Progress Bar */}
      {status === 'running' && progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-3xl overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold text-gray-800">{title}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ?
                <FiChevronUp size={12} className="text-gray-600" /> :
                <FiChevronDown size={12} className="text-gray-600" />
              }
            </button>
            <button
              onClick={handleDuplicate}
              className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Duplicate"
            >
              <FiCopy size={12} className="text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <FiTrash2 size={12} className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-20'} overflow-hidden`}>
          {children}
        </div>

        {/* Tools Display */}
        {data?.tools && data.tools.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowTools(!showTools)}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <FiSettings size={10} />
              {data.tools.length} tools
              {showTools ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
            </button>

            {showTools && (
              <div className="mt-2 flex flex-wrap gap-1">
                {data.tools.map((tool: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white bg-opacity-60 rounded-lg text-xs font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-4 h-4 ${handleColor} border-2 border-white shadow-md`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-4 h-4 ${handleColor} border-2 border-white shadow-md`}
      />
    </div>
  );
}

// ReAct Agent Node
export function ReactAgentNode({ data, id }: NodeProps) {
  const {
    workflowState,
    executeNode,
    getGlobalData,
    setGlobalData,
    getNodeState
  } = useWorkflowExecution();

  const [task, setTask] = useState(String(data?.task || ''));
  const [maxIterations, setMaxIterations] = useState(Number(data?.maxIterations || 5));
  const { updateNodeData } = useReactFlow();

  // Get current node state from global context
  const nodeState = getNodeState(id);
  const status = nodeState.status as AgentStatus;

  useEffect(() => {
    setTask(String(data?.task || ''));
    setMaxIterations(Number(data?.maxIterations || 5));
  }, [data]);

  const handleTaskChange = (newTask: string) => {
    setTask(newTask);
    updateNodeData(id, { ...data, task: newTask });
  };

  const handleMaxIterationsChange = (newMax: number) => {
    setMaxIterations(newMax);
    updateNodeData(id, { ...data, maxIterations: newMax });
  };

  // Execute agent with global context
  const handleExecute = async () => {
    if (status === 'running' || !task.trim()) return;

    try {
      // Get input data from previous nodes
      const inputData = getGlobalData('workflow_input') || getGlobalData('user_input') || task;

      // Execute this node with global workflow context
      const result = await executeNode(id, 'react-agent', {
        task: task,
        maxIterations: maxIterations,
        inputData: inputData,
        context: workflowState.globalData
      });

      // Store result in global data for downstream nodes
      setGlobalData(`react_agent_${id}_result`, {
        task: task,
        result: result,
        timestamp: new Date().toISOString(),
        iterations: result?.iterations || 0
      });

      console.log(`🤖 ReAct Agent ${id} completed:`, result);
    } catch (error) {
      console.error(`❌ ReAct Agent ${id} failed:`, error);
    }
  };

  return (
    <BaseAgentNode
      data={data}
      id={id}
      icon={<TbBrain className="text-purple-600" size={18} />}
      title="ReAct Agent"
      bgGradient="bg-gradient-to-br from-purple-50 to-purple-100"
      borderColor="border-purple-300"
      handleColor="bg-purple-500"
      status={status}
      progress={data?.progress as number}
    >
      {/* Task Input */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Task Description
          </label>
          <textarea
            value={task}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="w-full p-2 border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none text-xs"
            rows={3}
            placeholder="Describe what the agent should accomplish..."
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">
            Max Iterations:
          </label>
          <input
            type="number"
            value={maxIterations}
            onChange={(e) => handleMaxIterationsChange(parseInt(e.target.value) || 5)}
            className="w-16 p-1 border border-purple-200 rounded text-xs text-center"
            min={1}
            max={20}
          />
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={status === 'running' || !task.trim()}
          className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            status === 'running' || !task.trim()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {status === 'running' ? 'Executing...' : 'Execute Agent'}
        </button>

        {/* Global Workflow Info */}
        {workflowState.executionId && (
          <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Workflow: {workflowState.executionId.slice(-8)}</span>
              <span>Status: {nodeState.status || 'idle'}</span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {(nodeState.result || data?.result) && (
          <div className="mt-3 p-2 bg-white bg-opacity-60 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">Result:</div>
            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
              {String(nodeState.result || data.result)}
            </div>
          </div>
        )}
      </div>
    </BaseAgentNode>
  );
}

// Conversational Agent Node
export function ConversationalAgentNode({ data, id }: NodeProps) {
  const {
    workflowState,
    executeNode,
    getGlobalData,
    setGlobalData,
    getNodeState
  } = useWorkflowExecution();

  const [message, setMessage] = useState(String(data?.message || ''));
  const [systemMessage, setSystemMessage] = useState(String(data?.systemMessage || ''));
  const { updateNodeData } = useReactFlow();

  // Get current node state from global context
  const nodeState = getNodeState(id);
  const status = nodeState.status as AgentStatus;

  useEffect(() => {
    setMessage(String(data?.message || ''));
    setSystemMessage(String(data?.systemMessage || ''));
  }, [data]);

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    updateNodeData(id, { ...data, message: newMessage });
  };

  const handleSystemMessageChange = (newSystemMessage: string) => {
    setSystemMessage(newSystemMessage);
    updateNodeData(id, { ...data, systemMessage: newSystemMessage });
  };

  // Execute agent with global context
  const handleExecute = async () => {
    if (status === 'running' || !message.trim()) return;

    try {
      // Get input data from previous nodes
      const inputData = getGlobalData('workflow_input') || getGlobalData('user_input') || message;

      // Execute this node with global workflow context
      const result = await executeNode(id, 'conversational-agent', {
        message: message,
        systemMessage: systemMessage,
        inputData: inputData,
        context: workflowState.globalData
      });

      // Store result in global data for downstream nodes
      setGlobalData(`conversational_agent_${id}_result`, {
        message: message,
        response: result?.response || result,
        timestamp: new Date().toISOString(),
        systemMessage: systemMessage
      });

      console.log(`💭 Conversational Agent ${id} completed:`, result);
    } catch (error) {
      console.error(`❌ Conversational Agent ${id} failed:`, error);
    }
  };

  return (
    <BaseAgentNode
      data={data}
      id={id}
      icon={<FiMessageCircle className="text-green-600" size={18} />}
      title="Conversational Agent"
      bgGradient="bg-gradient-to-br from-green-50 to-green-100"
      borderColor="border-green-300"
      handleColor="bg-green-500"
      status={status}
      progress={data?.progress as number}
    >
      <div className="space-y-3">
        {/* Message Input */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            className="w-full p-2 border border-green-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none text-xs"
            rows={2}
            placeholder="What do you want to ask the agent?"
          />
        </div>

        {/* System Message */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            System Message (Optional)
          </label>
          <textarea
            value={systemMessage}
            onChange={(e) => handleSystemMessageChange(e.target.value)}
            className="w-full p-2 border border-green-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none text-xs"
            rows={2}
            placeholder="Custom instructions for the agent..."
          />
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={status === 'running' || !message.trim()}
          className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            status === 'running' || !message.trim()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {status === 'running' ? 'Processing...' : 'Execute Agent'}
        </button>

        {/* Global Workflow Info */}
        {workflowState.executionId && (
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Workflow: {workflowState.executionId.slice(-8)}</span>
              <span>Status: {nodeState.status || 'idle'}</span>
            </div>
          </div>
        )}

        {/* Conversation History */}
        {(nodeState.result || data?.history) && (
          <div className="mt-3 p-2 bg-white bg-opacity-60 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Last Response:
            </div>
            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
              {String(nodeState.result?.response || data.history?.[data.history.length - 1]?.response || 'No response yet')}
            </div>
          </div>
        )}
      </div>
    </BaseAgentNode>
  );
}

// Workflow Generator Node
export function WorkflowGeneratorNode({ data, id }: NodeProps) {
  const [description, setDescription] = useState(String(data?.description || ''));
  const [goal, setGoal] = useState(String(data?.goal || ''));
  const { updateNodeData, getNodes, setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    setDescription(String(data?.description || ''));
    setGoal(String(data?.goal || ''));
  }, [data]);

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    updateNodeData(id, { ...data, description: newDescription });
  };

  const handleGoalChange = (newGoal: string) => {
    setGoal(newGoal);
    updateNodeData(id, { ...data, goal: newGoal });
  };

  const generateWorkflow = () => {
    if (!description.trim() || !goal.trim()) {
      alert('Please provide both description and goal');
      return;
    }

    // Generate a simple workflow based on the inputs
    const workflows = [
      // Customer Support Workflow
      {
        condition: (desc: string, goal: string) =>
          desc.toLowerCase().includes('customer') || desc.toLowerCase().includes('support') ||
          goal.toLowerCase().includes('help') || goal.toLowerCase().includes('customer'),
        nodes: [
          { id: 'start_gen', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Customer Query Start' } },
          { id: 'agent_gen', type: 'conversational-agent', position: { x: 300, y: 100 }, data: { label: 'Support Agent', systemMessage: 'You are a helpful customer support agent.' } },
          { id: 'chat_gen', type: 'chat', position: { x: 500, y: 100 }, data: { label: 'Customer Chat' } }
        ],
        edges: [
          { id: 'e1_gen', source: 'start_gen', target: 'agent_gen' },
          { id: 'e2_gen', source: 'agent_gen', target: 'chat_gen' }
        ]
      },
      // Research Workflow
      {
        condition: (desc: string, goal: string) =>
          desc.toLowerCase().includes('research') || desc.toLowerCase().includes('analyze') ||
          goal.toLowerCase().includes('research') || goal.toLowerCase().includes('analyze'),
        nodes: [
          { id: 'start_gen', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Research Start' } },
          { id: 'react_gen', type: 'react-agent', position: { x: 300, y: 100 }, data: { label: 'Research Agent', task: goal } },
          { id: 'chat_gen', type: 'chat', position: { x: 500, y: 100 }, data: { label: 'Results Display' } }
        ],
        edges: [
          { id: 'e1_gen', source: 'start_gen', target: 'react_gen' },
          { id: 'e2_gen', source: 'react_gen', target: 'chat_gen' }
        ]
      },
      // Default Workflow
      {
        condition: () => true,
        nodes: [
          { id: 'start_gen', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Workflow Start' } },
          { id: 'input_gen', type: 'input', position: { x: 300, y: 150 }, data: { text: description, label: 'User Input' } },
          { id: 'agent_gen', type: 'conversational-agent', position: { x: 300, y: 250 }, data: { label: 'AI Agent', message: goal } },
          { id: 'chat_gen', type: 'chat', position: { x: 500, y: 200 }, data: { label: 'Chat Interface' } }
        ],
        edges: [
          { id: 'e1_gen', source: 'start_gen', target: 'input_gen' },
          { id: 'e2_gen', source: 'start_gen', target: 'agent_gen' },
          { id: 'e3_gen', source: 'input_gen', target: 'chat_gen' },
          { id: 'e4_gen', source: 'agent_gen', target: 'chat_gen' }
        ]
      }
    ];

    // Find the matching workflow
    const selectedWorkflow = workflows.find(w => w.condition(description, goal)) || workflows[workflows.length - 1];

    // Add unique timestamps to avoid ID conflicts
    const timestamp = Date.now();
    const newNodes = selectedWorkflow.nodes.map(node => ({
      ...node,
      id: `${node.id}_${timestamp}`,
      selected: false
    }));

    const newEdges = selectedWorkflow.edges.map(edge => ({
      ...edge,
      id: `${edge.id}_${timestamp}`,
      source: `${edge.source}_${timestamp}`,
      target: `${edge.target}_${timestamp}`,
      type: 'smoothstep',
      animated: true
    }));

    // Add to canvas
    setNodes(prev => [...prev, ...newNodes]);
    setEdges(prev => [...prev, ...newEdges]);

    // Update this node with generation info
    const generatedWorkflow = {
      nodes: newNodes.length,
      edges: newEdges.length,
      type: selectedWorkflow === workflows[0] ? 'Customer Support' :
            selectedWorkflow === workflows[1] ? 'Research' : 'General Purpose',
      timestamp: new Date().toISOString()
    };

    updateNodeData(id, {
      ...data,
      workflow: generatedWorkflow,
      lastGenerated: generatedWorkflow.timestamp
    });

    alert(`✅ Generated ${generatedWorkflow.type} workflow with ${generatedWorkflow.nodes} nodes!`);
  };

  return (
    <BaseAgentNode
      data={data}
      id={id}
      icon={<FiZap className="text-orange-600" size={18} />}
      title="Workflow Generator"
      bgGradient="bg-gradient-to-br from-orange-50 to-orange-100"
      borderColor="border-orange-300"
      handleColor="bg-orange-500"
      status={data?.status as AgentStatus}
      progress={data?.progress as number}
    >
      <div className="space-y-3">
        {/* Description */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Workflow Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full p-2 border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent resize-none text-xs"
            rows={2}
            placeholder="Describe the workflow you want to create..."
          />
        </div>

        {/* Goal */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => handleGoalChange(e.target.value)}
            className="w-full p-2 border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent resize-none text-xs"
            rows={2}
            placeholder="What specific goal should this workflow accomplish?"
          />
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={generateWorkflow}
            disabled={!description.trim() || !goal.trim()}
            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FiZap size={14} />
            Generate Workflow
          </button>
        </div>

        {/* Generated Workflow Info */}
        {data?.workflow && (
          <div className="mt-3 p-2 bg-white bg-opacity-60 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">Generated:</div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-orange-200 rounded">
                {(data.workflow as any)?.nodes?.length || 0} nodes
              </span>
              <span className="px-2 py-1 bg-orange-200 rounded">
                {(data.workflow as any)?.edges?.length || 0} connections
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseAgentNode>
  );
}