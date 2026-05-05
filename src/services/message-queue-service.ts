'use server';

import { FattalHotel, FattalRoom, WidgetListing, WidgetGallery } from '@/types/message-types';
import { pushPendingMessage } from './redis-service';

/**
 * Queue message for client polling
 * (Replaces sendPusherMessage - same signature for minimal changes to callers)
 */
export async function queueAgentMessage(
  companyId: string,
  conversationId: string,
  message: string,
  timestamp?: string,
  hotelOptions?: FattalHotel[],
  roomSearchResults?: FattalRoom[],
  formId?: string,
  formData?: Record<string, unknown>,
  languageCode?: string,
  listingOptions?: WidgetListing[],
  gallery?: WidgetGallery,
): Promise<void> {
  const messageData = {
    conversationId,
    message,
    timestamp: timestamp || new Date().toISOString(),
    hotelOptions: hotelOptions || null,
    roomSearchResults: roomSearchResults || null,
    listingOptions: listingOptions || null,
    formId: formId || null,
    formData: formData || null,
    languageCode: languageCode || null,
    gallery: gallery || null,
  };

  await pushPendingMessage(conversationId, messageData);
}

/**
 * Queue fallback error message
 * (Replaces sendPusherFallbackMessage)
 */
export async function queueFallbackMessage(
  companyId: string,
  conversationId: string,
  fallbackMessage?: string
): Promise<void> {
  const message =
    fallbackMessage ||
    "I'm sorry, I'm having trouble processing your message right now. Please try again later.";
  await queueAgentMessage(companyId, conversationId, message);
}
