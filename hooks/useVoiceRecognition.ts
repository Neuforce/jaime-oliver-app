import { useState, useEffect, useRef, useCallback } from 'react';

// Types for Web Speech API (not included in standard TypeScript definitions)
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
}

type webkitSpeechRecognition = SpeechRecognition;

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface UseVoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  silenceTimeout?: number; // Time in ms to wait after speech ends before triggering onResult
  autoStart?: boolean; // Automatically start listening when component mounts
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
  silenceTimeout = 2000, // Default 2 seconds of silence before considering speech ended
  autoStart = false,
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const recognitionRef = useRef<SpeechRecognition | webkitSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const isRestartingRef = useRef<boolean>(false);

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
        } catch {
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
        
        // Pre-flight audio capture to avoid "audio-capture" errors in some browsers
        // (Required user gesture still applies; this call ensures a real device exists)
        if (navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Immediately release the device; speech recognition will take over
            stream.getTracks().forEach(t => t.stop());
          } catch {
            const errorMessage = 'Unable to access microphone (audio-capture). Please check permissions or device.';
            setError(errorMessage);
            onError?.(errorMessage);
            return;
          }
        }

        reset(); // This will clear transcript and error
        
        // Small delay to ensure recognition is ready
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 100);
      } catch {
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
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionConstructor();
      
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

      recognition.onresult = (event: SpeechRecognitionEvent) => {
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
        
        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (finalTranscript) {
          // If we have final results, trigger immediately
          lastTranscriptRef.current = finalTranscript;
          onResult?.(finalTranscript, true);
        } else if (currentTranscript && continuous) {
          // If continuous mode and we have interim results, set up silence detection
          lastTranscriptRef.current = currentTranscript;
          
          // Set a timer: if no new results come in within silenceTimeout, consider it done
          silenceTimerRef.current = setTimeout(() => {
            if (lastTranscriptRef.current.trim()) {
              onResult?.(lastTranscriptRef.current.trim(), true);
              lastTranscriptRef.current = '';
            }
            silenceTimerRef.current = null;
          }, silenceTimeout);
          
          // Also call with interim results for real-time feedback
          onResult?.(currentTranscript, false);
        } else {
          // Non-continuous mode or no interim results
          onResult?.(currentTranscript, !!finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
        // Clear silence timer when recognition ends
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        setIsListening(false);
        
        // If we have a pending transcript and continuous mode, trigger it
        if (continuous && lastTranscriptRef.current.trim()) {
          onResult?.(lastTranscriptRef.current.trim(), true);
          lastTranscriptRef.current = '';
        }
        
        onEnd?.();
        
        // If continuous mode, restart automatically after a short delay
        // This ensures the recognition keeps listening
        if (continuous && recognitionRef.current && !isRestartingRef.current) {
          isRestartingRef.current = true;
          setTimeout(() => {
            // Only restart if recognition still exists
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                // Ignore errors when restarting (might already be started or component unmounted)
                console.debug('Could not restart recognition:', err);
              }
            }
            isRestartingRef.current = false;
          }, 200);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      const errorMessage = 'Speech recognition is not supported in this browser';
      setError(errorMessage);
      onError?.(errorMessage);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, onError, onStart, onEnd, silenceTimeout, isListening]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isSupported && !isListening && recognitionRef.current && microphonePermission !== 'denied') {
      // Delay to ensure everything is set up
      const timer = setTimeout(() => {
        if (recognitionRef.current) {
          startListening();
        }
      }, 1000); // Increased delay to ensure permissions are checked
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isSupported, microphonePermission]); // Removed isListening and startListening to avoid infinite loops

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
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): webkitSpeechRecognition;
    };
  }
}
