import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types/chat';
import { getSessionId, getCurrentSessionId, setCurrentSessionId } from '../lib/session';
import { saveConversation, saveConversationMessages, getConversationMessages } from '../lib/conversationHistory';
import { WebSocketManager } from '../lib/websocket';

interface UseChatSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  initialSessionId?: string;
  initialMessages?: ChatMessage[];
}

export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages || []);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(options.initialSessionId || '');
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  const connect = useCallback(async () => {
    try {
      let session: string | undefined = options.initialSessionId;
      
      if (!session) {
        // Check if there's a current session
        session = getCurrentSessionId() || undefined;
        
        if (!session) {
          // Create a new session
          session = getSessionId();
          setCurrentSessionId(session);
        }
      } else {
        setCurrentSessionId(session);
      }
      
      setSessionId(session);
      setError(null);

      // Connect to WebSocket server to receive push messages from backend
      // Allow disabling WS by leaving NEXT_PUBLIC_WS_URL undefined or setting it to "disabled"
      const wsBase = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsBase || wsBase === 'disabled') {
        // Skip WS connection in local/dev mock mode
        setIsConnected(false);
        wsManagerRef.current = null;
        return;
      }
      const wsUrl = `${wsBase}/api/ws?session_id=${session}`;
      const wsManager = new WebSocketManager(wsUrl);
      
      // Set up event listeners
      wsManager.on('connected', () => {
        console.log('[useChatSocket] WebSocket connected for session:', session);
        setIsConnected(true);
        options.onConnect?.();
      });

      wsManager.on('disconnected', () => {
        console.log('[useChatSocket] WebSocket disconnected');
        setIsConnected(false);
        options.onDisconnect?.();
      });

      wsManager.on('message', (wsMessage: any) => {
        console.log('[useChatSocket] Received WebSocket message:', wsMessage);
        
        // Handle different types of messages
        if (wsMessage.type === 'message' && wsMessage.data) {
          const chatMessage: ChatMessage = wsMessage.data;
          
          // Add message to state
          setMessages(prev => {
            const newMessages = [...prev, chatMessage];
            saveConversationMessages(session, newMessages);
            return newMessages;
          });
          
          // Call the onMessage callback
          options.onMessage?.(chatMessage);
        }
      });

      wsManager.on('error', (error: any) => {
        console.error('[useChatSocket] WebSocket error:', error);
        const errorMessage = error.error || 'Connection error';
        setError(errorMessage);
        options.onError?.(errorMessage);
      });

      // Store manager reference
      wsManagerRef.current = wsManager;
      
      // Connect to WebSocket
      await wsManager.connect();
      
    } catch (err) {
      console.error('[useChatSocket] Connection error:', err);
      const errorMessage = 'Could not connect to server';
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsConnected(false);
    }
  }, [options]);

  // Sync in case initial values arrive after hook initialization
  useEffect(() => {
    // If a specific session is requested and it's different from current, switch to it
    if (options.initialSessionId && options.initialSessionId !== sessionId) {
      setSessionId(options.initialSessionId);
      setCurrentSessionId(options.initialSessionId);
    }

    // If initial messages are provided, load them into state
    if (options.initialMessages && options.initialMessages.length > 0) {
      setMessages(options.initialMessages);
    }
  }, [options.initialSessionId, options.initialMessages]);

  const disconnect = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Disconnect WebSocket
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      wsManagerRef.current = null;
    }
    
    setIsConnected(false);
    options.onDisconnect?.();
  }, [options]);

  const sendMessage = useCallback(async (content: string) => {
    if (!isConnected) {
      setError('No active connection');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add user message immediately to UI
      const userMessage: ChatMessage = {
        type: 'message',
        sender: 'user',
        session_id: sessionId,
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => {
        const newMessages = [...prev, userMessage];
        saveConversationMessages(sessionId, newMessages);
        return newMessages;
      });

      // Send message to workflow system
      const response = await fetch('/api/workflow/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Error sending message');
      }

      // Simulate agent response after a delay
      setTimeout(() => {
        // Randomly decide response type
        const responseType = Math.random();
        const shouldSendVideo = responseType < 0.25; // 25% chance of video response
        const shouldSendAudio = responseType >= 0.25 && responseType < 0.45; // 20% chance of audio response
        
        let agentMessage: ChatMessage;
        
        if (shouldSendVideo) {
          // Sample video responses
          const videoResponses = [
            {
              content: "Here's a helpful video that might answer your question:",
              videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
              videoTitle: "Sample Video Response",
              videoThumbnail: "https://via.placeholder.com/320x180/4F46E5/FFFFFF?text=Video+Response"
            },
            {
              content: "I found this video that explains exactly what you're asking about:",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              videoTitle: "Big Buck Bunny - Sample Video",
              videoThumbnail: "https://via.placeholder.com/320x180/059669/FFFFFF?text=Big+Buck+Bunny"
            },
            {
              content: "This video tutorial should help you understand better:",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              videoTitle: "Elephant's Dream - Tutorial",
              videoThumbnail: "https://via.placeholder.com/320x180/DC2626/FFFFFF?text=Tutorial+Video"
            }
          ];
          
          const selectedVideo = videoResponses[Math.floor(Math.random() * videoResponses.length)];
          
          agentMessage = {
            type: 'video',
            sender: 'agent',
            session_id: sessionId,
            content: selectedVideo.content,
            timestamp: new Date().toISOString(),
            videoUrl: selectedVideo.videoUrl,
            videoTitle: selectedVideo.videoTitle,
            videoThumbnail: selectedVideo.videoThumbnail,
          };
        } else if (shouldSendAudio) {
          // Sample audio responses
          const audioResponses = [
            {
              content: "Here's an audio explanation that might help:",
              audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
              audioTitle: "Audio Explanation",
              audioDuration: 3
            },
            {
              content: "Listen to this audio message for more details:",
              audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
              audioTitle: "Detailed Audio Response",
              audioDuration: 2
            },
            {
              content: "I've prepared an audio response for you:",
              audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-03.wav",
              audioTitle: "Audio Message",
              audioDuration: 4
            }
          ];
          
          const selectedAudio = audioResponses[Math.floor(Math.random() * audioResponses.length)];
          
          agentMessage = {
            type: 'audio',
            sender: 'agent',
            session_id: sessionId,
            content: selectedAudio.content,
            timestamp: new Date().toISOString(),
            audioUrl: selectedAudio.audioUrl,
            audioTitle: selectedAudio.audioTitle,
            audioDuration: selectedAudio.audioDuration,
          };
        } else {
          // Regular text response
          const textResponses = [
            `I received your message: "${content}". How else can I help you?`,
            `Thank you for your message. I've processed: "${content}". Do you need more information?`,
            `I've received your inquiry about "${content}". Let me help you with that.`,
            `Interesting point about "${content}". Would you like to dive deeper into any specific aspect?`,
          ];
          
          agentMessage = {
            type: 'message',
            sender: 'agent',
            session_id: sessionId,
            content: textResponses[Math.floor(Math.random() * textResponses.length)],
            timestamp: new Date().toISOString(),
          };
        }
        
        setMessages(prev => {
          const newMessages = [...prev, agentMessage];
          saveConversationMessages(sessionId, newMessages);
          return newMessages;
        });
        options.onMessage?.(agentMessage);
        setIsLoading(false);
      }, 1000 + Math.random() * 2000);

    } catch (err) {
      const errorMessage = 'Error sending message';
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [isConnected, sessionId, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (sessionId) {
      saveConversationMessages(sessionId, []);
    }
  }, [sessionId]);

  // Save conversation when messages change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveConversation(sessionId, messages);
    }
  }, [sessionId, messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sessionId,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
};