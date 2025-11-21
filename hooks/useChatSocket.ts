import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChatMessage, WebSocketMessage, RecipeItem, RecipeWorkflow, RecipeDetail, RecipeTask, TaskDonePayload } from '../types/chat';
import { saveConversation, saveConversationMessages } from '../lib/conversationHistory';
import { WsClient } from '../lib/wsClient';
import { useSessionId } from './useSessionId';
import { getIngredientImage, getUtensilImage, getStepImage, isValidImageUrl } from '../lib/defaultImages';

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

  // Transform tasks to steps with auto-generated images based on step content
  const steps = definition?.tasks?.map((task: RecipeTask) => ({
    title: task.name,
    duration: task.metadata?.cookingTime || task.timerDuration || task.metadata?.timerDuration || '',
    icon: getStepImage(task.name, task.description, typeof task.metadata?.imageUrl === 'string' ? task.metadata.imageUrl : undefined), // Auto-generate image based on step action
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
  onNextTaskActivated?: (taskId: string) => void; // Callback when next_task arrives
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
  const handleIncomingRef = useRef<((data: WebSocketMessage) => void) | null>(null);
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
    (data: WebSocketMessage) => {
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
        console.log('[useChatSocket] ====== FULL MESSAGE RECEIVED ======');
        console.log('[useChatSocket] Type:', message.type);
        console.log('[useChatSocket] MessageType:', message.messageType);
        console.log('[useChatSocket] Payload:', message.payload);
        console.log('[useChatSocket] Metadata:', message.metadata);
        console.log('[useChatSocket] ===================================');

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

        // Handle recipe_started message from backend
        if (message.type === 'response' && message.messageType === 'recipe_started' && message.payload) {
          const payload = message.payload as {
            action: 'startrecipe';
            status: 'success' | 'error';
            requestId: string;
            workflowId: string;
            data?: Record<string, unknown>;
            error?: string;
          };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.status === 'success') {
            console.log('[useChatSocket] Recipe started successfully:', payload.workflowId, payload.data);

            // Update the recipe to mark the first step as active
            setMessages(prev => {
              const newMessages = prev.map(msg => {
                if (msg.type === 'recipeList' && msg.recipes) {
                  const updatedRecipes = msg.recipes.map(recipe => {
                    const recipeWithId = recipe as RecipeItem & { workflowId?: string };
                    // Find the recipe that matches this workflowId
                    if (recipeWithId.workflowId === payload.workflowId && recipe.steps && recipe.steps.length > 0) {
                      // Mark first step as active, rest as coming
                      const updatedSteps = recipe.steps.map((step, idx) => ({
                        ...step,
                        status: (idx === 0 ? 'active' : 'coming') as 'coming' | 'active' | 'done',
                      }));
                      return { ...recipe, steps: updatedSteps };
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

            console.log('[useChatSocket] First step marked as active for workflowId:', payload.workflowId);
          } else if (payload.status === 'error') {
            const errorMessage: ChatMessage = {
              type: 'status',
              sender: 'system',
              session_id: sessionId,
              content: `❌ Error starting recipe: ${payload.error || 'Unknown error'}`,
              timestamp,
            };
            setMessages(prev => {
              const newMessages = [...prev, errorMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });
            optionsRef.current.onError?.(`Failed to start recipe: ${payload.error || 'Unknown error'}`);
          }
          return;
        }

        // Handle text message from backend (both 'text' and 'text_message')
        if (message.type === 'response' && (message.messageType === 'text' || message.messageType === 'text_message') && message.payload) {
          const payload = message.payload as { message: string; conversationId: string | null };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.message) {
            console.log('[useChatSocket] Received text message from backend:', payload.message.substring(0, 50) + '...');
            
            // Create a chat message from the text response
            const chatMessage: ChatMessage = {
              type: 'message',
              sender: 'agent',
              session_id: sessionId,
              content: payload.message,
              timestamp,
            };

            console.log('[useChatSocket] About to add message to state:', chatMessage);

            // Add message to state
            setMessages(prev => {
              console.log('[useChatSocket] Current messages count:', prev.length);
              const newMessages = [...prev, chatMessage];
              console.log('[useChatSocket] New messages count:', newMessages.length);
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

            // Call the onMessage callback
            optionsRef.current.onMessage?.(chatMessage);
            
            // Stop loading indicator
            setIsLoading(false);
            console.log('[useChatSocket] Message added successfully, loading stopped');
          }
          return;
        }

        // Handle scheduled_task message from backend
        if (message.type === 'response' && message.messageType === 'scheduled_task' && message.payload) {
          const payload = message.payload as {
            sessionId: string;
            taskId: string;
            type: string;
            name: string;
            metadata?: {
              category?: string;
              priority?: string;
              checkPoints?: string[];
              detailedDescription?: string;
            };
            next?: string[];
            description?: string;
          };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          console.log('[useChatSocket] Scheduled task triggered:', payload.name, payload.taskId);

          // Create a rich message with the scheduled task information
          const taskMessage: ChatMessage = {
            type: 'message',
              sender: 'system',
              session_id: sessionId,
            content: `⏰ **${payload.name}**\n\n${payload.metadata?.detailedDescription || payload.description || 'Time to check on your cooking!'}`,
              timestamp,
            };

          // Add message to state
            setMessages(prev => {
            const newMessages = [...prev, taskMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

          // Call the onMessage callback
          optionsRef.current.onMessage?.(taskMessage);

          // Log check points if available
          if (payload.metadata?.checkPoints && payload.metadata.checkPoints.length > 0) {
            console.log('[useChatSocket] Check points for task:', payload.metadata.checkPoints);
          }

          // Log next tasks if available
          if (payload.next && payload.next.length > 0) {
            console.log('[useChatSocket] Next tasks after scheduled task:', payload.next);
          }

          return;
        }

        // Handle workflow_started message from backend
        if (message.type === 'response' && message.messageType === 'workflow_started' && message.payload) {
          const payload = message.payload as {
            event: string;
            workflowId: string | null;
            workflowName: string | null;
            recipeId: string | null;
            recipeName: string | null;
            startedAt: string | null;
            data: {
              name: string;
              slug: string;
              tags: string[];
              tasks: RecipeTask[];
              version: string;
              category: string;
              metadata?: {
                estimatedTime?: string;
                ingredientsList?: string[];
                equipmentNeeded?: string[];
                [key: string]: unknown;
              };
              endTaskId: string;
              description: string;
              dispatchUrl: string;
              startTaskId: string;
            };
          };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          console.log('[useChatSocket] Workflow started:', payload.data.name, 'Tasks:', payload.data.tasks.length);

          // Transform tasks to steps with status tracking
          const steps = payload.data.tasks.map((task: RecipeTask, index: number) => ({
            title: task.name,
            duration: task.metadata?.cookingTime || task.timerDuration || task.metadata?.timerDuration || '',
            icon: getStepImage(task.name, task.description, typeof task.metadata?.imageUrl === 'string' ? task.metadata.imageUrl : undefined),
            description: task.description,
            detailedDescription: task.metadata?.detailedDescription,
            taskId: task.taskId,
            status: (index === 0 ? 'active' : 'coming') as 'coming' | 'active' | 'done', // First step is active, rest are coming
          }));

          // Create recipe item from workflow data
          const recipeItem: RecipeItem & { workflowId?: string } = {
            title: payload.data.name,
            duration: payload.data.metadata?.estimatedTime || '',
            imageUrl: getDefaultRecipeImage(payload.data.name),
            introText: payload.data.description,
            ingredients: payload.data.metadata?.ingredientsList?.map((ingredient: string) => ({
              name: ingredient,
              quantity: '',
              imageUrl: getIngredientImage(ingredient),
            })) || [],
            utensils: payload.data.metadata?.equipmentNeeded?.map((equipment: string) => ({
              name: equipment,
              imageUrl: getUtensilImage(equipment),
            })) || [],
            steps,
            workflowId: payload.workflowId || undefined,
          };

          // Create a recipeList message with the started workflow
          const recipeListMessage: ChatMessage = {
            type: 'recipeList',
            sender: 'agent',
            session_id: sessionId,
            content: `Recipe workflow started: ${payload.data.name}`,
            timestamp,
            recipes: [recipeItem],
          };

          // Add to messages
          setMessages(prev => {
            const newMessages = [...prev, recipeListMessage];
            saveConversationMessages(sessionId, newMessages);
            return newMessages;
          });

          // Call the onMessage callback
          optionsRef.current.onMessage?.(recipeListMessage);

          console.log('[useChatSocket] Workflow started with', steps.length, 'steps, first step is active');
          return;
        }

        // Handle workflow_finished message from backend
        if (message.type === 'response' && message.messageType === 'workflow_finished' && message.payload) {
          const payload = message.payload as {
            event: string;
            workflowId: string | null;
            workflowName: string | null;
            finishedAt: string | null;
            status: string | null;
            summary: string | null;
            data: Record<string, unknown>;
          };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          console.log('[useChatSocket] Workflow finished:', payload.workflowName || payload.workflowId);

          // Find and update the recipe to mark all steps as done
          setMessages(prev => {
            const newMessages = prev.map(msg => {
              if (msg.type === 'recipeList' && msg.recipes) {
                const updatedRecipes = msg.recipes.map(recipe => {
                  if (recipe.steps) {
                    // Mark all steps as done
                    const updatedSteps = recipe.steps.map(step => ({
                      ...step,
                      status: 'done' as const,
                    }));
                    return { ...recipe, steps: updatedSteps };
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

          // Add a completion message
          const completionMessage: ChatMessage = {
              type: 'status',
              sender: 'system',
              session_id: sessionId,
            content: '🎉 Recipe completed! All steps are done.',
              timestamp,
            };

            setMessages(prev => {
            const newMessages = [...prev, completionMessage];
              saveConversationMessages(sessionId, newMessages);
              return newMessages;
            });

          optionsRef.current.onMessage?.(completionMessage);
          console.log('[useChatSocket] All steps marked as done');
          return;
        }

        // Handle task_done message from backend
        if (message.type === 'response' && message.messageType === 'task_done' && message.payload) {
          const payload = message.payload as TaskDonePayload;
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          if (payload.data && payload.status === 'success') {
            console.log('[useChatSocket] Task completed:', payload.taskId, 'Next tasks:', payload.data.nextTasks?.length || 0);

            // Update the recipe step status to 'done' and activate next step
            setMessages(prev => {
              const newMessages = prev.map(msg => {
                if (msg.type === 'recipeList' && msg.recipes) {
                  const updatedRecipes = msg.recipes.map(recipe => {
                    if (recipe.steps) {
                      // Find current step index
                      const currentStepIndex = recipe.steps.findIndex(step => step.taskId === payload.taskId);
                      
                      // Update steps: mark current as done, next as active
                      const updatedSteps = recipe.steps.map((step, idx) => {
                        if (step.taskId === payload.taskId) {
                          // Mark completed step as done
                          return { ...step, status: 'done' as const };
                        } else if (idx === currentStepIndex + 1) {
                          // Activate next step automatically
                          return { ...step, status: 'active' as const };
                        }
                        return step;
                      });
                      return { ...recipe, steps: updatedSteps };
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

            console.log('[useChatSocket] Step marked as done:', payload.taskId);
            
            // Log next tasks
            if (payload.data.nextTasks && payload.data.nextTasks.length > 0) {
              console.log('[useChatSocket] Next step automatically activated:', payload.data.nextTasks[0]?.name);
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

        // Handle next_task message from backend
        if (message.type === 'response' && message.messageType === 'next_task' && message.payload) {
          const payload = message.payload as {
            event: string;
            taskId: string;
            taskName: string | null;
            taskDescription: string | null;
            taskType: string | null;
            workflowId: string | null;
            stepNumber: number | null;
            totalSteps: number | null;
            data: RecipeTask;
          };

          console.log('[useChatSocket] Next task activated:', payload.taskId, payload.data?.name);

          // Update the recipe step status to 'active'
          setMessages(prev => {
            const newMessages = prev.map(msg => {
              if (msg.type === 'recipeList' && msg.recipes) {
                const updatedRecipes = msg.recipes.map(recipe => {
                  if (recipe.steps) {
                    // Find and mark the next step as active
                    const updatedSteps = recipe.steps.map(step => {
                      if (step.taskId === payload.taskId) {
                        return { ...step, status: 'active' as const };
                      }
                      return step;
                    });
                    return { ...recipe, steps: updatedSteps };
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

          console.log('[useChatSocket] Step marked as active:', payload.taskId);
          
          // Trigger auto-navigation callback for next_task
          if (optionsRef.current.onNextTaskActivated) {
            console.log('[useChatSocket] Triggering auto-navigation for next_task:', payload.taskId);
            optionsRef.current.onNextTaskActivated(payload.taskId);
          }
          
          return;
        }

        // Handle timed_task message from backend
        if (message.type === 'response' && message.messageType === 'timed_task' && message.payload) {
          const payload = message.payload as {
            event: string;
            taskId: string;
            taskName: string | null;
            taskDescription: string | null;
            workflowId: string | null;
            duration: string | null;
            durationUnit: string | null;
            startedAt: string | null;
            data: RecipeTask & {
              activated_at_utc?: string;
            };
          };
          const timestamp = message.metadata?.timestamp || new Date().toISOString();

          console.log('[useChatSocket] Timed task started:', payload.taskId, payload.data?.name, 'Duration:', payload.data?.timerDuration);

          // Keep step in 'coming' state but this signals a timer has started
          // The UI will handle the countdown timer display
          // Note: The step should already be in 'coming' state from workflow_started
          console.log('[useChatSocket] Timer activated for task:', payload.taskId, 'at', payload.data?.activated_at_utc || timestamp);
          return;
        }

        // Handle timer_done message from backend
        if (message.type === 'response' && message.messageType === 'timer_done' && message.payload) {
          const payload = message.payload as {
            event: string;
            taskId: string;
            taskName: string | null;
            workflowId: string | null;
            completedAt: string | null;
            elapsedTime: string | null;
            data: RecipeTask;
          };

          console.log('[useChatSocket] Timer done for task:', payload.taskId, payload.data?.name);

          // Update the recipe step status from 'coming' to 'active'
          setMessages(prev => {
            const newMessages = prev.map(msg => {
              if (msg.type === 'recipeList' && msg.recipes) {
                const updatedRecipes = msg.recipes.map(recipe => {
                  if (recipe.steps) {
                    // Find and mark the timed step as active (countdown is done)
                    const updatedSteps = recipe.steps.map(step => {
                      if (step.taskId === payload.taskId) {
                        return { ...step, status: 'active' as const };
                      }
                      return step;
                    });
                    return { ...recipe, steps: updatedSteps };
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

          console.log('[useChatSocket] Step transitioned from coming to active:', payload.taskId);
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
    if (!isConnected || !wsRef.current) {
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

      // Send message via WebSocket using sendtext action
      console.log('[useChatSocket] Sending text message:', content);
      const out = {
        action: 'sendtext' as const,
        payload: { message: content }
      };
      wsRef.current.sendJson(out);
      
      // Note: Response will arrive via WebSocket with messageType 'text'
      // The handleIncoming function will process it and set isLoading to false
    } catch (err) {
      const errorMessage = 'Error sending message';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      setIsLoading(false);
      console.error('[useChatSocket] Error sending text message:', err);
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

  const startRecipe = useCallback((workflowId: string) => {
    if (!isConnected || !wsRef.current) {
      setError('No active connection');
      console.warn('[useChatSocket] Cannot start recipe - WebSocket not connected');
      return;
    }

    try {
      console.log('[useChatSocket] Starting recipe for workflowId:', workflowId);
      const out = {
        action: 'startrecipe' as const,
        payload: { workflowId }
      };
      wsRef.current.sendJson(out);
    } catch (err) {
      const errorMessage = 'Error starting recipe';
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
      console.error('[useChatSocket] Error sending startrecipe:', err);
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
    startRecipe,
    taskDone,
    clearMessages,
  };
};