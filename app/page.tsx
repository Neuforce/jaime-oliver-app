'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { ConversationList } from '../components/conversation/ConversationList';
import { getConversationHistory, deleteConversation } from '../lib/conversationHistory';
import { createNewSession } from '../lib/session';
import { Conversation } from '../types/conversation';

export default function HomePage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const history = getConversationHistory();
    setConversations(history.conversations);
  }, []);

  const handleStartChat = async () => {
    setIsConnecting(true);
    // Create a new session for the new chat
    createNewSession();
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/chat');
  };

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat?conversation=${conversationId}`);
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
    const history = getConversationHistory();
    setConversations(history.conversations);
  };

  const handleNewConversation = () => {
    handleStartChat();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jamie Oliver App
          </h1>
          <p className="text-gray-600">
            Start a conversation or continue an existing one
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showHistory
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New Chat
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showHistory
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {!showHistory ? (
          <div className="text-center">
            <Button
              onClick={handleStartChat}
              disabled={isConnecting}
              size="lg"
              className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Connecting...' : 'Start New Chat'}
            </Button>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onNewConversation={handleNewConversation}
          />
        )}
      </div>
    </div>
  );
}
