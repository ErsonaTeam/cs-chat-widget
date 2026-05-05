import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { widgetId, conversationId, signature, quantity } = body;

    // Validate required fields
    if (!widgetId || !conversationId || !signature || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: widgetId, conversationId, signature, quantity' },
        { status: StatusCodes.BAD_REQUEST, headers: corsHeaders }
      );
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a number greater than 0' },
        { status: StatusCodes.BAD_REQUEST, headers: corsHeaders }
      );
    }

    // Get embeddings service URL
    const embeddingsServiceUrl = process.env.EMBEDDINGS_SERVICE_URL;
    if (!embeddingsServiceUrl) {
      console.error('EMBEDDINGS_SERVICE_URL not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: StatusCodes.INTERNAL_SERVER_ERROR, headers: corsHeaders }
      );
    }

    // Call the encoder checkout endpoint
    const checkoutUrl = `${embeddingsServiceUrl}/widget/checkout`;
    console.log('Calling checkout endpoint:', checkoutUrl);
    console.log('Request body:', {
      sessionId: conversationId,
      widgetId,
      signature,
      quantity
    });

    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: conversationId,
        widgetId,
        signature,
        quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Checkout endpoint error:', response.status, errorData);

      return NextResponse.json(
        {
          error: errorData.message || 'Failed to create checkout',
          details: errorData
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();
    console.log('Checkout response:', data);

    return NextResponse.json({
      success: true,
      checkoutLink: data.checkoutLink,
    }, { status: StatusCodes.OK, headers: corsHeaders });

  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
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
