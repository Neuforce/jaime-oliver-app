'use client';

import * as React from 'react';

const KEY = 'jamie_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const existing = localStorage.getItem(KEY);
  if (existing) {
    return existing;
  }
  
  const created = crypto.randomUUID();
  localStorage.setItem(KEY, created);
  return created;
}

export function useSessionId(): string {
  const [id, setId] = React.useState<string>(() => getOrCreateSessionId());
  
  React.useEffect(() => {
    // Ensure we have a session ID after mount (for SSR safety)
    if (!id) {
      const sessionId = getOrCreateSessionId();
      setId(sessionId);
    }
  }, [id]);
  
  return id;
}

