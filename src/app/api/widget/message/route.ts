import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';
import { getMessageData } from '@/services/redis-service';

/**
 * GET /api/widget/message?key=xxx
 * Retrieve message data from Redis using the provided key
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageKey = searchParams.get('key');

    if (!messageKey) {
      return NextResponse.json(
        { error: 'Message key is required' },
        { status: StatusCodes.BAD_REQUEST, headers: corsHeaders }
      );
    }

    // Retrieve message data from Redis
    const messageData = await getMessageData(messageKey);

    if (!messageData) {
      return NextResponse.json(
        { error: 'Message not found or expired' },
        { status: StatusCodes.NOT_FOUND, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: messageData,
    }, { status: StatusCodes.OK, headers: corsHeaders });

  } catch (error) {
    console.error('Error retrieving message from Redis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve message' },
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
