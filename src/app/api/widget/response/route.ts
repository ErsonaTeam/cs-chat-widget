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
    
    const { companyId, conversationId, message, timestamp, error } = body;
    
    // Validate required fields
    if (!companyId || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, conversationId' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ToDo: decide with Yair if its necessary or not
    // // Validate API key/authorization if needed
    // const authHeader = request.headers.get('authorization');
    // const expectedApiKey = process.env.EMBEDDINGS_SERVICE_API_KEY;
    
    // if (expectedApiKey && authHeader !== `Bearer ${expectedApiKey}`) {
    //   console.error('Widget Response API - Invalid or missing authorization');
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401, headers: corsHeaders }
    //   );
    // }

    // Determine the message to send
    let responseMessage: string;
    if (error) {
      console.error('Widget Response API - Error from embeddings service:', error);
      responseMessage = "I'm sorry, I encountered an error while processing your message. Please try again.";
    } else if (!message) {
      console.error('Widget Response API - No message in response from embeddings service');
      responseMessage = "I'm sorry, I didn't receive a proper response. Please try again.";
    } else {
      responseMessage = message;
    }

    // Send agent response via Pusher
    const channel = `c-${companyId}-${conversationId}`;
    
    try {
      await pusherServer.trigger(channel, 'agent.message', {
        conversationId,
        message: responseMessage,
        timestamp: timestamp || new Date().toISOString(),
      });
    } catch (pusherError) {
      console.error('Widget Response API - Pusher error:', pusherError);
      return NextResponse.json(
        { error: 'Failed to send response to client' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Response delivered to client',
      timestamp: new Date().toISOString(),
    }, { status: 200, headers: corsHeaders });
    
  } catch (error) {
    console.error('Error processing widget response:', error);
    return NextResponse.json(
      { error: 'Failed to process response' },
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
