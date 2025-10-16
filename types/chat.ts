export interface ChatMessage {
  type: 'message' | 'system' | 'status' | 'video' | 'audio';
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
