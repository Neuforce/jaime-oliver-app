'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getConversationMessages, setCurrentConversation } from '../../lib/conversationHistory';
import { ChatMessage } from '../../types/chat';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialSessionId, setInitialSessionId] = useState<string | undefined>();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  
  const {
    messages,
    isLoading,
    error,
    isConnected,
    disconnect,
    sendMessage,
    getRecipes,
    getRecipe,
    taskDone,
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
        // Prime a new session with the starter
        const newSessionId = `${Date.now()}`;
        setInitialSessionId(newSessionId);
        const now = new Date().toISOString();
        // Add user message immediately
        const initial: ChatMessage[] = [
          {
            type: 'message',
            sender: 'user',
            session_id: newSessionId,
            content: starter,
            timestamp: now,
          },
        ];
        setInitialMessages(initial);
      }
    };
    
    loadConversation();
  }, [searchParams]);

  // Call getRecipes when WebSocket is connected and we have a starter
  useEffect(() => {
    const starter = searchParams.get('starter');
    if (starter && isConnected && initialSessionId) {
      // Wait a bit for connection to be fully ready, then request recipes
      const timer = setTimeout(() => {
        console.log('[ChatPage] Requesting recipes from backend...');
        getRecipes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, searchParams, initialSessionId, getRecipes]);
  
  // Note: WebSocket connection is now automatic when useChatSocket hook mounts
  // The connection happens automatically when sessionId is available
  // Cleanup is handled by the hook itself

  const handleBackToHome = () => {
    disconnect();
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="w-full mx-auto md:max-w-[700px] flex flex-col h-full">
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
                getRecipe={getRecipe}
                taskDone={taskDone}
              />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col bg-white items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
