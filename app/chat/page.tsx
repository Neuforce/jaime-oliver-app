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
            content: "Ah, mate! Absolutely, I've got you covered.\n\nHere's a small collection of **easy, delicious,** and **healthy recipes** that are flavorful but won't overwhelm you in the kitchen:",
            timestamp: new Date(Date.now() + 1000).toISOString(),
            recipes: [
              {
                title: 'Jacket potato',
                duration: '1 hr',
                imageUrl: '/images/jacket-potato.png',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                introText: "I'll guide you step by step as if we're cooking it together.\n**Make sure you gather all your ingredients** — keep them visible and ready to go.\n**Lay out your utensils** — pot, pan, tongs, zester, grater, and ladle.\n**Check off each ingredient** as you place it on your counter.\nAnd don't forget to check off each ingredient as you place it on your counter. That way, we're set to cook smoothly and enjoy every step!",
                steps: [
                  {
                    title: 'Cook the pasta',
                    duration: '20:00 min',
                    icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
                  },
                  {
                    title: 'Sauté aromatics',
                    duration: '4:00 min',
                    icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                  },
                  {
                    title: 'Make the sauce',
                    duration: '10:00 min',
                    icon: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
                  },
                  {
                    title: 'Add the chickpeas',
                    duration: '5:00 min',
                    icon: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                  },
                  {
                    title: 'Combine with pasta',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                  {
                    title: 'Finish and serve',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                ],
              },
              {
                title: 'Chickpea arrabbiata',
                duration: '15 min',
                imageUrl: '/images/arrabbiata.png',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                introText: "I'll guide you step by step as if we're cooking it together.\n**Make sure you gather all your ingredients** — keep them visible and ready to go.\n**Lay out your utensils** — pot, pan, tongs, zester, grater, and ladle.\n**Check off each ingredient** as you place it on your counter.\nNext, lay out your utensils — pot, pan, tongs, zester, grater, and ladle.\nAnd don't forget to check off each ingredient as you place it on your counter. That way, we're set to cook smoothly and enjoy every step!",
                steps: [
                  {
                    title: 'Cook the pasta',
                    duration: '20:00 min',
                    icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
                  },
                  {
                    title: 'Sauté aromatics',
                    duration: '4:00 min',
                    icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                  },
                  {
                    title: 'Make the sauce',
                    duration: '10:00 min',
                    icon: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
                  },
                  {
                    title: 'Add the chickpeas',
                    duration: '5:00 min',
                    icon: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                  },
                  {
                    title: 'Combine with pasta',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                  {
                    title: 'Finish and serve',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                ],
              },
              {
                title: 'Happy fish pie',
                duration: '1 hr 10 min',
                imageUrl: '/images/fish-pie.png',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                introText: "I'll guide you step by step as if we're cooking it together.\n**Make sure you gather all your ingredients** — keep them visible and ready to go.\n**Lay out your utensils** — pot, pan, tongs, zester, grater, and ladle.\n**Check off each ingredient** as you place it on your counter.\nAnd don't forget to check off each ingredient as you place it on your counter. That way, we're set to cook smoothly and enjoy every step!",
                steps: [
                  {
                    title: 'Cook the pasta',
                    duration: '20:00 min',
                    icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
                  },
                  {
                    title: 'Sauté aromatics',
                    duration: '4:00 min',
                    icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                  },
                  {
                    title: 'Make the sauce',
                    duration: '10:00 min',
                    icon: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
                  },
                  {
                    title: 'Add the chickpeas',
                    duration: '5:00 min',
                    icon: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                  },
                  {
                    title: 'Combine with pasta',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                  {
                    title: 'Finish and serve',
                    duration: '2:00 min',
                    icon: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
                  },
                ],
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
