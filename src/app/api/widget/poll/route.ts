import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';
import { popPendingMessage } from '@/services/redis-service';

/**
 * GET /api/widget/poll?conversationId=xxx
 * Poll for pending messages and remove them from the queue
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: StatusCodes.BAD_REQUEST, headers: corsHeaders }
      );
    }

    // Pop message from queue (removes it from Redis)
    const messageData = await popPendingMessage(conversationId);

    return NextResponse.json(
      { success: true, data: messageData },
      { status: StatusCodes.OK, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Poll endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to poll messages' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: StatusCodes.OK,
    headers: corsHeaders,
  });
}
