'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createNewSession } from '../lib/session';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const STARTER_QUESTIONS = [
  'I feel like pasta',
  'Something healthy',
  'Quick 15-minute meal',
  'Desert ideas',
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const { startListening, isListening, isSupported } = useVoiceRecognition({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    silenceTimeout: 2000, // Wait 2 seconds of silence before sending
    autoStart: true, // Automatically start listening when page loads
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        beginChat(text.trim());
      }
    },
  });

  const beginChat = async (starter?: string) => {
    createNewSession();
    await new Promise(r => setTimeout(r, 100));
    if (starter) {
      router.push(`/chat?starter=${encodeURIComponent(starter)}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-center px-4 py-3">
        <Image src="/jamie-heart.png" alt="Jamie Oliver" width={150} height={20} />
      </header>

      <main className="px-4 max-w-md mx-auto relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center pb-24">
        {/* Hero radial gradient as in mock */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-0"
          style={{
            top: 100,
            width: 394,
            height: 394,
            background:
              'radial-gradient(50% 50% at 50% 0%, rgba(255,255,255,1) 0%, rgba(72,198,177,0.35) 50%, rgba(240,255,23,0.22) 100%)',
            filter: 'blur(84px)',
            opacity: 1,
            borderRadius: 9999,
          }}
        />
        <div className="flex flex-col items-center mt-6 mb-6">
          <div className="relative w-40 h-40 rounded-full p-1"
               style={{
                 background: 'radial-gradient(60% 60% at 50% 50%, rgba(163, 255, 158, 0.35) 0%, rgba(163, 255, 158, 0.15) 60%, rgba(163, 255, 158, 0.00) 100%)',
                 boxShadow: '0 8px 24px rgba(80, 200, 120, 0.35)'
               }}>
            <div className="relative w-full h-full rounded-full ring-4 ring-green-400">
              <Image src="/jamie.png" alt="Jamie Oliver" fill className="rounded-full object-cover" />
            </div>
          </div>
        </div>

        <h1 className="text-center text-2xl font-semibold text-gray-900 leading-snug">
          What are you in the
          <br />
          mood for tonight?
        </h1>

        <div className="mt-5 space-y-3">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => beginChat(q)}
              className="w-full rounded-full bg-white border border-gray-200 py-3 px-5 text-left text-gray-700 shadow-sm hover:border-gray-300"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="fixed bottom-6 left-0 right-0">
          <div className="mx-auto max-w-md px-4 flex items-center gap-3">
            <div className="flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <button
              onClick={() => beginChat(input || undefined)}
              className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
              aria-label="Send"
            >
              ➤
            </button>
            <button
              onClick={() => startListening()}
              className={`h-10 w-10 rounded-full ${isListening ? 'bg-teal-700' : 'bg-teal-600'} text-white flex items-center justify-center`}
              aria-label="Voice"
              title={isSupported ? (isListening ? 'Listening...' : 'Start listening') : 'Voice not supported'}
            >
              {/* Wave icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="2" height="8" rx="1" fill="white"/>
                <rect x="8" y="6" width="2" height="12" rx="1" fill="white"/>
                <rect x="12" y="4" width="2" height="16" rx="1" fill="white"/>
                <rect x="16" y="6" width="2" height="12" rx="1" fill="white"/>
                <rect x="20" y="8" width="2" height="8" rx="1" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
