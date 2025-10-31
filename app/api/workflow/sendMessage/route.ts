import { NextRequest, NextResponse } from 'next/server';
import { WorkflowMessagePayload } from '../../../../types/chatHistory';
import { getMockExternalBackend } from '../../../../lib/mockExternalBackend';
import { sendToSession } from '../../../../lib/wsHelpers';

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowMessagePayload = await request.json();
    const { session_id, message } = body;

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    console.log(`[Workflow] Received message for session ${session_id}:`, message);

    // Get the external backend WebSocket client
    const mockBackend = getMockExternalBackend();

    // Send message to external backend via WebSocket
    const externalResponse = await mockBackend.sendMessage(session_id, message);

    console.log(`[Workflow] Received response from external backend:`, externalResponse);

    // Push the response back to the frontend via WebSocket
    const pushSuccess = sendToSession(session_id, {
      type: 'message',
      sender: 'agent',
      session_id,
      content: externalResponse.content || '',
      timestamp: new Date().toISOString(),
    });

    if (!pushSuccess) {
      console.warn(`[Workflow] Failed to push response to session ${session_id}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message processed and sent to external backend via WebSocket',
      response: externalResponse
    });

  } catch (error) {
    console.error('[Workflow] Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
