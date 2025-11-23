'use server';
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';
import { processWidgetMessage, type WidgetMessageData } from '@/app/actions/widget-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(JSON.stringify(body));

    const { companyId, conversationId, message, userName, timestamp, meta } = body;
    
    // Prepare data for server action
    const widgetData: WidgetMessageData = {
      companyId,
      conversationId,
      message,
      userName,
      timestamp: timestamp || new Date().toISOString(),
      meta,
    };

    // Process the message using server action
    const result = await processWidgetMessage(widgetData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: StatusCodes.BAD_REQUEST, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: result.timestamp,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error processing widget message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
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
