/**
 * Flowise Chat Interface Component
 * Adaptado del componente Bot.tsx de Flowise para React
 * Muestra la interface de chat exactamente como en Flowise
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiMessageCircle, FiTrash2, FiCpu } from 'react-icons/fi';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface FlowiseChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'user' | 'assistant' | 'system') => void;
  onUpdateMessage: (index: number, field: keyof ChatMessage, value: string) => void;
  onRemoveMessage: (index: number) => void;
  onAddMessage: () => void;
  isLoading?: boolean;
  className?: string;
}

export function FlowiseChat({
  messages,
  onSendMessage,
  onUpdateMessage,
  onRemoveMessage,
  onAddMessage,
  isLoading = false,
  className = ''
}: FlowiseChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState<'user' | 'assistant' | 'system'>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), selectedMessageType);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <FiUser className="w-4 h-4 text-blue-600" />;
      case 'assistant':
        return <FiCpu className="w-4 h-4 text-green-600" />;
      case 'system':
        return <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">S</div>;
      default:
        return <FiUser className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'assistant':
        return 'bg-green-50 border-green-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-100';
      case 'assistant':
        return 'text-green-600 bg-green-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <FiCpu className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-800">Chat Messages</span>
          <span className="text-xs text-gray-500">({messages.length})</span>
        </div>
        <button
          onClick={onAddMessage}
          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
        >
          + Add Message
        </button>
      </div>

      {/* Messages Container - Flowise Style */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
        style={{ maxHeight: '300px' }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No messages yet. Add your first message above.
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id || index} className={`border rounded-lg p-3 ${getMessageStyle(message.type)}`}>
              {/* Message Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMessageIcon(message.type)}
                  <select
                    value={message.type}
                    onChange={(e) => onUpdateMessage(index, 'type', e.target.value)}
                    className={`text-xs px-2 py-1 rounded border-0 focus:ring-1 focus:ring-green-500 ${getMessageTypeColor(message.type)}`}
                  >
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <button
                  onClick={() => onRemoveMessage(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove message"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message Content */}
              <textarea
                value={message.content}
                onChange={(e) => onUpdateMessage(index, 'content', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                rows={2}
                placeholder={`${message.type} message...`}
              />

              {/* Timestamp */}
              {message.timestamp && (
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Flowise Style */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={selectedMessageType}
            onChange={(e) => setSelectedMessageType(e.target.value as 'user' | 'assistant' | 'system')}
            className={`text-xs px-2 py-1 rounded border focus:ring-1 focus:ring-green-500 ${getMessageTypeColor(selectedMessageType)}`}
          >
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
            <option value="system">System</option>
          </select>
          <span className="text-xs text-gray-500">message type</span>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-sm border border-gray-300 rounded-lg p-2 resize-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              rows={2}
              placeholder={`Type a ${selectedMessageType} message...`}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}