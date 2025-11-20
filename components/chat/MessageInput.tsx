import React from 'react';
import { StandardInput } from '../ui/StandardInput';
import { ENABLE_VOICE_INPUT } from '../../config/features';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoiceInput?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask me anything about cooking...',
  enableVoiceInput = ENABLE_VOICE_INPUT,
}) => {
  const { startListening, isListening } = useVoiceRecognition({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    silenceTimeout: 2000,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        onSendMessage(text.trim());
      }
    },
  });

  return (
    <div className="p-4 bg-white border-t flex-shrink-0">
      <StandardInput
        onSend={onSendMessage}
        disabled={disabled}
        placeholder={placeholder}
        enableVoiceInput={enableVoiceInput}
        onVoiceStart={enableVoiceInput ? startListening : undefined}
        isListening={isListening}
      />
    </div>
  );
};
