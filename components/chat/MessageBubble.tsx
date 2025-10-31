import React, { useState } from 'react';
import Image from 'next/image';
import { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { RecipeAccordion } from './RecipeAccordion';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Simple function to convert markdown bold to HTML
const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(false);
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isRecipeList = message.type === 'recipeList';

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-start' : (isRecipeList ? 'justify-center' : 'justify-start')
      )}
    >
      <div className={cn('w-full', isRecipeList ? '' : '')}>
        {isUser ? (
          // User message: gray bubble, wide - hide when recipe is expanded
          !isRecipeExpanded && (
            <div className="max-w-[85%] rounded-2xl bg-gray-200 text-gray-900">
              <div className="text-sm whitespace-pre-wrap break-words px-4 py-3">
                {message.content}
              </div>
            </div>
          )
        ) : isRecipeList ? (
          // Recipe list: show content and recipes
          <>
            {!isRecipeExpanded && (
              <div className="text-sm whitespace-pre-wrap break-words text-gray-900 mb-3">
                {renderMarkdown(message.content)}
              </div>
            )}
            {message.recipes && (
              <RecipeAccordion
                recipes={message.recipes}
                onExpandChange={setIsRecipeExpanded}
              />
            )}
          </>
        ) : (
          // Agent message: plain text, no bubble
          <div className="w-full">
            <div className="text-sm whitespace-pre-wrap break-words text-gray-900">
              {renderMarkdown(message.content)}
            </div>
            
            {message.type === 'video' && message.videoUrl && (
              <div className="mt-3">
                <VideoPlayer
                  videoUrl={message.videoUrl}
                  title={message.videoTitle}
                  thumbnail={message.videoThumbnail}
                />
              </div>
            )}
            
            {message.type === 'audio' && message.audioUrl && (
              <div className="mt-3">
                <AudioPlayer
                  audioUrl={message.audioUrl}
                  title={message.audioTitle}
                  duration={message.audioDuration}
                />
              </div>
            )}
          </div>
        )}
        {/* Timestamp intentionally removed for cleaner look */}
      </div>
    </div>
  );
};
