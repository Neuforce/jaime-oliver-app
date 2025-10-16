export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  createdAt: string;
}

export interface ConversationHistory {
  conversations: Conversation[];
  currentConversationId?: string;
}
