import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => {
  return uuidv4();
};

export const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  // Always generate a new session ID for new conversations
  return generateSessionId();
};

export const getCurrentSessionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('chat_session_id');
};

export const setCurrentSessionId = (sessionId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chat_session_id', sessionId);
  }
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chat_session_id');
  }
};

export const createNewSession = (): string => {
  const newSessionId = generateSessionId();
  setCurrentSessionId(newSessionId);
  return newSessionId;
};
