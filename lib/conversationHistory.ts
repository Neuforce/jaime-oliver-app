import { Conversation, ConversationHistory } from '../types/conversation';
import { ChatMessage } from '../types/chat';

const STORAGE_KEY = 'jamie-oliver-conversations';

export const saveConversation = (conversationId: string, messages: ChatMessage[]) => {
  try {
    const existing = getConversationHistory();
    const conversation = existing.conversations.find(c => c.id === conversationId);
    
    const lastMessage = messages[messages.length - 1];
    const title = messages.length > 0 ? 
      (messages[0].content.length > 30 ? 
        messages[0].content.substring(0, 30) + '...' : 
        messages[0].content) : 
      'New Conversation';
    
    const conversationData: Conversation = {
      id: conversationId,
      title,
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.timestamp || new Date().toISOString(),
      messageCount: messages.length,
      createdAt: conversation?.createdAt || new Date().toISOString(),
    };

    const updatedConversations = existing.conversations.filter(c => c.id !== conversationId);
    updatedConversations.push(conversationData);
    
    // Sort by last message time (newest first)
    updatedConversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    const updatedHistory: ConversationHistory = {
      ...existing,
      conversations: updatedConversations,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

export const getConversationHistory = (): ConversationHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading conversation history:', error);
  }
  
  return {
    conversations: [],
  };
};

export const getConversationMessages = (conversationId: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${conversationId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading conversation messages:', error);
  }
  
  return [];
};

export const saveConversationMessages = (conversationId: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${conversationId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving conversation messages:', error);
  }
};

export const deleteConversation = (conversationId: string) => {
  try {
    const existing = getConversationHistory();
    const updatedConversations = existing.conversations.filter(c => c.id !== conversationId);
    
    const updatedHistory: ConversationHistory = {
      ...existing,
      conversations: updatedConversations,
      currentConversationId: existing.currentConversationId === conversationId ? undefined : existing.currentConversationId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    localStorage.removeItem(`${STORAGE_KEY}-${conversationId}`);
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
};

export const setCurrentConversation = (conversationId: string) => {
  try {
    const existing = getConversationHistory();
    const updatedHistory: ConversationHistory = {
      ...existing,
      currentConversationId: conversationId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error setting current conversation:', error);
  }
};
