import { NextRequest, NextResponse } from 'next/server';
import { PushMessagePayload } from '../../../../types/chat';
import { sendToSession } from '../../../../lib/wsHelpers';

export async function POST(request: NextRequest) {
  try {
    const body: PushMessagePayload = await request.json();
    const { session_id, sender, content, timestamp } = body;

    if (!session_id || !sender || !content || !timestamp) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log(`Pushing message to session ${session_id}:`, content);

    // Send message through WebSocket
    const success = sendToSession(session_id, {
      type: 'message',
      sender,
      session_id,
      content,
      timestamp,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send message to client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent to client' 
    });

  } catch (error) {
    console.error('Error pushing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
