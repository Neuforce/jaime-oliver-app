export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  status: 'active' | 'archived' | 'deleted';
}

export interface ChatHistory {
  sessions: ChatSession[];
  currentSessionId?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  sessionId: string;
}

export interface SearchResult {
  sessionId: string;
  sessionTitle: string;
  messageId: string;
  messageContent: string;
  messageType: 'user' | 'agent' | 'system';
  timestamp: string;
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
