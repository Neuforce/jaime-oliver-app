/**
 * Mock External Backend via WebSocket
 * 
 * This simulates a WebSocket connection to an external backend system.
 * In production, this would connect to a real WebSocket server.
 */

export interface ExternalMessage {
  type: 'message' | 'response' | 'error' | 'status';
  session_id: string;
  content?: string;
  metadata?: any;
}

export class MockExternalBackend {
  private ws: WebSocket | null = null;
  private messageQueue: ExternalMessage[] = [];
  private responseHandlers: Map<string, (message: ExternalMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  
  // Mock WebSocket URL - in production this would be a real URL
  private readonly mockUrl = process.env.EXTERNAL_BACKEND_WS_URL || 'ws://mock-backend:8080';

  /**
   * Connect to external backend WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[MockExternalBackend] Attempting to connect to ${this.mockUrl}...`);
        
        // Simulate WebSocket connection
        // In a real implementation, we would use:
        // this.ws = new WebSocket(this.mockUrl);
        
        // For now, we'll simulate the connection
        setTimeout(() => {
          console.log('[MockExternalBackend] Connected successfully (simulated)');
          this.reconnectAttempts = 0;
          this.ws = {} as WebSocket; // Dummy object to indicate "connected"
          
          // Process any queued messages
          this.processMessageQueue();
          resolve();
        }, 500);
      } catch (error) {
        console.error('[MockExternalBackend] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Send message to external backend
   */
  async sendMessage(sessionId: string, message: string): Promise<ExternalMessage> {
    return new Promise((resolve, reject) => {
      const externalMessage: ExternalMessage = {
        type: 'message',
        session_id: sessionId,
        content: message,
      };

      // If not connected, queue the message
      if (!this.ws) {
        console.log('[MockExternalBackend] Not connected, queuing message...');
        this.messageQueue.push(externalMessage);
        this.connect().then(() => resolve(this.getMockResponse(sessionId, message))).catch(reject);
        return;
      }

      console.log(`[MockExternalBackend] Sending message to backend:`, externalMessage);
      
      // Simulate sending and receiving response
      setTimeout(() => {
        const response = this.getMockResponse(sessionId, message);
        console.log(`[MockExternalBackend] Received response from backend:`, response);
        
        // Call the registered handler if exists
        const handler = this.responseHandlers.get(sessionId);
        if (handler) {
          handler(response);
        }
        
        resolve(response);
      }, 1000 + Math.random() * 2000); // Simulate network delay
    });
  }

  /**
   * Register a handler for responses from external backend
   */
  onResponse(sessionId: string, handler: (message: ExternalMessage) => void) {
    this.responseHandlers.set(sessionId, handler);
  }

  /**
   * Unregister response handler
   */
  offResponse(sessionId: string) {
    this.responseHandlers.delete(sessionId);
  }

  /**
   * Generate mock response from external backend
   */
  private getMockResponse(sessionId: string, userMessage: string): ExternalMessage {
    // Simulate intelligent responses based on message content
    const lowerMessage = userMessage.toLowerCase();
    
    // Health-related responses
    if (lowerMessage.includes('health') || lowerMessage.includes('food') || lowerMessage.includes('diet')) {
      return {
        type: 'response',
        session_id: sessionId,
        content: "Great question about nutrition! A balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains is essential. Remember to stay hydrated and enjoy everything in moderation. Would you like recipe suggestions?",
        metadata: { category: 'nutrition' }
      };
    }

    // Recipe-related responses
    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook') || lowerMessage.includes('make')) {
      return {
        type: 'response',
        session_id: sessionId,
        content: "I'd love to help you with cooking! What dish are you interested in making? I can share tips, techniques, and personal recommendations for ingredients and preparation methods.",
        metadata: { category: 'recipes' }
      };
    }

    // Quick questions
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return {
        type: 'response',
        session_id: sessionId,
        content: "Hello! I'm here to help you with cooking, nutrition, and healthy eating. What would you like to know?",
        metadata: { category: 'greeting' }
      };
    }

    // Default intelligent response
    return {
      type: 'response',
      session_id: sessionId,
      content: `Thanks for your message: "${userMessage}". I'm processing this and would love to help you further. Could you provide a bit more context about what specifically you'd like to know?`,
      metadata: { category: 'general' }
    };
  }

  /**
   * Process queued messages after connection
   */
  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message.session_id, message.content || '')
          .catch(err => console.error('[MockExternalBackend] Error processing queued message:', err));
      }
    }
  }

  /**
   * Disconnect from external backend
   */
  disconnect() {
    console.log('[MockExternalBackend] Disconnecting...');
    if (this.ws) {
      // In real implementation: this.ws.close();
      this.ws = null;
    }
    this.responseHandlers.clear();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null;
  }
}

// Singleton instance
let mockBackendInstance: MockExternalBackend | null = null;

export function getMockExternalBackend(): MockExternalBackend {
  if (!mockBackendInstance) {
    mockBackendInstance = new MockExternalBackend();
    // Auto-connect on first use
    mockBackendInstance.connect().catch(err => {
      console.error('[MockExternalBackend] Failed to auto-connect:', err);
    });
  }
  return mockBackendInstance;
}
