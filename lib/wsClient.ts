/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

type Listener = (...args: any[]) => void;

type Events = 'open' | 'close' | 'message' | 'error';

export type OutgoingMessage = {
  action: 'sendtext' | 'sendvoice' | 'getrecipes' | 'getrecipe';
  payload: any;
};

type Options = {
  endpoint: string;
  token?: string; // Made optional for jamie-oliver-app compatibility
  sessionId: string;
};

type SendOptions = { retry?: number };

export class WsClient {
  private options: Options;
  private ws: WebSocket | null = null;
  private listeners: Record<Events, Listener[]> = { open: [], close: [], message: [], error: [] };
  private heartbeatInterval: any = null;
  private reconnectTimer: any = null;
  private retryCount = 0;
  private readonly maxRetry = 8;
  private outgoingQueue: string[] = [];
  private readonly maxQueue = 200;
  private lastActivityTs = 0;
  private disposed = false; // Track if client has been disposed

  constructor(options: Options) {
    this.options = options;
  }

  on(event: Events, fn: Listener) {
    this.listeners[event].push(fn);
  }

  private emit(event: Events, ...args: any[]) {
    for (const fn of this.listeners[event]) {
      try {
        fn(...args);
      } catch {
        // ignore listener errors
      }
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  isDisposed(): boolean {
    return this.disposed;
  }

  connect() {
    // Don't connect if disposed
    if (this.disposed) {
      console.log('[WsClient] Cannot connect - client has been disposed');
      return;
    }
    
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const url = new URL(this.options.endpoint);
    
    // Add token if provided (required for AWS API Gateway WebSocket)
    if (this.options.token) {
      url.searchParams.set('token', this.options.token);
    }
    
    // AWS API Gateway WebSocket expects 'sessionId' (not 'session_id')
    // This matches the backend handler which looks for 'sessionId' in query params
    url.searchParams.set('sessionId', this.options.sessionId);
    
    const finalUrl = url.toString();
    console.log('[WsClient] Connecting to:', finalUrl.replace(this.options.token || '', 'TOKEN_HIDDEN'));
    const ws = new WebSocket(finalUrl);
    this.ws = ws;

    ws.onopen = () => {
      this.retryCount = 0;
      this.emit('open');
      // flush queue
      while (this.outgoingQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(this.outgoingQueue.shift()!);
      }
      // Do NOT send custom JSON heartbeat frames; rely on server/network timeouts
    };

    ws.onclose = (ev) => {
      const closeInfo = {
        code: ev.code,
        reason: ev.reason || 'No reason provided',
        wasClean: ev.wasClean
      };
      console.log('[WsClient] Connection closed:', closeInfo);
      
      // Common WebSocket close codes
      const closeReasons: Record<number, string> = {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1006: 'Abnormal closure (no close frame) - likely auth failure or network issue',
        1007: 'Invalid frame payload data',
        1008: 'Policy violation',
        1009: 'Message too big',
        1011: 'Internal server error',
        1015: 'TLS handshake failure'
      };
      
      const explanation = closeReasons[ev.code] || 'Unknown';
      console.log(`[WsClient] Close code ${ev.code}: ${explanation}`);
      
      this.emit('close', ev.code, ev.reason);
      this.scheduleReconnect();
    };

    ws.onerror = (err: Event) => {
      // Extract meaningful error information
      const errorDetails = {
        type: err.type,
        target: (err.target as WebSocket)?.url || 'unknown',
        readyState: (err.target as WebSocket)?.readyState,
        timestamp: new Date().toISOString()
      };
      console.error('[WsClient] WebSocket error:', errorDetails);
      this.emit('error', JSON.stringify(errorDetails, null, 2));
    };

    ws.onmessage = (ev) => {
      this.lastActivityTs = Date.now();
      if (typeof ev.data === 'string') {
        this.emit('message', ev.data);
      } else {
        this.emit('message', ev.data);
      }
    };
  }

  private scheduleReconnect() {
    // Don't reconnect if disposed
    if (this.disposed) {
      console.log('[WsClient] Skipping reconnect - client has been disposed');
      return;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.retryCount >= this.maxRetry) {
      console.log('[WsClient] Max retry attempts reached, not reconnecting');
      return;
    }
    const delay = Math.min(16000, 1000 * Math.pow(2, this.retryCount));
    this.retryCount += 1;
    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    console.log(`[WsClient] Scheduling reconnect attempt ${this.retryCount}/${this.maxRetry} in ${delay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  async sendJson(message: OutgoingMessage, options?: SendOptions) {
    const payload = JSON.stringify(message);
    const attempt = async (): Promise<void> => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        // queue it
        this.outgoingQueue.push(payload);
        if (this.outgoingQueue.length > this.maxQueue) {
          // drop oldest
          this.outgoingQueue.shift();
        }
        return;
      }
      this.ws.send(payload);
    };
    const retries = options?.retry ?? 0;
    for (let i = 0; i <= retries; i++) {
      try {
        await attempt();
        return;
      } catch {
        if (i === retries) throw new Error('send failed after retries');
        await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
      }
    }
  }

  dispose() {
    console.log('[WsClient] Disposing client...');
    this.disposed = true; // Mark as disposed to prevent reconnection
    
    try {
      // Clear all timers
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Close WebSocket connection
      if (this.ws) {
        // Remove event listeners to prevent reconnect on close
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.onopen = null;
        
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Client disposed'); // Normal closure
        }
      }
    } catch (e) {
      console.error('[WsClient] Error during dispose:', e);
    } finally {
      this.ws = null;
      this.outgoingQueue = [];
      console.log('[WsClient] Client disposed successfully');
    }
  }
}

