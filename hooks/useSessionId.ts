'use client';

import * as React from 'react';
import { getOrCreateSessionId } from '../lib/session';

/**
 * React hook that provides a persistent session ID.
 * Uses the unified session management from lib/session.ts.
 * 
 * The session ID is:
 * - Generated as UUID v4 (using crypto.randomUUID() or uuid library)
 * - Stored in localStorage with key 'jamie_session_id'
 * - Reused across page reloads
 * - Created automatically if it doesn't exist
 * - ALWAYS available (never returns empty string)
 */
export function useSessionId(): string {
  const [id, setId] = React.useState<string>(() => {
    // CRITICAL: Always generate a valid session ID immediately
    // Even during SSR, we'll generate one (won't be saved to localStorage until client hydration)
    return getOrCreateSessionId();
  });
  
  React.useEffect(() => {
    // Ensure we have a session ID after mount (for SSR safety)
    // This will handle the case where SSR generated a temporary ID
    // and we need to either retrieve the real one from localStorage or persist the generated one
    if (typeof window !== 'undefined') {
      const sessionId = getOrCreateSessionId();
      if (sessionId !== id) {
        console.log('[useSessionId] Syncing session ID after mount:', sessionId.slice(0, 8) + '...');
        setId(sessionId);
      }
    }
  }, []); // Only run once on mount
  
  return id;
}

