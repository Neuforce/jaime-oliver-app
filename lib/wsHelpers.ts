import { ChatMessage, WebSocketMessage } from '../types/chat';

// Store active connections by session ID
export const wsConnections = new Map<string, WebSocket>();

// Function to send message to specific session
export function sendToSession(sessionId: string, message: ChatMessage) {
  const ws = wsConnections.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    const wsMessage: WebSocketMessage = {
      type: 'message',
      data: message,
    };
    ws.send(JSON.stringify(wsMessage));
    return true;
  }
  return false;
}

// Function to broadcast to all sessions
export function broadcastToAll(message: ChatMessage) {
  let sentCount = 0;
  wsConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: 'message',
        data: message,
      };
      ws.send(JSON.stringify(wsMessage));
      sentCount++;
    }
  });
  return sentCount;
}

