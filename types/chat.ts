export interface RecipeStep {
  title: string;
  duration: string; // e.g. '20:00 min', '4:00 min'
  icon?: string; // URL for step icon image
  description?: string; // Short description from task.description
  detailedDescription?: string; // Full markdown description from task.metadata.detailedDescription
}

export interface Ingredient {
  name: string;
  quantity: string;
  imageUrl: string;
}

export interface Utensil {
  name: string;
  imageUrl: string;
}

export interface RecipeItem {
  title: string;
  duration: string; // e.g. '1 hr', '15 min'
  imageUrl: string;
  videoUrl?: string;
  steps?: RecipeStep[];
  introText?: string;
  ingredients?: Ingredient[];
  utensils?: Utensil[];
}

export interface ChatMessage {
  type: 'message' | 'system' | 'status' | 'video' | 'audio' | 'recipeList';
  sender: 'user' | 'agent' | 'system';
  session_id: string;
  content: string;
  timestamp: string;
  videoUrl?: string;
  videoTitle?: string;
  videoThumbnail?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioDuration?: number;
  recipes?: RecipeItem[];
}

export interface WorkflowMessagePayload {
  session_id: string;
  message?: string;
  task_id?: string;
  status?: 'done' | 'pending' | 'error';
}

export interface PushMessagePayload {
  session_id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface RecipeWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface RecipeTask {
  name: string;
  next?: string[];
  type: 'immediate' | 'timed';
  taskId: string;
  metadata?: {
    category?: string;
    priority?: string;
    detailedDescription?: string;
    cookingTime?: string;
    timerDuration?: string;
    [key: string]: any;
  };
  description: string;
  timerDuration?: string;
}

export interface RecipeDefinition {
  name: string;
  slug: string;
  tags: string[];
  tasks: RecipeTask[];
  version: string;
  category: string;
  metadata?: {
    imageUrl?: string;
    servings?: number;
    estimatedTime?: string;
    difficultyLevel?: string;
    equipmentNeeded?: string[];
    ingredientsList?: string[];
    vegetarianOption?: string;
    [key: string]: any;
  };
}

export interface RecipeDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  definition?: RecipeDefinition;
  createdAt: string;
  updatedAt?: string;
}

export interface RecipeDetailPayload {
  recipe: RecipeDetail;
  workflowId: string;
}

export interface RecipesListPayload {
  recipes: {
    workflows: RecipeWorkflow[];
    count: number;
  };
}

export interface WebSocketMessage {
  type: 'message' | 'system' | 'status' | 'error' | 'response';
  messageType?: 'recipes_list' | 'recipe_detail' | 'recipe_started' | 'task_done' | 'text_message' | 'text';
  payload?: RecipesListPayload | any;
  messageId?: string;
  metadata?: {
    timestamp?: string;
    source?: string;
  };
  data?: ChatMessage | WorkflowMessagePayload | PushMessagePayload;
}

export interface ChatSession {
  id: string;
  created_at: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'closed';
}
