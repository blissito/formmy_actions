/**
 * Chat Popup Component - Flowise Style
 * Floating chat interface following Flowise patterns exactly
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FiMessageCircle,
  FiX,
  FiTrash2,
  FiMaximize2,
  FiSend,
  FiBot,
  FiUser,
  FiLoader,
  FiSettings
} from 'react-icons/fi';
import { useWorkflowExecution } from '../runtime/WorkflowExecutionContext';
import { useTranslation } from '../i18n';
import { SimpleChatAgent } from '../runtime/agents/SimpleChatAgent';
import { useGlobalConfig } from './GlobalSettings';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface ChatPopupProps {
  workflowId?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function ChatPopup({ workflowId, onOpenChange }: ChatPopupProps) {
  const { t } = useTranslation();
  const { config: globalConfig } = useGlobalConfig();
  const {
    workflowState,
    getFlowState,
    executeNode,
    getGlobalData
  } = useWorkflowExecution();

  // Create chat agent instance
  const [chatAgent, setChatAgent] = useState<SimpleChatAgent | null>(null);

  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '🤖 Chat conectado al workflow. Puedes probar aquí tu flujo de trabajo.',
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
        systemMessage: `You are an AI assistant integrated with formmy-actions, a visual workflow builder. You're currently connected to a live workflow and can see its state. Help the user test and interact with their workflow.

Current workflow status: ${workflowState.isExecuting ? 'Running' : 'Ready'}
Execution ID: ${workflowState.executionId || 'None'}

Be helpful, conversational, and reference the workflow state when relevant.`
      });

      setChatAgent(agent);

      // Update messages with agent ready status
      setMessages([
        {
          id: '1',
          type: 'system',
          content: '🤖 Agente IA conectado al workflow. Puedes hacerme preguntas sobre tu flujo de trabajo o probarlo aquí.',
          timestamp: new Date()
        }
      ]);
    }
  }, [globalConfig.openaiApiKey, chatAgent, workflowState]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isExpanded]);

  const toggleChat = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    if (onOpenChange) onOpenChange(newOpenState);
  };

  const expandChat = () => {
    setIsExpanded(true);
  };

  const clearChat = () => {
    // Clear chat agent history
    if (chatAgent) {
      chatAgent.clearHistory();
    }

    setMessages([
      {
        id: Date.now().toString(),
        type: 'system',
        content: '🧹 Chat limpiado. Conversación reiniciada.',
        timestamp: new Date()
      }
    ]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatAgent) return;

    // Check if API key is configured
    if (!globalConfig.openaiApiKey) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: '⚠️ Configura tu OpenAI API Key en Configuración Global antes de usar el chat.',
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

    // Add loading message
    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      type: 'bot',
      content: 'Procesando...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Update agent with current workflow context
      const flowState = getFlowState();
      const globalData = getGlobalData('startConfig');

      chatAgent.setWorkflowContext(flowState, globalData);

      // Get response from real AI agent
      const response = await chatAgent.chat(userMessage.content);

      const botResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: response.timestamp
      };

      // Remove loading message and add response
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(botResponse));

      console.log('💬 Chat response:', {
        model: response.model,
        usage: response.usage,
        timestamp: response.timestamp
      });

    } catch (error: any) {
      console.error('Chat error:', error);

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
      case 'user': return <FiUser size={16} className="text-blue-600" />;
      case 'bot': return <FiBot size={16} className="text-green-600" />;
      case 'system': return <FiSettings size={16} className="text-gray-500" />;
      default: return null;
    }
  };

  const getMessageBg = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'bot': return 'bg-green-50 border-green-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-white border-gray-200';
    }
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <FiMessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Chat Expandido</h3>
                <p className="text-sm text-gray-500">Prueba tu workflow aquí</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Limpiar chat"
              >
                <FiTrash2 size={18} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getMessageBg(message.type)}`}>
                {getMessageIcon(message.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {message.type === 'user' ? 'Tú' : message.type === 'bot' ? 'Bot' : 'Sistema'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {message.loading ? (
                      <div className="flex items-center gap-2">
                        <FiLoader className="animate-spin" size={14} />
                        {message.content}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FiSend size={16} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Action Buttons - Flowise Style */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-3">
        {isOpen && (
          <>
            {/* Expand Button */}
            <button
              onClick={expandChat}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Expandir chat"
            >
              <FiMaximize2 size={16} />
            </button>

            {/* Clear Button */}
            <button
              onClick={clearChat}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Limpiar chat"
            >
              <FiTrash2 size={16} />
            </button>
          </>
        )}

        {/* Main Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
          title={isOpen ? "Cerrar chat" : "Abrir chat"}
        >
          {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}

          {/* Notification dot */}
          {!isOpen && messages.length > 1 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {Math.min(messages.length - 1, 9)}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Chat Popup - Flowise Style */}
      {isOpen && (
        <div className="fixed top-20 right-5 z-30 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <FiBot size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Workflow Chat</h3>
                <p className="text-xs text-gray-500">
                  {workflowState.executionId ? `Sesión: ${workflowState.executionId.slice(-8)}` : 'Listo para probar'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg text-sm border ${getMessageBg(message.type)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getMessageIcon(message.type)}
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {message.type === 'user' ? 'Tú' : message.type === 'bot' ? 'Bot' : 'Sistema'}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="text-gray-800 whitespace-pre-wrap">
                  {message.loading ? (
                    <div className="flex items-center gap-2">
                      <FiLoader className="animate-spin" size={14} />
                      {message.content}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe aquí..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <FiSend size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}