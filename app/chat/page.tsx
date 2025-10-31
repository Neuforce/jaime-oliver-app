'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getConversationMessages, setCurrentConversation } from '../../lib/conversationHistory';
import { ChatMessage } from '../../types/chat';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialSessionId, setInitialSessionId] = useState<string | undefined>();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  
  const {
    messages,
    isLoading,
    error,
    sessionId,
    connect,
    disconnect,
    sendMessage,
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
      const starter = searchParams.get('starter');
      
      if (conversationId) {
        try {
          const savedMessages = getConversationMessages(conversationId);
          setCurrentConversation(conversationId);
          
          // Set initial data for the hook
          setInitialSessionId(conversationId);
          setInitialMessages(savedMessages);
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      } else if (starter) {
        // Prime a new session with the starter and a mocked recipe list response
        const newSessionId = `${Date.now()}`;
        setInitialSessionId(newSessionId);
        const now = new Date().toISOString();
        const initial: ChatMessage[] = [
          {
            type: 'message',
            sender: 'user',
            session_id: newSessionId,
            content: starter,
            timestamp: now,
          },
          {
            type: 'recipeList',
            sender: 'agent',
            session_id: newSessionId,
            content: "Here's a small collection of easy, delicious, and healthy recipes that are flavorful but won't overwhelm you in the kitchen:",
            timestamp: new Date(Date.now() + 1000).toISOString(),
            recipes: [
              {
                title: 'Jacket potato',
                duration: '1 hr',
                imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
              },
              {
                title: 'Chickpea arrabbiata',
                duration: '15 min',
                imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=801',
              },
              {
                title: 'Happy fish pie',
                duration: '1 hr 10 min',
                imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=802',
              },
            ],
          },
        ];
        setInitialMessages(initial);
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-center relative">
        <button
          onClick={handleBackToHome}
          aria-label="Back"
          className="absolute left-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>
        <Image src="/jamie-heart.png" alt="Jamie Oliver" width={150} height={20} />
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
        />
      </div>
    </div>
  );
}
