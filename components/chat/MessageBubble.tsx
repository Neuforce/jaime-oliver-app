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
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl',
          {
            'bg-blue-600 text-white': isUser,
            'bg-white text-gray-800 border border-gray-200': !isUser && !isSystem,
            'bg-yellow-50 text-yellow-800 border border-yellow-200': isSystem,
          }
        )}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
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
        <div
          className={cn(
            'text-xs mt-2 opacity-60',
            isUser ? 'text-blue-100' : 'text-gray-400'
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
