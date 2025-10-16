import { NextRequest } from 'next/server';
import { ChatMessage, WebSocketMessage } from '../../../types/chat';

// Store active connections by session ID
const connections = new Map<string, WebSocket>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return new Response('Session ID required', { status: 400 });
  }

  // Return WebSocket upgrade headers
  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': 'dummy', // This would be calculated properly in a real implementation
    },
  });
}

// Function to send message to specific session
export function sendToSession(sessionId: string, message: ChatMessage) {
  const ws = connections.get(sessionId);
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
  connections.forEach((ws, sessionId) => {
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