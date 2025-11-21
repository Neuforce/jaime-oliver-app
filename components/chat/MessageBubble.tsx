import React, { useState } from 'react';
import Image from 'next/image';
import { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { RecipeAccordion } from './RecipeAccordion';

interface MessageBubbleProps {
  message: ChatMessage;
  hasExpandedRecipe?: boolean;
  onRecipeExpandedChange?: (expanded: boolean) => void;
  getRecipe?: (workflowId: string) => void;
  startRecipe?: (workflowId: string) => void;
  taskDone?: (taskId: string) => void;
  contextualMessages?: ChatMessage[]; // Messages to show contextually (text, scheduled_task)
  autoNavigateToTaskId?: string | null;
  onAutoNavigateComplete?: () => void;
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

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  hasExpandedRecipe = false, 
  onRecipeExpandedChange, 
  getRecipe, 
  startRecipe, 
  taskDone,
  contextualMessages = [],
  autoNavigateToTaskId,
  onAutoNavigateComplete
}) => {
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(false);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState<string | null>(null);
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isRecipeList = message.type === 'recipeList';

  console.log('[MessageBubble] Rendering message:', {
    sender: message.sender,
    type: message.type,
    content: message.content.substring(0, 50),
    isUser,
    isSystem,
    isRecipeList
  });

  const handleRecipeExpandedChange = (expanded: boolean) => {
    setIsRecipeExpanded(expanded);
    onRecipeExpandedChange?.(expanded);
  };

  return (
    <div className="w-full">
      {isUser ? (
        // User message: gray bubble with full width
        <div className="w-full rounded-2xl bg-gray-100 text-gray-900 mb-4">
          <div className="text-sm whitespace-pre-wrap break-words px-4 py-3">
            {message.content}
          </div>
        </div>
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
                onExpandChange={handleRecipeExpandedChange}
                onRecipeSelected={setSelectedRecipeTitle}
                getRecipe={getRecipe}
                startRecipe={startRecipe}
                taskDone={taskDone}
                contextualMessages={contextualMessages}
                autoNavigateToTaskId={autoNavigateToTaskId}
                onAutoNavigateComplete={onAutoNavigateComplete}
              />
            )}
          </>
      ) : (
        // Agent message: plain text
        <div className="w-full mb-4">
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
    </div>
  );
};
