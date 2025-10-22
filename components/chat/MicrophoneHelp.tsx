import React, { useState } from 'react';

interface MicrophoneHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MicrophoneHelp: React.FC<MicrophoneHelpProps> = ({
  isVisible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'chrome' | 'safari' | 'edge'>('chrome');

  if (!isVisible) return null;

  const browserInstructions = {
    chrome: {
      title: 'Chrome',
      steps: [
        'Click the lock icon in the address bar',
        'Set "Microphone" to "Allow"',
        'Refresh the page',
        'Click the microphone button again'
      ]
    },
    safari: {
      title: 'Safari',
      steps: [
        'Go to Safari > Preferences',
        'Click the "Websites" tab',
        'Select "Microphone" from the left sidebar',
        'Set this website to "Allow"',
        'Refresh the page'
      ]
    },
    edge: {
      title: 'Edge',
      steps: [
        'Click the lock icon in the address bar',
        'Set "Microphone" to "Allow"',
        'Refresh the page',
        'Click the microphone button again'
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🎤 Microphone Access Help
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            The voice input feature needs access to your microphone. Here's how to enable it:
          </p>

          {/* Browser Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {Object.entries(browserInstructions).map(([key, browser]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {browser.title}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            {browserInstructions[activeTab].steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 font-medium">Common Issues:</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Make sure no other app is using your microphone</li>
                <li>• Check if your microphone is working in other applications</li>
                <li>• Try refreshing the page after changing permissions</li>
                <li>• On mobile: Check your device's microphone permissions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};
