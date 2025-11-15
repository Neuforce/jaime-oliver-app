import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChatMessage, WebSocketMessage, RecipeItem, RecipeWorkflow, RecipeDetail, RecipeTask, RecipeDefinition, TaskDonePayload, NextTask } from '../types/chat';
import { saveConversation, saveConversationMessages } from '../lib/conversationHistory';
import { WsClient } from '../lib/wsClient';
import { useSessionId } from './useSessionId';

// Default images mapping for recipes (can be expanded)
const DEFAULT_RECIPE_IMAGES: Record<string, string> = {
  'jacket potato': '/images/jacket-potato.png',
  'chickpea arrabbiata': '/images/arrabbiata.png',
  'happy fish pie': '/images/fish-pie.png',
  'tomato & mussel pasta': '/images/tomato-mussel-pasta.webp',
  'sumptuous squash risotto': '/images/risotto.webp',
  // Add more mappings as needed
};

// Helper function to get default image for a recipe
const getDefaultRecipeImage = (recipeName: string): string => {
  const normalizedName = recipeName.toLowerCase().trim();
  return DEFAULT_RECIPE_IMAGES[normalizedName] || '/images/jacket-potato.png'; // Fallback to default
};

// Helper function to check if a URL is a valid image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  // Check if it's a local path (starts with /)
  if (url.startsWith('/')) return true;
  // Check if it ends with common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) && !lowerUrl.includes('/recipes/');
};

// Local images mapping for ingredients (can be expanded)
const INGREDIENT_IMAGES: Record<string, string> = {
  'garlic': '/images/ingredients/garlic.png',
  'celery': '/images/ingredients/celery.png',
  'fennel': '/images/ingredients/fennel.png',
  'courgette': '/images/ingredients/courgette.png',
  'zucchini': '/images/ingredients/courgette.png', // Alternative name
  'pasta': '/images/ingredients/pasta.png',
  'linguine': '/images/ingredients/pasta.png',
  'tagliatelle': '/images/ingredients/pasta.png',
  'spaghetti': '/images/ingredients/pasta.png',
  'olive oil': '/images/ingredients/olive-oil.png',
  'tomatoes': '/images/ingredients/tomatoes.png',
  'tomato': '/images/ingredients/tomatoes.png',
  'mussels': '/images/ingredients/mussels.png',
  'mussel': '/images/ingredients/mussels.png',
  'lemon': '/images/ingredients/lemon.png',
  'rocket': '/images/ingredients/rocket.png',
  'arugula': '/images/ingredients/rocket.png', // Alternative name
  'salt': '/images/ingredients/salt.png',
  'pepper': '/images/ingredients/pepper.png',
  'butter': '/images/ingredients/butter.png',
  'parmesan': '/images/ingredients/parmesan.png',
  'basil': '/images/ingredients/basil.png',
  'squash': '/images/ingredients/squash.png',
  'butternut squash': '/images/ingredients/squash.png',
  'risotto': '/images/ingredients/risotto.png',
  'arborio rice': '/images/ingredients/risotto.png',
  'stock': '/images/ingredients/stock.png',
  'vegetable stock': '/images/ingredients/stock.png',
  // Add more mappings as needed
};

// Local images mapping for utensils/equipment (can be expanded)
const UTENSIL_IMAGES: Record<string, string> = {
  'knife': '/images/utensils/knife.png',
  'sharp knife': '/images/utensils/knife.png',
  'cutting board': '/images/utensils/cutting-board.png',
  'pot': '/images/utensils/pot.png',
  'large pot': '/images/utensils/pot.png',
  'frying pan': '/images/utensils/pan.png',
  'pan': '/images/utensils/pan.png',
  'large frying pan': '/images/utensils/pan.png',
  'colander': '/images/utensils/colander.png',
  'spoon': '/images/utensils/spoon.png',
  'wooden spoon': '/images/utensils/spoon.png',
  'spatula': '/images/utensils/spatula.png',
  'tongs': '/images/utensils/tongs.png',
  'bowl': '/images/utensils/bowl.png',
  'small bowl': '/images/utensils/bowl.png',
  'plate': '/images/utensils/plate.png',
  'serving plate': '/images/utensils/plate.png',
  'lid': '/images/utensils/lid.png',
  'zester': '/images/utensils/zester.png',
  'grater': '/images/utensils/grater.png',
  'ladle': '/images/utensils/ladle.png',
  // Add more mappings as needed
};

// Helper function to get ingredient image (checks backend first, then local mapping)
const getIngredientImage = (ingredientName: string, backendImageUrl?: string): string => {
  // Priority 1: Use backend image if provided and valid
  if (backendImageUrl && isValidImageUrl(backendImageUrl)) {
    return backendImageUrl;
  }
  
  // Priority 2: Try to find in local mapping by matching ingredient name
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  if (INGREDIENT_IMAGES[normalizedName]) {
    return INGREDIENT_IMAGES[normalizedName];
  }
  
  // Try partial match (e.g., "2 cloves of garlic" -> "garlic")
  for (const [key, imageUrl] of Object.entries(INGREDIENT_IMAGES)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  // Priority 3: Fallback to generic local image
  return '/images/ingredients/default.png';
};

// Helper function to get utensil image (checks backend first, then local mapping)
const getUtensilImage = (utensilName: string, backendImageUrl?: string): string => {
  // Priority 1: Use backend image if provided and valid
  if (backendImageUrl && isValidImageUrl(backendImageUrl)) {
    return backendImageUrl;
  }
  
  // Priority 2: Try to find in local mapping by matching utensil name
  const normalizedName = utensilName.toLowerCase().trim();
  
  // Try exact match first
  if (UTENSIL_IMAGES[normalizedName]) {
    return UTENSIL_IMAGES[normalizedName];
  }
  
  // Try partial match (e.g., "Large pot for pasta" -> "pot")
  for (const [key, imageUrl] of Object.entries(UTENSIL_IMAGES)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  // Priority 3: Fallback to generic local image
  return '/images/utensils/default.png';
};

// Transform backend workflow to RecipeItem
const transformWorkflowToRecipeItem = (workflow: RecipeWorkflow): RecipeItem & { workflowId?: string } => {
  return {
    title: workflow.name,
    duration: '', // Will be populated when getrecipe is called
    imageUrl: getDefaultRecipeImage(workflow.name),
    introText: workflow.description,
    workflowId: workflow.id, // Store workflowId for matching when getrecipe is called
    // ingredients, utensils, steps will be populated when getrecipe is called
  };
};

// Transform backend recipe detail to RecipeItem (updates existing recipe with full details)
const transformRecipeDetailToRecipeItem = (recipeDetail: RecipeDetail): RecipeItem => {
  const definition = recipeDetail.definition;
  const metadata = definition?.metadata || {};

  // Transform tasks to steps
  const steps = definition?.tasks?.map((task: RecipeTask) => ({
    title: task.name,
    duration: task.metadata?.cookingTime || task.timerDuration || task.metadata?.timerDuration || '',
    icon: undefined, // Can be added later if needed
    description: task.description, // Short description
    detailedDescription: task.metadata?.detailedDescription, // Full markdown description
    taskId: task.taskId, // Store taskId for taskdone action
  })) || [];

  // Transform ingredientsList to ingredients array
  // Backend may send as array of strings or array of objects with imageUrl
  const ingredients = metadata.ingredientsList?.map((ingredient: string | { name: string; quantity?: string; imageUrl?: string }) => {
    // Handle both string and object formats from backend
    if (typeof ingredient === 'string') {
      return {
        name: ingredient,
        quantity: '', // Not provided in ingredientsList when it's a string
        imageUrl: getIngredientImage(ingredient),
      };
    } else {
      // Backend sent an object with imageUrl
      return {
        name: ingredient.name,
        quantity: ingredient.quantity || '',
        imageUrl: getIngredientImage(ingredient.name, ingredient.imageUrl),
      };
    }
  }) || [];

  // Transform equipmentNeeded to utensils array
  // Backend may send as array of strings or array of objects with imageUrl
  const utensils = metadata.equipmentNeeded?.map((equipment: string | { name: string; imageUrl?: string }) => {
    // Handle both string and object formats from backend
    if (typeof equipment === 'string') {
      return {
        name: equipment,
        imageUrl: getUtensilImage(equipment),
      };
    } else {
      // Backend sent an object with imageUrl
      return {
        name: equipment.name,
        imageUrl: getUtensilImage(equipment.name, equipment.imageUrl),
      };
    }
  }) || [];

  // Use local image if metadata.imageUrl is not a valid image URL (e.g., it's a page URL)
  const imageUrl = isValidImageUrl(metadata.imageUrl) 
    ? metadata.imageUrl! 
    : getDefaultRecipeImage(recipeDetail.name);

  return {
    title: recipeDetail.name,
    duration: metadata.estimatedTime || '',
    imageUrl,
    introText: recipeDetail.description,
    ingredients,
    utensils,
    steps,
  };
};

interface UseChatSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  initialSessionId?: string;
  initialMessages?: ChatMessage[];
}

export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  // Use useSessionId hook for persistent session management
  const persistentSessionId = useSessionId();
  const sessionId = options.initialSessionId || persistentSessionId;
  
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages || []);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WsClient | null>(null);
  // Refs to store latest versions of callbacks without causing re-renders
  const handleIncomingRef = useRef<((data: any) => void) | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref whenever options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Validate environment variables
  const envErrors = useMemo(() => {
    const errs: string[] = [];
    const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT;
    if (!wsEndpoint || wsEndpoint === 'disabled' || wsEndpoint.trim() === '') {
      // This is not an error, just means WS is disabled
      return [];
    }
    try {
      new URL(wsEndpoint);
    } catch {
      errs.push('Invalid NEXT_PUBLIC_WS_ENDPOINT format');
    }
    return errs;
  }, []);

  // Handle incoming messages from WebSocket
  const handleIncoming = useCallback(
    (data: any) => {
      console.log('[useChatSocket] Processing message:', data?.type, data?.messageType);
      try {
        // WsClient emits messages as strings, so we need to parse them
        let parsedData = data;
        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data);
      } catch {
            console.warn('[useChatSocket] Failed to parse message as JSON:', data);
            return;
          }
        }

        const message = parsedData as WebSocketMessage;

        // Handle recipes_list message from backend
        if (message.type === 'response' && message.messageType === 'recipes_list' && message.payload) {
          const payload = message.payload as { recipes: { workflows: RecipeWorkflow[]; count: number } };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.recipes && payload.recipes.workflows) {
            // Transform workflows to RecipeItem[]
            const recipes: RecipeItem[] = payload.recipes.workflows.map(transformWorkflowToRecipeItem);

            const chatMessage: ChatMessage = {
              type: 'recipeList',
              sender: 'agent',
              session_id: sessionId,
              content: `Found ${payload.recipes.count || recipes.length} recipe${payload.recipes.count !== 1 ? 's' : ''}`,
              timestamp,
              recipes,
            };

            // Add message to state
            setMessages(prev => {
              const newMessages = [...prev, chatMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

            // Call the onMessage callback
            optionsRef.current.onMessage?.(chatMessage);
          }
        return;
      }
      
        // Handle recipe_detail message from backend
        if (message.type === 'response' && message.messageType === 'recipe_detail' && message.payload) {
          const payload = message.payload as { recipe: RecipeDetail; workflowId: string };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.recipe) {
            // Transform recipe detail to RecipeItem with full details
            const recipeItem = transformRecipeDetailToRecipeItem(payload.recipe);

            // Update the existing recipe in the recipeList message
            setMessages(prev => {
              const newMessages = prev.map(msg => {
                if (msg.type === 'recipeList' && msg.recipes) {
                  // Find and update the recipe by matching workflowId
                  const updatedRecipes = msg.recipes.map(recipe => {
                    const recipeWithId = recipe as RecipeItem & { workflowId?: string };
                    // Match by workflowId (most reliable) or by title as fallback
                    if (recipeWithId.workflowId === payload.workflowId ||
                        recipeWithId.workflowId === payload.recipe.id ||
                        recipe.title === payload.recipe.name) {
                      // Merge existing recipe with new details
                      return {
                        ...recipe,
                        ...recipeItem,
                        // Preserve workflowId for future matching
                        workflowId: payload.recipe.id,
                      } as RecipeItem & { workflowId?: string };
                    }
                    return recipe;
                  });
                  return { ...msg, recipes: updatedRecipes };
                }
                return msg;
              });
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

            // Also create a standalone message for the recipe detail
            const chatMessage: ChatMessage = {
              type: 'recipeList',
              sender: 'agent',
              session_id: sessionId,
              content: `Recipe details for "${payload.recipe.name}"`,
              timestamp,
              recipes: [recipeItem],
            };

            // Call the onMessage callback
            optionsRef.current.onMessage?.(chatMessage);
          }
          return;
        }

        // Handle task_done message from backend
        if (message.type === 'response' && message.messageType === 'task_done' && message.payload) {
          const payload = message.payload as TaskDonePayload;
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.data && payload.status === 'success') {
            console.log('[useChatSocket] Task completed:', payload.taskId, 'Next tasks:', payload.data.nextTasks?.length || 0);

            // Create a status message about the task completion
            const statusMessage: ChatMessage = {
              type: 'status',
              sender: 'system',
              session_id: sessionId,
              content: `Task "${payload.data.nextTasks?.[0]?.name || payload.taskId}" completed. ${payload.data.nextTasks?.length ? `Next: ${payload.data.nextTasks.map(t => t.name).join(', ')}` : 'Recipe completed!'}`,
              timestamp,
            };

            // Add status message to state
            setMessages(prev => {
              const newMessages = [...prev, statusMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

            // Call the onMessage callback
            optionsRef.current.onMessage?.(statusMessage);

            // If there are next tasks, we could update the recipe steps or show them
            // This depends on how you want to handle the next tasks in the UI
            if (payload.data.nextTasks && payload.data.nextTasks.length > 0) {
              console.log('[useChatSocket] Next tasks available:', payload.data.nextTasks);
              // You might want to update the recipe steps here or trigger navigation to next step
            }
          } else if (payload.status === 'error') {
            const errorMessage: ChatMessage = {
              type: 'status',
              sender: 'system',
              session_id: sessionId,
              content: `Error completing task: ${payload.taskId}`,
              timestamp,
            };
            setMessages(prev => {
              const newMessages = [...prev, errorMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });
            optionsRef.current.onError?.(`Failed to complete task: ${payload.taskId}`);
          }
          return;
        }

        // Handle legacy message format
        if (message.type === 'message' && message.data) {
          const rawData = message.data as unknown;

          let chatMessage: ChatMessage | null = null;
          if (typeof rawData === 'object' && rawData !== null) {
            const d = rawData as Record<string, unknown>;
            const hasChatFields = typeof d.type === 'string'
              && typeof d.sender === 'string'
              && typeof d.content === 'string'
              && typeof d.timestamp === 'string'
              && typeof d.session_id === 'string';

            if (hasChatFields) {
              chatMessage = d as unknown as ChatMessage;
            } else {
              // Handle PushMessage-like payloads by normalizing to ChatMessage
              const hasPushFields = typeof d.sender === 'string'
                && typeof d.content === 'string'
                && typeof d.timestamp === 'string';
              if (hasPushFields) {
                chatMessage = {
                  type: 'message',
                  sender: d.sender as ChatMessage['sender'],
                  session_id: (d.session_id as string) || sessionId,
                  content: d.content as string,
                  timestamp: d.timestamp as string,
                };
              }
            }
          }

          if (chatMessage) {
            // Add message to state
            setMessages(prev => {
              const newMessages = [...prev, chatMessage!];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });
            
            // Call the onMessage callback
            optionsRef.current.onMessage?.(chatMessage);
          }
        }
      } catch (e) {
        console.error('[useChatSocket] Error handling incoming message:', e);
      }
    },
    [sessionId]
  );
  
  // Update ref whenever handleIncoming changes
  handleIncomingRef.current = handleIncoming;

  // Init WebSocket client - following ChatProvider pattern
  useEffect(() => {
    if (envErrors.length > 0) {
      setIsConnected(false);
      setError('Invalid WebSocket configuration');
      return;
    }
    
    // Don't connect until we have a valid sessionId
    if (!sessionId) {
      console.log('[useChatSocket] Waiting for sessionId...');
      return;
    }
    
    // Allow disabling WS by leaving NEXT_PUBLIC_WS_ENDPOINT undefined or setting it to "disabled"
    const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT;
    if (!wsEndpoint || wsEndpoint === 'disabled' || wsEndpoint.trim() === '') {
      // Skip WS connection in local/dev mock mode - no error, just don't connect
      console.log('[useChatSocket] WebSocket disabled or not configured, skipping connection');
      setIsConnected(false);
      wsRef.current = null;
      return;
    }
    
    // Prevent multiple connections by checking if one already exists
    if (wsRef.current) {
      console.log('[useChatSocket] WebSocket already initialized, skipping...');
      return;
    }
    
    console.log(`[useChatSocket] Initializing WebSocket with sessionId: ${sessionId.slice(0, 8)}...`);
    const client = new WsClient({
      endpoint: wsEndpoint,
      token: process.env.NEXT_PUBLIC_WS_TOKEN, // Token required for AWS API Gateway WebSocket
      sessionId
    });
    wsRef.current = client;
    setIsConnected(false);
    setError(null);
    
    client.on('open', () => {
      setIsConnected(true);
      setError(null);
      console.log('[useChatSocket] WebSocket connected for session:', sessionId);
      optionsRef.current.onConnect?.();
    });
    
    client.on('close', (code, reason) => {
      setIsConnected(false);
      wsRef.current = null; // Clear ref on close
      console.log(`[useChatSocket] WebSocket closed: ${code} ${reason}`);
      optionsRef.current.onDisconnect?.();
    });
    
    client.on('message', (msg) => {
      // Use ref to call handleIncoming to avoid stale closures
      handleIncomingRef.current?.(msg);
    });
    
    client.on('error', (err) => {
      console.error('[useChatSocket] WebSocket error:', err);
      const errorMessage = typeof err === 'string' ? err : 'Connection error';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
    });
    
    client.connect();
    
    return () => {
      console.log('[useChatSocket] Cleaning up WebSocket connection...');
      if (wsRef.current) {
        wsRef.current.dispose();
        wsRef.current = null;
      }
    };
  }, [envErrors.length, sessionId]);

  // Sync initial messages if provided
  useEffect(() => {
    if (options.initialMessages && options.initialMessages.length > 0) {
      setMessages(options.initialMessages);
    }
  }, [options.initialMessages]);

  const disconnect = useCallback(() => {
    // Disconnect WebSocket
    if (wsRef.current) {
      wsRef.current.dispose();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    optionsRef.current.onDisconnect?.();
  }, []);

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
        optionsRef.current.onMessage?.(agentMessage);
        setIsLoading(false);
      }, 1000 + Math.random() * 2000);

    } catch {
      const errorMessage = 'Error sending message';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [isConnected, sessionId]);

  const getRecipes = useCallback(() => {
    if (!isConnected || !wsRef.current) {
      setError('No active connection');
      console.warn('[useChatSocket] Cannot get recipes - WebSocket not connected');
      return;
    }

    try {
      console.log('[useChatSocket] Requesting recipes from backend...');
      const out = {
        action: 'getrecipes' as const,
        payload: ''
      };
      wsRef.current.sendJson(out);
    } catch (err) {
      const errorMessage = 'Error requesting recipes';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      console.error('[useChatSocket] Error sending getrecipes:', err);
    }
  }, [isConnected]);

  const getRecipe = useCallback((workflowId: string) => {
    if (!isConnected || !wsRef.current) {
      setError('No active connection');
      console.warn('[useChatSocket] Cannot get recipe - WebSocket not connected');
      return;
    }

    try {
      console.log('[useChatSocket] Requesting recipe details for workflowId:', workflowId);
      const out = {
        action: 'getrecipe' as const,
        payload: { workflowId }
      };
      wsRef.current.sendJson(out);
    } catch (err) {
      const errorMessage = 'Error requesting recipe details';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      console.error('[useChatSocket] Error sending getrecipe:', err);
    }
  }, [isConnected]);

  const taskDone = useCallback((taskId: string) => {
    if (!isConnected || !wsRef.current) {
      setError('No active connection');
      console.warn('[useChatSocket] Cannot mark task as done - WebSocket not connected');
      return;
    }

    try {
      console.log('[useChatSocket] Marking task as done:', taskId);
      const out = {
        action: 'taskdone' as const,
        payload: { taskId }
      };
      wsRef.current.sendJson(out);
    } catch (err) {
      const errorMessage = 'Error marking task as done';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      console.error('[useChatSocket] Error sending taskdone:', err);
    }
  }, [isConnected]);

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

  // Note: Cleanup is handled in the WebSocket initialization useEffect above

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sessionId,
    disconnect,
    sendMessage,
    getRecipes,
    getRecipe,
    taskDone,
    clearMessages,
  };
};