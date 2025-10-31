export interface RecipeStep {
  title: string;
  duration: string; // e.g. '20:00 min', '4:00 min'
  icon?: string; // URL for step icon image
}

export interface RecipeItem {
  title: string;
  duration: string; // e.g. '1 hr', '15 min'
  imageUrl: string;
  videoUrl?: string;
  steps?: RecipeStep[];
  introText?: string;
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

export interface WebSocketMessage {
  type: 'message' | 'system' | 'status' | 'error';
  data: ChatMessage | WorkflowMessagePayload | PushMessagePayload;
}

export interface ChatSession {
  id: string;
  created_at: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'closed';
}
