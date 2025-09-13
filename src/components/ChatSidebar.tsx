/**
 * Chat Sidebar Component - Flowise Style
 * Fixed right sidebar for testing workflows
 * Based on Flowise's integrated chat panel
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiLoader,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSettings
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useWorkflowExecution } from '../runtime/WorkflowExecutionContext';
import { SimpleChatAgent } from '../runtime/agents/SimpleChatAgent';
import { useGlobalConfig } from './GlobalSettings';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { config: globalConfig } = useGlobalConfig();
  const {
    workflowState,
    getFlowState,
    getGlobalData
  } = useWorkflowExecution();

  // Chat state
  const [chatAgent, setChatAgent] = useState<SimpleChatAgent | null>(null);
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

  // Initialize chat agent when OpenAI API key is available
  useEffect(() => {
    if (globalConfig.openaiApiKey && !chatAgent) {
      const agent = new SimpleChatAgent({
        apiKey: globalConfig.openaiApiKey,
        model: 'gpt-3.5-turbo',
        maxTokens: globalConfig.defaultMaxTokens === 'unlimited' ? 1500 : globalConfig.defaultMaxTokens,
        temperature: globalConfig.defaultTemperature,
        systemMessage: `You are an AI assistant integrated with formmy-actions workflow builder. Help users test and interact with their workflows.`
      });

      setChatAgent(agent);

      setMessages([
        {
          id: '1',
          type: 'system',
          content: '✅ Agente IA conectado. Puedo ayudarte a probar tu workflow.',
          timestamp: new Date()
        }
      ]);
    }
  }, [globalConfig.openaiApiKey, chatAgent]);

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
    if (!inputValue.trim() || isLoading || !chatAgent) return;

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
      content: 'Pensando...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Update agent with current workflow context
      const flowState = getFlowState();
      const globalData = getGlobalData('startConfig');
      chatAgent.setWorkflowContext(flowState, globalData);

      // Get response from AI agent
      const response = await chatAgent.chat(userMessage.content);

      const botResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: response.timestamp
      };

      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(botResponse));

    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Error: ${error.message || 'No se pudo conectar con OpenAI'}`,
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMessage));
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

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <FiUser size={14} className="text-blue-600" />;
      case 'bot': return <RiRobot2Line size={14} className="text-green-600" />;
      case 'system': return <FiSettings size={14} className="text-gray-500" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-300 rounded-l-lg p-3 shadow-lg hover:bg-gray-50 transition-all"
        style={{ right: isOpen ? '384px' : '0' }}
        title={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
      </button>

      {/* Chat Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-300 shadow-xl transition-transform duration-300 z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white">
                <FiMessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Chat de Prueba</h3>
                <p className="text-xs text-gray-500">
                  {workflowState.isExecuting ? 'Workflow ejecutándose...' : 'Listo para probar'}
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Limpiar chat"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
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
                <div className="flex items-start gap-2">
                  {message.type !== 'user' && (
                    <div className="mt-0.5">
                      {getMessageIcon(message.type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm whitespace-pre-wrap">
                      {message.loading ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="animate-spin" size={14} />
                          {message.content}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatAgent ? "Escribe tu mensaje..." : "Configura API Key primero..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !chatAgent}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !chatAgent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend size={16} />
            </button>
          </div>

          {/* Status Bar */}
          {workflowState.executionId && (
            <div className="mt-2 text-xs text-gray-500">
              Sesión: {workflowState.executionId.slice(-8)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}