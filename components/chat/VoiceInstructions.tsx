import React, { useState, useEffect } from 'react';

interface VoiceInstructionsProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const VoiceInstructions: React.FC<VoiceInstructionsProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Show instructions on first visit
    const hasSeenInstructions = localStorage.getItem('jamie-oliver-voice-instructions-seen');
    if (!hasSeenInstructions && isVisible) {
      setShowInstructions(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setShowInstructions(false);
    localStorage.setItem('jamie-oliver-voice-instructions-seen', 'true');
    onClose?.();
  };

  if (!showInstructions) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🎤 Voice Input Guide
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Click the microphone button</strong> to start voice input
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Speak clearly</strong> - ask cooking questions, request recipes, or get cooking tips
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Your message will be sent automatically</strong> when you finish speaking
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro tip:</strong> Perfect for when your hands are busy cooking! 
              Ask things like &quot;How do I make pasta?&quot; or &quot;What temperature should I cook chicken?&quot;
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
