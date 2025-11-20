import { v4 as uuidv4 } from 'uuid';

// Unified session ID key (same as useSessionId hook)
const SESSION_ID_KEY = 'jamie_session_id';

/**
 * Generate a new UUID v4 session ID.
 * Uses crypto.randomUUID() if available (browser), otherwise falls back to uuid library.
 */
export const generateSessionId = (): string => {
  // Prefer native crypto.randomUUID() if available (browser)
  if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback to uuid library (server-side or older browsers)
  return uuidv4();
};

/**
 * Get current session ID from localStorage.
 * Returns null if not found.
 */
export const getCurrentSessionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SESSION_ID_KEY);
};

/**
 * Set session ID in localStorage.
 */
export const setCurrentSessionId = (sessionId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
};

/**
 * Clear session ID from localStorage.
 */
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
};

/**
 * Create a new session ID and save it to localStorage.
 * Returns the new session ID.
 */
export const createNewSession = (): string => {
  const newSessionId = generateSessionId();
  setCurrentSessionId(newSessionId);
  return newSessionId;
};

/**
 * Get or create a session ID.
 * If one exists in localStorage, returns it.
 * Otherwise, creates a new one and saves it.
 * 
 * CRITICAL: Always returns a valid UUID, even during SSR.
 * During SSR, generates a UUID but doesn't save to localStorage (will be saved on client hydration).
 */
export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') {
    // SSR: Generate a temporary UUID (will be replaced with localStorage value on hydration)
    return generateSessionId();
  }

  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  // Client: Generate new UUID and persist to localStorage
  const newSessionId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  console.log('[session] Created new session ID:', newSessionId.slice(0, 8) + '...');
  return newSessionId;
};
