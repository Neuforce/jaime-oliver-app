import React from 'react';
import { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isRecipeList = message.type === 'recipeList';
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : (isRecipeList ? 'justify-center' : 'justify-start')
      )}
    >
      <div
        className={cn(
          isRecipeList ? '' : 'max-w-[320px] rounded-2xl',
          !isRecipeList && {
            'bg-blue-600 text-white': isUser,
            'bg-white text-gray-800 border border-gray-200': !isUser && !isSystem,
            'bg-yellow-50 text-yellow-800 border border-yellow-200': isSystem,
          }
        )}
      >
        <div className={cn('text-sm whitespace-pre-wrap break-words', isRecipeList ? 'px-0 py-0' : 'px-4 py-3')}>
          {message.content}
        </div>

        {isRecipeList && message.recipes && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white">
            <div className="px-4 py-3 border-b">
              <div className="text-base font-semibold">My recommendations</div>
            </div>
            <div className="p-4 space-y-5">
              {message.recipes.map((r, idx) => (
                <div key={idx} className="flex flex-col">
                  <img src={r.imageUrl} alt={r.title} className="w-full h-40 object-cover rounded-lg" />
                  <div className="pt-2">
                    <div className="font-medium text-gray-800">{r.title}</div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      {/* Timer icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="#2AB3A6" strokeWidth="2"/>
                        <path d="M12 7v5l3 2" stroke="#2AB3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{r.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
        {/* Timestamp intentionally removed for cleaner look */}
      </div>
    </div>
  );
};
