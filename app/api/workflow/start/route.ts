import { NextRequest, NextResponse } from 'next/server';
import { WorkflowMessagePayload } from '../../../../types/chat';
import { sendToSession } from '../../ws/route';

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowMessagePayload = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`Starting workflow for session: ${session_id}`);

    // Send workflow start notification through WebSocket
    const success = sendToSession(session_id, {
      type: 'system',
      sender: 'system',
      session_id,
      content: '🚀 Workflow started. System ready to process messages.',
      timestamp: new Date().toISOString(),
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send start notification to client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Workflow started successfully' 
    });

  } catch (error) {
    console.error('Error starting workflow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
