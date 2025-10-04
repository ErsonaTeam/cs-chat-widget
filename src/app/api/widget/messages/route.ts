'use server';
import { NextRequest, NextResponse } from 'next/server';
import PusherServer from 'pusher';
import { corsHeaders } from '@/utils/cors';

// Initialize Pusher server instance
const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { companyId, conversationId, message, userName, timestamp, meta } = body;
    
    // Validate required fields
    if (!companyId || !conversationId || !message || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, conversationId, message, userName' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Send message to embeddings-encoder service for AI processing
    // The response will come back asynchronously via the /api/widget/response endpoint
    try {      
      const embeddings_service_url = process.env.EMBEDDINGS_SERVICE_URL || 'https://dev-embeddings.ersona.co';
      
      const aiResponse = await fetch(`${embeddings_service_url}/widget/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // ToDo: decide with Yair if its necessary or not
        //   'Authorization': `Bearer ${process.env.EMBEDDINGS_SERVICE_API_KEY || ''}`,
        },
        body: JSON.stringify({
          companyId,
          conversationId,
          message,
          userName,
          timestamp,
          meta,
        }),
      });

      if (!aiResponse.ok) {
        console.error('Widget API - Failed to send to embeddings service:', aiResponse.status, aiResponse.statusText);
        throw new Error(`Embeddings service responded with ${aiResponse.status}`);
      }      
    } catch (embeddingsError) {
      console.error('Widget API - Error sending to embeddings service:', embeddingsError);
      
    // Send fallback error message via Pusher
      const channel = `c-${companyId}-${conversationId}`;
      
      try {
        await pusherServer.trigger(channel, 'agent.message', {
          conversationId,
          message: "I'm sorry, I'm having trouble processing your message right now. Please try again later.",
          timestamp: new Date().toISOString(),
        });
      } catch (pusherError) {
        console.error('Widget API - Pusher error for fallback message:', pusherError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent to AI service for processing',
      timestamp: new Date().toISOString(),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error processing widget message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
