'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getConversationMessages, setCurrentConversation } from '../../lib/conversationHistory';
import { getOrCreateSessionId } from '../../lib/session';
import { ChatMessage } from '../../types/chat';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // CRITICAL: Always ensure we have a session_id from the start
  // This prevents "No active connection" errors by guaranteeing a valid UUID session
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    
    // Check if we have a conversation ID in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    
    if (conversationId) {
      // Use existing conversation ID
      console.log('[ChatPage] Using existing conversation:', conversationId);
      return conversationId;
    }
    
    // Otherwise get or create a session
    const id = getOrCreateSessionId();
    console.log('[ChatPage] Session ID initialized:', id.slice(0, 8) + '...');
    return id;
  });
  
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
    startRecipe,
    taskDone,
  } = useChatSocket({
    initialSessionId: sessionId,
    initialMessages,
    onConnect: () => {
      console.log('[ChatPage] Connected to chat with session:', sessionId.slice(0, 8) + '...');
    },
    onDisconnect: () => {
      console.log('[ChatPage] Disconnected from chat');
    },
    onError: (error) => {
      console.error('[ChatPage] Chat error:', error);
    },
  });

  useEffect(() => {
    const loadConversation = async () => {
      const conversationId = searchParams.get('conversation');
      
      if (conversationId) {
        try {
          const savedMessages = getConversationMessages(conversationId);
          setCurrentConversation(conversationId);
          
          // Load saved messages for existing conversation
          setInitialMessages(savedMessages);
          console.log('[ChatPage] Loaded', savedMessages.length, 'messages for conversation:', conversationId.slice(0, 8) + '...');
        } catch (error) {
          console.error('[ChatPage] Error loading conversation:', error);
        }
      } else {
        console.log('[ChatPage] Starting fresh chat with session:', sessionId.slice(0, 8) + '...');
      }
    };
    
    loadConversation();
  }, [searchParams, sessionId]);

  // Request recipes when WebSocket is connected (for starter questions or manual input)
  useEffect(() => {
    const starter = searchParams.get('starter');
    if (starter && isConnected && sessionId) {
      // Wait a bit for connection to be fully ready, then request recipes
      const timer = setTimeout(() => {
        console.log('[ChatPage] Requesting recipes from backend for:', starter);
        getRecipes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, searchParams, sessionId, getRecipes]);
  
  // Note: WebSocket connection is now automatic when useChatSocket hook mounts
  // The connection happens automatically when sessionId is available
  // Cleanup is handled by the hook itself

  const handleBackToHome = () => {
    disconnect();
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="w-full mx-auto md:max-w-[700px] flex flex-col flex-1">
        {/* Top bar */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-center relative flex-shrink-0">
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
      <div className="flex-1 min-h-0">
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          getRecipe={getRecipe}
          startRecipe={startRecipe}
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
