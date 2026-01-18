'use server';

import PusherServer from 'pusher';
import { PusherEventType, RoomOption, FattalHotel, FattalRoom } from '@/types/message-types';
import { generateMessageKey, storeMessageData } from './redis-service';

// Singleton Pusher instance (module-level)
let pusherServer: PusherServer | null = null;

// Initialize Pusher server (only once)
async function initializePusher(): Promise<PusherServer> {
  if (!pusherServer) {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appId || !key || !secret || !cluster) {
      throw new Error('Missing required Pusher environment variables');
    }

    pusherServer = new PusherServer({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherServer;
}

// Server Action: Send message to Pusher channel
export async function sendPusherMessage(
  companyId: string,
  conversationId: string,
  message: string,
  timestamp?: string,
  roomOptions?: RoomOption[],
  hotelOptions?: FattalHotel[],
  roomSearchResults?: FattalRoom[]
): Promise<void> {
  const pusher = await initializePusher();
  const channel = `c-${companyId}-${conversationId}`;

  // Generate unique key for this message
  const messageKey = generateMessageKey();

  // Store the actual message data in Redis with 5-minute TTL
  const messageData = {
    conversationId,
    message,
    timestamp: timestamp || new Date().toISOString(),
    roomOptions: roomOptions || null,
    hotelOptions: hotelOptions || null,
    roomSearchResults: roomSearchResults || null,
  };

  await storeMessageData(messageKey, messageData, 300); // 300 seconds = 5 minutes

  // Send only the key through Pusher (lightweight notification)
  await pusher.trigger(channel, PusherEventType.AGENT_MESSAGE, {
    messageKey,
  });
}

// Server Action: Send fallback message
export async function sendPusherFallbackMessage(
  companyId: string,
  conversationId: string,
  fallbackMessage?: string
): Promise<void> {
  const message = fallbackMessage || "I'm sorry, I'm having trouble processing your message right now. Please try again later.";
  await sendPusherMessage(companyId, conversationId, message);
}
