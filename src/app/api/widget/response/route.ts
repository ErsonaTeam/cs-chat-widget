'use server';
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';
import { processWidgetResponse, type WidgetResponseData } from '@/app/actions/widget-response-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { companyId, conversationId, message, timestamp, error, roomOptions, hotelOptions, roomSearchResults } = body;

    // Prepare data for server action
    const responseData: WidgetResponseData = {
      companyId,
      conversationId,
      message,
      timestamp,
      error,
      roomOptions,
      hotelOptions,
      roomSearchResults,
    };

    // Process the response using server action
    const result = await processWidgetResponse(responseData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: StatusCodes.INTERNAL_SERVER_ERROR, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: result.timestamp,
    }, { status: StatusCodes.OK, headers: corsHeaders });
    
  } catch (error) {
    console.error('Error processing widget response:', error);
    return NextResponse.json(
      { error: 'Failed to process response' },
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