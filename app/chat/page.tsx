'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Button } from '../../components/ui/Button';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getConversationMessages, setCurrentConversation } from '../../lib/conversationHistory';
import { ChatMessage } from '../../types/chat';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [initialSessionId, setInitialSessionId] = useState<string | undefined>();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  
  const {
    messages,
    isConnected,
    isLoading,
    error,
    sessionId,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useChatSocket({
    initialSessionId,
    initialMessages,
    onConnect: () => {
      console.log('Connected to chat');
    },
    onDisconnect: () => {
      console.log('Disconnected from chat');
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  useEffect(() => {
    const loadConversation = async () => {
      const conversationId = searchParams.get('conversation');
      
      if (conversationId) {
        setIsLoadingHistory(true);
        try {
          const savedMessages = getConversationMessages(conversationId);
          setCurrentConversation(conversationId);
          
          // Set initial data for the hook
          setInitialSessionId(conversationId);
          setInitialMessages(savedMessages);
        } catch (error) {
          console.error('Error loading conversation:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };
    
    loadConversation();
  }, [searchParams]);
  
  useEffect(() => {
    if (initialSessionId || !searchParams.get('conversation')) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, initialSessionId, searchParams]);

  const handleBackToHome = () => {
    disconnect();
    router.push('/');
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            ←
          </Button>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleClearChat}
          disabled={messages.length === 0}
          className="text-gray-600 hover:text-gray-900"
        >
          Clear
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}
