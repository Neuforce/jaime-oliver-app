import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { VoiceInstructions } from './VoiceInstructions';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  getRecipe?: (workflowId: string) => void;
  taskDone?: (taskId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  getRecipe,
  taskDone,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);
  const [hasExpandedRecipe, setHasExpandedRecipe] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show voice instructions when chat starts
    if (messages.length === 0) {
      setShowVoiceInstructions(true);
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <VoiceInstructions 
        isVisible={showVoiceInstructions}
        onClose={() => setShowVoiceInstructions(false)}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-gray-500">Start a conversation</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={`${message.timestamp}-${index}`} 
              message={message}
              hasExpandedRecipe={hasExpandedRecipe}
              onRecipeExpandedChange={setHasExpandedRecipe}
              getRecipe={getRecipe}
              taskDone={taskDone}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? 'Waiting...' : 'Ask me anything about cooking...'}
        enableVoiceInput={true}
      />
    </div>
  );
};
