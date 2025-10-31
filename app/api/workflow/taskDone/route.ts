import { NextRequest, NextResponse } from 'next/server';
import { WorkflowMessagePayload } from '../../../../types/chat';
import { sendToSession } from '../../../../lib/wsHelpers';

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowMessagePayload = await request.json();
    const { session_id, task_id, status } = body;

    if (!session_id || !task_id || !status) {
      return NextResponse.json(
        { error: 'Session ID, task ID, and status are required' },
        { status: 400 }
      );
    }

    console.log(`Task ${task_id} status update for session ${session_id}:`, status);

    // Send status update through WebSocket
    const statusMessage = getStatusMessage(task_id, status);
    const success = sendToSession(session_id, {
      type: 'status',
      sender: 'system',
      session_id,
      content: statusMessage,
      timestamp: new Date().toISOString(),
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send status update to client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Status update sent to client' 
    });

  } catch (error) {
    console.error('Error processing task status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStatusMessage(taskId: string, status: string): string {
  switch (status) {
    case 'done':
      return `✅ Task ${taskId} completed successfully`;
    case 'pending':
      return `⏳ Task ${taskId} in progress...`;
    case 'error':
      return `❌ Error in task ${taskId}`;
    default:
      return `📋 Task ${taskId} status: ${status}`;
  }
}
