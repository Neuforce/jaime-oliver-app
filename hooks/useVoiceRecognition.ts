import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseVoiceRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  checkMicrophonePermission: () => Promise<void>;
}

export const useVoiceRecognition = ({
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
  onResult,
  onError,
  onStart,
  onEnd,
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const recognitionRef = useRef<any>(null);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(permission.state);
        
        permission.onchange = () => {
          setMicrophonePermission(permission.state);
        };
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Fallback: try to access microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicrophonePermission('granted');
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          setMicrophonePermission('denied');
        }
      } else {
        setMicrophonePermission('unknown');
      }
    } catch (err) {
      console.error('Error checking microphone permission:', err);
      setMicrophonePermission('unknown');
    }
  }, []);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Check microphone permission first
        await checkMicrophonePermission();
        
        // Get the current permission state after checking
        const currentPermission = await new Promise<'granted' | 'denied' | 'prompt' | 'unknown'>((resolve) => {
          if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as PermissionName })
              .then(permission => resolve(permission.state))
              .catch(() => resolve('unknown'));
          } else {
            resolve('unknown');
          }
        });
        
        if (currentPermission === 'denied') {
          const errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
          setError(errorMessage);
          onError?.(errorMessage);
          return;
        }
        
        reset(); // This will clear transcript and error
        
        // Small delay to ensure recognition is ready
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 100);
      } catch (err) {
        const errorMessage = 'Failed to start voice recognition';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    }
  }, [isListening, reset, onError, checkMicrophonePermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = maxAlternatives;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript(''); // Clear previous transcript when starting new recording
        onStart?.();
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        onResult?.(currentTranscript, !!finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = '';
        let userFriendlyMessage = '';
        
        switch (event.error) {
          case 'audio-capture':
            errorMessage = 'Microphone access denied or not available';
            userFriendlyMessage = 'Please check your microphone permissions and make sure no other app is using it.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            userFriendlyMessage = 'Please allow microphone access in your browser settings.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected';
            userFriendlyMessage = 'Please speak louder or check your microphone.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition aborted';
            userFriendlyMessage = 'Voice input was interrupted. Please try again.';
            break;
          case 'network':
            errorMessage = 'Network error';
            userFriendlyMessage = 'Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service not allowed';
            userFriendlyMessage = 'Speech recognition is not available in this context.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
            userFriendlyMessage = 'An unexpected error occurred. Please try again.';
        }
        
        setError(userFriendlyMessage);
        onError?.(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onEnd?.();
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      const errorMessage = 'Speech recognition is not supported in this browser';
      setError(errorMessage);
      onError?.(errorMessage);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, onError, onStart, onEnd]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    microphonePermission,
    startListening,
    stopListening,
    reset,
    checkMicrophonePermission,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
