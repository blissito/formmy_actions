import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiTrash2, FiRefreshCw } from 'react-icons/fi';

// Types for chat history
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    executionStatus?: string;
    workflowData?: any[];
    tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryProps {
  className?: string;
  onMessageSelect?: (message: ChatMessage) => void;
  onSessionSelect?: (session: ChatSession) => void;
  maxMessages?: number;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  className = '',
  onMessageSelect,
  onSessionSelect,
  maxMessages = 50
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    try {
      const savedHistory = localStorage.getItem('ai-flow-chat-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setSessions(parsedHistory.sessions || []);
        setCurrentSessionId(parsedHistory.currentSessionId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = (updatedSessions: ChatSession[], sessionId: string | null) => {
    try {
      const historyData = {
        sessions: updatedSessions,
        currentSessionId: sessionId,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('ai-flow-chat-history', JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Add a new message to the current session
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    let updatedSessions = [...sessions];

    // Create new session if none exists or if current session is full
    if (!currentSessionId || !updatedSessions.find(s => s.id === currentSessionId)) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        messages: [newMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedSessions.unshift(newSession);
      setCurrentSessionId(newSession.id);
    } else {
      // Add to existing session
      updatedSessions = updatedSessions.map(session => {
        if (session.id === currentSessionId) {
          const updatedMessages = [...session.messages, newMessage];
          // Keep only last N messages per session
          if (updatedMessages.length > maxMessages) {
            updatedMessages.splice(0, updatedMessages.length - maxMessages);
          }
          return {
            ...session,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      });
    }

    setSessions(updatedSessions);
    saveChatHistory(updatedSessions, currentSessionId);
    return newMessage;
  };

  // Start a new session
  const startNewSession = () => {
    setCurrentSessionId(null);
  };

  // Clear all history
  const clearHistory = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem('ai-flow-chat-history');
  };

  // Get current session
  const getCurrentSession = (): ChatSession | null => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FiMessageSquare size={16} className="text-blue-600" />
          <h3 className="text-sm font-medium text-gray-800">Chat History</h3>
          <span className="text-xs text-gray-500">
            ({sessions.reduce((total, session) => total + session.messages.length, 0)})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startNewSession();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="New session"
          >
            <FiRefreshCw size={14} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearHistory();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Clear history"
          >
            <FiTrash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No chat history yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-2 rounded border cursor-pointer hover:bg-gray-50 ${
                    session.id === currentSessionId ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    onSessionSelect?.(session);
                  }}
                >
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{session.messages.length} messages</span>
                    <span>{formatTime(session.updatedAt)}</span>
                  </div>

                  {/* Show last few messages */}
                  <div className="mt-1 space-y-1">
                    {session.messages.slice(-2).map((message) => (
                      <div
                        key={message.id}
                        className="text-xs text-gray-600 truncate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageSelect?.(message);
                        }}
                      >
                        <span className={`font-medium ${
                          message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {message.role === 'user' ? 'You: ' : 'AI: '}
                        </span>
                        {message.content.substring(0, 80)}
                        {message.content.length > 80 && '...'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook to use chat history
export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('ai-flow-chat-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory.sessions || []);
        setCurrentSessionId(parsedHistory.currentSessionId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    let updatedSessions = [...chatHistory];

    if (!currentSessionId || !updatedSessions.find(s => s.id === currentSessionId)) {
      // Create new session
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        messages: [newMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedSessions.unshift(newSession);
      setCurrentSessionId(newSession.id);
    } else {
      // Add to existing session
      updatedSessions = updatedSessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, newMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      });
    }

    setChatHistory(updatedSessions);

    // Save to localStorage
    const historyData = {
      sessions: updatedSessions,
      currentSessionId: currentSessionId,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('ai-flow-chat-history', JSON.stringify(historyData));

    return newMessage;
  };

  const getCurrentSession = (): ChatSession | null => {
    return chatHistory.find(s => s.id === currentSessionId) || null;
  };

  const getConversationContext = (maxMessages: number = 10): ChatMessage[] => {
    const currentSession = getCurrentSession();
    if (!currentSession) return [];

    return currentSession.messages.slice(-maxMessages);
  };

  return {
    chatHistory,
    currentSessionId,
    addMessage,
    getCurrentSession,
    getConversationContext,
    startNewSession: () => setCurrentSessionId(null)
  };
};

export default ChatHistory;