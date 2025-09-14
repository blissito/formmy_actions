import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiEye } from 'react-icons/fi';
import { ExecutionTracer } from './ExecutionTracer';
import type { FlowExecution } from '../runtime/ExecutionEngine';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBubbleProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onSendMessage?: (message: string) => Promise<{ message: string; execution?: FlowExecution }>;
  title?: string;
  welcomeMessage?: string;
  placeholder?: string;
  backgroundColor?: string;
  buttonColor?: string;
  position?: {
    bottom?: number;
    right?: number;
  };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen = false,
  onToggle,
  onSendMessage,
  title = "AI Assistant",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Type your message...",
  backgroundColor = "#ffffff",
  buttonColor = "#3B81F6",
  position = { bottom: 20, right: 20 },
}) => {
  const [isChatOpen, setIsChatOpen] = useState(isOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastExecution, setLastExecution] = useState<FlowExecution | undefined>(undefined);
  const [isTracerOpen, setIsTracerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [welcomeMessage, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    onToggle?.();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('🟡 CHATBUBBLE handleSendMessage called');
      console.log('🟡 onSendMessage exists:', !!onSendMessage);
      console.log('🟡 inputText:', inputText);

      let botResponse = "Thanks for your message! This is a demo response.";
      let execution: FlowExecution | undefined;

      if (onSendMessage) {
        console.log('🟢 CALLING onSendMessage...');
        const result = await onSendMessage(inputText);
        console.log('🟢 onSendMessage result:', result);
        if (typeof result === 'string') {
          botResponse = result;
        } else {
          botResponse = result.message;
          execution = result.execution;
          setLastExecution(execution);
        }
      } else {
        console.log('🔴 NO onSendMessage provided - using demo response');
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = 56;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed shadow-lg rounded-full hover:scale-110 active:scale-95 transition-all duration-200 flex justify-center items-center z-[9999]"
        style={{
          backgroundColor: buttonColor,
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
        }}
        title={isChatOpen ? "Close Chat" : "Open Chat"}
      >
        {isChatOpen ? (
          <FiX size={24} color="white" />
        ) : (
          <FiMessageCircle size={24} color="white" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed shadow-2xl rounded-xl overflow-hidden transition-all duration-300 z-[9998] ${
          isChatOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          backgroundColor,
          bottom: `${(position.bottom || 20) + buttonSize + 10}px`,
          right: `${position.right}px`,
          width: '380px',
          height: '500px',
          transformOrigin: 'bottom right',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white font-medium"
          style={{ backgroundColor: buttonColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FiMessageCircle size={16} />
            </div>
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {lastExecution && (
              <button
                onClick={() => setIsTracerOpen(!isTracerOpen)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                title="View Execution Trace"
              >
                <FiEye size={20} />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 120px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: buttonColor }}
            >
              <FiSend size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Execution Tracer */}
      <ExecutionTracer
        execution={lastExecution}
        isVisible={isTracerOpen}
        onToggle={() => setIsTracerOpen(false)}
      />
    </>
  );
};