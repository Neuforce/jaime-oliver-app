import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString();

    console.log(`Created new session: ${sessionId}`);

    return NextResponse.json({ 
      success: true, 
      session_id: sessionId,
      created_at: timestamp,
      message: 'Session created successfully' 
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
