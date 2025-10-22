import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { VoiceInput } from './VoiceInput';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoiceInput?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  enableVoiceInput = true,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceResult = (text: string) => {
    if (text.trim()) {
      // Auto-send voice messages for better UX in kitchen
      // Don't set the message in the input to avoid showing it
      onSendMessage(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white border-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
      />
      
      {enableVoiceInput && (
        <VoiceInput
          onVoiceResult={handleVoiceResult}
          disabled={disabled}
          language="en-US"
        />
      )}
      
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        Send
      </Button>
    </form>
  );
};
