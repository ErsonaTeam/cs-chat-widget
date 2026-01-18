'use server';

import { sendPusherMessage } from '@/services/pusher-service';
import { type WidgetActionResult } from './widget-actions';
import { RoomOption, FattalHotel, FattalRoom } from '@/types/message-types';

export interface WidgetResponseData {
  companyId: string;
  conversationId: string;
  message?: string;
  timestamp?: string;
  error?: string;
  roomOptions?: RoomOption[];
  hotelOptions?: FattalHotel[];
  roomSearchResults?: FattalRoom[];
}

export async function processWidgetResponse(data: WidgetResponseData): Promise<WidgetActionResult> {
  const { companyId, conversationId, message, timestamp, error, roomOptions, hotelOptions, roomSearchResults } = data;

  if (!companyId || !conversationId) {
    return {
      success: false,
      error: 'Missing required fields: companyId, conversationId',
      timestamp: new Date().toISOString(),
    };
  }

  // Determine the message to send
  let responseMessage: string;
  if (error) {
    console.error('Widget Response Actions - Error from embeddings service:', error);
    responseMessage = "I'm sorry, I encountered an error while processing your message. Please try again.";
  } else if (!message) {
    console.error('Widget Response Actions - No message in response from embeddings service');
    responseMessage = "I'm sorry, I didn't receive a proper response. Please try again.";
  } else {
    responseMessage = message;
  }

  try {
    await sendPusherMessage(companyId, conversationId, responseMessage, timestamp, roomOptions, hotelOptions, roomSearchResults);

    return {
      success: true,
      message: 'Response delivered to client',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Widget Response Actions - Pusher error:', error);
    return {
      success: false,
      error: 'Failed to send response to client',
      timestamp: new Date().toISOString(),
    };
  }
}
