/**
 * Chat Interface Component
 * Inspired by Flowise Chat - provides real-time conversation interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { useWorkflowExecution } from './runtime/WorkflowExecutionContext';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiCopy,
  FiTrash2,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiSettings,
} from 'react-icons/fi';
import { TbRobot } from 'react-icons/tb';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export function ChatNode({ data, id }: NodeProps) {
  const {
    workflowState,
    executeNode,
    getGlobalData,
    setGlobalData,
    getNodeState
  } = useWorkflowExecution();

  const [messages, setMessages] = useState<Message[]>(data?.messages || []);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateNodeData, getNodes, setNodes } = useReactFlow();

  // Get current node state from global context
  const nodeState = getNodeState(id);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if this node is connected to get input
    const nodes = getNodes();
    const currentNode = nodes.find(n => n.id === id);
    // Simple check - in real implementation, check edges
    setIsConnected(!!currentNode);
  }, [id, getNodes]);

  const addMessage = (type: Message['type'], content: string, metadata?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      metadata
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    updateNodeData(id, { ...data, messages: updatedMessages });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    try {
      // Get data from previous nodes in workflow
      const previousData = getGlobalData('workflow_input') || userMessage;

      // Execute this node with global workflow context
      const result = await executeNode(id, 'chat', {
        message: userMessage,
        context: previousData,
        conversationHistory: messages
      });

      // Add assistant response
      if (result && result.response) {
        addMessage('assistant', result.response, {
          processingTime: result.processingTime || '1.0s',
          executionId: workflowState.executionId
        });
      } else {
        // Fallback to simulated response
        const responses = [
          "I understand you want to: " + userMessage,
          "Based on previous workflow data: " + JSON.stringify(previousData),
          "Processing your request in workflow context...",
          "Received: " + userMessage + "\n\nI'm connected to the global workflow state."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage('assistant', randomResponse, { processingTime: '1.2s' });
      }

      // Store chat result in global data for downstream nodes
      setGlobalData(`chat_${id}_result`, {
        lastMessage: userMessage,
        messageCount: messages.length + 2,
        timestamp: new Date().toISOString()
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Chat execution error:', error);
      addMessage('system', 'Error: Could not process message. Check workflow configuration.');
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    updateNodeData(id, { ...data, messages: [] });
  };

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `chat_${Date.now()}`,
        position: {
          x: currentNode.position.x + 60,
          y: currentNode.position.y + 60,
        },
        selected: false,
        data: {
          ...currentNode.data,
          messages: []
        },
      };
      setNodes((prev) => [...prev, newNode]);
    }
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'user': return <FiUser size={14} className="text-blue-600" />;
      case 'assistant': return <TbRobot size={14} className="text-green-600" />;
      case 'system': return <FiSettings size={14} className="text-orange-600" />;
    }
  };

  const getMessageBgColor = (type: Message['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'assistant': return 'bg-green-50 border-green-200';
      case 'system': return 'bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className={`min-w-full relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-3xl shadow hover:shadow-xl transition-all duration-200`}>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiMessageCircle className="text-gray-600" size={18} />
            <span className="text-sm font-semibold text-gray-800">Chat Interface</span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
            )}
            {workflowState.isExecuting && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Workflow Running" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ?
                <FiMinimize2 size={12} className="text-gray-600" /> :
                <FiMaximize2 size={12} className="text-gray-600" />
              }
            </button>
            <button
              onClick={handleClearChat}
              className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-orange-50 transition-colors"
              title="Clear Chat"
            >
              <FiRefreshCw size={12} className="text-orange-600" />
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

        {/* Chat Messages */}
        <div className={`bg-white rounded-lg border border-gray-200 transition-all duration-200 ${
          isExpanded ? 'h-96' : 'h-48'
        }`}>
          <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <FiMessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">
                    {isConnected ? 'Start a conversation below' : 'Connect an input to begin'}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg border ${getMessageBgColor(message.type)} flex gap-2`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                        {message.metadata?.processingTime && (
                          <span className="ml-2">⏱ {message.metadata.processingTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-2 items-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <TbRobot size={14} className="text-blue-600" />
                  <div className="text-sm text-blue-800">Assistant is typing...</div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={isConnected ? "Type your message..." : "Connect an input first"}
                  disabled={!isConnected || isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || !isConnected || isLoading}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiSend size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {messages.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 flex justify-between">
            <span>{messages.length} messages</span>
            <span>
              {messages.filter(m => m.type === 'user').length} user, {messages.filter(m => m.type === 'assistant').length} assistant
            </span>
          </div>
        )}

        {/* Global Workflow Info */}
        {workflowState.executionId && (
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Workflow: {workflowState.executionId.slice(-8)}</span>
              <span>Node: {nodeState.status || 'idle'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-gray-500 border-2 border-white shadow-md"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-gray-500 border-2 border-white shadow-md"
      />
    </div>
  );
}