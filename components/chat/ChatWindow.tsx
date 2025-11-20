import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { VoiceInstructions } from './VoiceInstructions';
import { ENABLE_VOICE_INPUT } from '../../config/features';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  getRecipe?: (workflowId: string) => void;
  startRecipe?: (workflowId: string) => void;
  taskDone?: (taskId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  getRecipe,
  startRecipe,
  taskDone,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);
  const [hasExpandedRecipe, setHasExpandedRecipe] = useState(false);

  // Filter contextual messages (only scheduled_task from system)
  const contextualMessages = messages.filter(msg => 
    msg.sender === 'system' && 
    msg.type === 'message' &&
    msg.content.startsWith('⏰')
  );

  console.log('[ChatWindow] Total messages:', messages.length);
  console.log('[ChatWindow] Messages array:', messages.map(m => ({
    sender: m.sender,
    type: m.type,
    content: m.content.substring(0, 30)
  })));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show voice instructions when chat starts (only if voice is enabled)
    if (ENABLE_VOICE_INPUT && messages.length === 0) {
      setShowVoiceInstructions(true);
    }
  }, [messages.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {ENABLE_VOICE_INPUT && (
        <VoiceInstructions 
          isVisible={showVoiceInstructions}
          onClose={() => setShowVoiceInstructions(false)}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-scroll p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
        {messages.length === 0 ? (
          <div className="flex-1"></div>
        ) : (
          messages.map((message, index) => {
            // Show separator after recipe list to separate it from conversation
            const isRecipeList = message.type === 'recipeList';
            const nextMessage = messages[index + 1];
            const showSeparator = isRecipeList && nextMessage;

            return (
              <React.Fragment key={`${message.timestamp}-${index}`}>
                <MessageBubble 
                  message={message}
                  hasExpandedRecipe={hasExpandedRecipe}
                  onRecipeExpandedChange={setHasExpandedRecipe}
                  getRecipe={getRecipe}
                  startRecipe={startRecipe}
                  taskDone={taskDone}
                  contextualMessages={contextualMessages}
                />
                {/* Separator between recipe section and conversation */}
                {showSeparator && (
                  <div className="my-6 border-t border-gray-200"></div>
                )}
              </React.Fragment>
            );
          })
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
        placeholder={isLoading ? 'Waiting...' : 'Type a message...'}
        enableVoiceInput={ENABLE_VOICE_INPUT}
      />
    </div>
  );
};
