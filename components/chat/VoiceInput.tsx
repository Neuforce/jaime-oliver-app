import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { MicrophoneHelp } from './MicrophoneHelp';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  disabled?: boolean;
  language?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceResult,
  disabled = false,
  language = 'en-US',
}) => {
  const [showMicrophoneHelp, setShowMicrophoneHelp] = useState(false);
  const {
    isSupported,
    isListening,
    error,
    microphonePermission,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    language,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        onVoiceResult(text.trim());
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    },
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else if (!disabled) {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-2">
        <span className="text-sm text-gray-500">
          Voice input not supported
        </span>
      </div>
    );
  }

  if (microphonePermission === 'denied') {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="text-xs text-red-500 max-w-32">
            Microphone blocked
          </div>
          <button
            onClick={() => setShowMicrophoneHelp(true)}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
            title="Get help with microphone permissions"
          >
            Help
          </button>
        </div>
        <MicrophoneHelp
          isVisible={showMicrophoneHelp}
          onClose={() => setShowMicrophoneHelp(false)}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-red-500 max-w-32 truncate" title={error}>
            {error}
          </span>
          {error.includes('microphone') && (
            <button
              onClick={() => setShowMicrophoneHelp(true)}
              className="text-xs text-blue-500 hover:text-blue-700 underline self-start"
            >
              Get help
            </button>
          )}
        </div>
      )}
      

      <Button
        onClick={handleToggleListening}
        disabled={disabled}
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-green-500 hover:bg-green-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
        ) : (
          <svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
        )}
      </Button>

      {isListening && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      <MicrophoneHelp
        isVisible={showMicrophoneHelp}
        onClose={() => setShowMicrophoneHelp(false)}
      />
    </div>
  );
};
