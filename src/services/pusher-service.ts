'use server';

import PusherServer from 'pusher';
import { PusherEventType, RoomOption } from '@/types/message-types';

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
  roomOptions?: RoomOption[]
): Promise<void> {
  const pusher = await initializePusher();
  const channel = `c-${companyId}-${conversationId}`;

  await pusher.trigger(channel, PusherEventType.AGENT_MESSAGE, {
    conversationId,
    message,
    timestamp: timestamp || new Date().toISOString(),
    roomOptions,
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
