import React, { useState } from 'react';
import { ENABLE_VOICE_INPUT } from '../../config/features';

interface StandardInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoiceInput?: boolean;
  onVoiceStart?: () => void;
  isListening?: boolean;
}

export const StandardInput: React.FC<StandardInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask your question...',
  enableVoiceInput = ENABLE_VOICE_INPUT,
  onVoiceStart,
  isListening = false,
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-full border border-gray-200 px-4 py-3 pr-24 outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 placeholder-gray-400"
      />
      
      {/* Buttons container */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Voice button */}
        {enableVoiceInput && onVoiceStart && (
          <button
            onClick={onVoiceStart}
            className={`h-10 w-10 rounded-full ${isListening ? 'bg-teal-700' : 'bg-teal-600'} hover:bg-teal-700 text-white flex items-center justify-center transition-colors`}
            aria-label="Voice"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="2" height="8" rx="1" fill="white"/>
              <rect x="8" y="6" width="2" height="12" rx="1" fill="white"/>
              <rect x="12" y="4" width="2" height="16" rx="1" fill="white"/>
              <rect x="16" y="6" width="2" height="12" rx="1" fill="white"/>
              <rect x="20" y="8" width="2" height="8" rx="1" fill="white"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

