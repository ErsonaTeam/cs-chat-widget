'use server';

import { queueAgentMessage } from '@/services/message-queue-service';
import { type WidgetActionResult } from './widget-actions';
import { FattalHotel, FattalRoom, WidgetListing, WidgetGallery } from '@/types/message-types';

export interface WidgetResponseData {
  companyId: string;
  conversationId: string;
  message?: string;
  timestamp?: string;
  error?: string;
  hotelOptions?: FattalHotel[];
  roomSearchResults?: FattalRoom[];
  listingOptions?: WidgetListing[];
  formId?: string;
  formData?: Record<string, unknown>;
  languageCode?: string;
  gallery?: WidgetGallery;
}

export async function processWidgetResponse(data: WidgetResponseData): Promise<WidgetActionResult> {
  const { companyId, conversationId, message, timestamp, error, hotelOptions, roomSearchResults, listingOptions, formId, formData, languageCode, gallery } = data;

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
  } else if (!message && !gallery) {
    console.error('Widget Response Actions - No message or content in response from embeddings service');
    responseMessage = "I'm sorry, I didn't receive a proper response. Please try again.";
  } else {
    responseMessage = message ?? '';
  }

  try {
    await queueAgentMessage(companyId, conversationId, responseMessage, timestamp, hotelOptions, roomSearchResults, formId, formData, languageCode, listingOptions, gallery);

    return {
      success: true,
      message: 'Response queued for client',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Widget Response Actions - Queue error:', error);
    return {
      success: false,
      error: 'Failed to queue response for client',
      timestamp: new Date().toISOString(),
    };
  }
}
