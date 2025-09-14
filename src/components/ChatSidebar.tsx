/**
 * Chat Sidebar Component - Flowise Style
 * Fixed right sidebar for testing workflows
 * Based on Flowise's integrated chat panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiLoader,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiX
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useWorkflowExecution } from '../runtime/WorkflowExecutionContext';
import { useGlobalConfig } from './GlobalSettings';
import { FlowiseSimpleExecutor } from '../runtime/FlowiseSimpleExecutor';
import { useReactFlow } from '@xyflow/react';

interface AgentReasoning {
  agentName?: string;
  messages?: string[];
  usedTools?: any[];
  sourceDocuments?: any[];
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
  agentReasoning?: AgentReasoning[];
  usedTools?: any[];
  sourceDocuments?: any[];
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  // Debug: Verificar props

  const { config: globalConfig } = useGlobalConfig();
  const { getNodes, getEdges, updateNodeData } = useReactFlow();
  const {
    workflowState,
    getFlowState,
    getGlobalData
  } = useWorkflowExecution();

  // Chat state - Solo FlowiseSimpleExecutor
  const [flowiseExecutor] = useState(new FlowiseSimpleExecutor());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '🤖 Chat de prueba del workflow. Configura tu OpenAI API Key para comenzar.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chat inicializado - solo usa FlowiseSimpleExecutor con nodos del workflow

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const clearChat = () => {
    if (chatAgent) {
      chatAgent.clearHistory();
    }

    setMessages([
      {
        id: Date.now().toString(),
        type: 'system',
        content: '🧹 Chat limpiado.',
        timestamp: new Date()
      }
    ]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!globalConfig.openaiApiKey) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: '⚠️ Configura tu OpenAI API Key en Configuración Global.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      type: 'bot',
      content: 'Generando...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Get current workflow nodes and edges
      const nodes = getNodes();
      const edges = getEdges();

      // Track reasoning updates
      let currentMessage = loadingMessage;


      // Execute workflow with trace callbacks (Flowise pattern)
      const result = await flowiseExecutor.executeChat(
        nodes,
        edges,
        userMessage.content,
        (nodeId: string, status: string, result?: any) => {

          // CRÍTICO: Actualizar estado visual del nodo en React Flow
          updateNodeData(nodeId, {
            executionStatus: status,
            isProcessing: result?.isThinking,
            isStreaming: result?.isStreaming,
            response: result?.response
          });

          // Update message with trace info in real-time SOLO si hay reasoning
          if (result?.agentReasoning && result.agentReasoning.length > 0) {
            currentMessage = {
              ...currentMessage,
              agentReasoning: result.agentReasoning,
              loading: true
            };

            setMessages(prev => prev.map(m =>
              m.id === loadingMessage.id ? currentMessage : m
            ));
          } else if (result && result.agentReasoning === undefined) {
            // CRÍTICO: Limpiar reasoning cuando se completa la ejecución
            currentMessage = {
              ...currentMessage,
              agentReasoning: undefined,
              loading: false
            };
            setMessages(prev => prev.map(m =>
              m.id === loadingMessage.id ? currentMessage : m
            ));
          }
        }
      );


      // CRÍTICO: Asegurar que se quite el loading message con reasoning
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));

      const botResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: result.success ? result.message : `❌ ${result.message}`,
        timestamp: new Date()
        // No agentReasoning - limpio al terminar
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error: any) {
      // CRÍTICO: Limpiar loading message en error también
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));

      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Error: ${error.message || 'No se pudo conectar con OpenAI'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Component for Agent Reasoning Trace - minimal badge
  const AgentReasoningBubble = ({ reasoning }: { reasoning: AgentReasoning }) => (
    <div className="mt-1">
      {reasoning.messages?.map((message, idx) => (
        <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs mr-1 mb-1">
          {message}
        </span>
      ))}
    </div>
  );

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <FiUser size={14} className="text-blue-600" />;
      case 'bot': return <RiRobot2Line size={14} className="text-green-600" />;
      case 'system': return <FiSettings size={14} className="text-gray-500" />;
      default: return null;
    }
  };

  return createPortal(
    <>
      {/* Chat Toggle Button - Always visible in bottom right */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-100 z-[9999]"
        style={{
          right: isOpen ? '400px' : '24px', // 400px = 384px chat width + 16px spacing
          bottom: '24px',
          zIndex: 9999
        }}
        title={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}
      </button>

      {/* Chat Sidebar Panel - Slides from right */}
      <div
        className={`fixed right-0 w-96 bg-white border-l border-gray-300 shadow-xl z-[9998] flex flex-col ${
          isOpen ? 'block' : 'hidden'
        }`}
        style={{
          backgroundColor: 'white',
          position: 'fixed',
          top: '80px',
          right: '0px',
          width: '384px', // w-96
          height: 'calc(100vh - 80px)',
          zIndex: 9998,
          display: isOpen ? 'flex' : 'none'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white">
                <FiMessageCircle size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Chat de Prueba</h3>
                <p className="text-xs text-gray-500">
                  {workflowState.isExecuting ? 'Ejecutándose...' : 'Listo'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Limpiar chat"
              >
                <FiTrash2 size={16} />
              </button>
              <button
                onClick={onToggle}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Cerrar chat"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col space-y-2">
              <div
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'bot'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  {/* Agent Reasoning Trace - Show BEFORE content */}
                  {message.agentReasoning?.map((reasoning, idx) => (
                    <AgentReasoningBubble key={idx} reasoning={reasoning} />
                  ))}

                  <div className="text-xs whitespace-pre-wrap">
                    {message.loading ? (
                      <div className="flex items-center gap-2">
                        <FiLoader className="animate-spin" size={12} />
                        <span className="text-xs">{message.content}</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                  {/* Badge con hora del mensaje */}
                  <div className="flex justify-end mt-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        message.type === 'user'
                          ? 'bg-blue-400/30 text-blue-100'
                          : message.type === 'bot'
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={globalConfig.openaiApiKey ? "Prueba tu workflow..." : "Configura API Key"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !globalConfig.openaiApiKey}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !globalConfig.openaiApiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}