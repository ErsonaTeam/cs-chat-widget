# cs-chat-widget - CLAUDE.md

Embeddable chat widget for customer websites. Provides a real-time chat interface that connects to the Ersona platform, allowing end-users to communicate with businesses through their websites.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev  # Runs on port 3000

# Build for production
npm run build
npm run start
```

**Required Services:** `embeddings-encoder` (port 3001) for message processing

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.4.7 (App Router) |
| Language | TypeScript 5.x |
| Real-time | Pusher (pusher 5.2.0 + pusher-js 8.4.0) |
| Cache | Redis (ioredis 5.8.2) |
| Animation | Framer Motion 11.18.2 |
| Icons | react-icons 5.5.0 |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── widget/
│   │       ├── messages/route.ts      # Message processing
│   │       ├── message/route.ts       # Single message
│   │       ├── response/route.ts      # Response handling
│   │       └── checkout/route.ts      # Checkout integration
│   │
│   ├── embed-chat/
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Widget iframe content
│   │
│   ├── actions/
│   │   ├── widget-actions.ts          # Server actions
│   │   └── widget-response-actions.ts
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ChatWidget.tsx                 # Main widget component
│   ├── RoomCard.tsx
│   ├── RoomCarousel.tsx
│   ├── RoomOptionsView.tsx
│   ├── LoadingSpinner.tsx
│   ├── DevOverlayHider.tsx
│   └── EmbedTransparency.tsx
│
├── services/
│   ├── pusher-service.ts              # Real-time messaging
│   └── redis-service.ts               # Message caching
│
├── utils/
│   └── cors.ts                        # CORS configuration
│
└── types/
    └── message-types.ts               # TypeScript definitions
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/api/widget/` | API routes for widget communication |
| `app/embed-chat/` | Embeddable chat page |
| `components/` | React components |
| `services/` | Pusher and Redis services |

---

## Key Patterns

### CORS Handling

```typescript
// src/utils/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In API routes
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  // Handle request
  return NextResponse.json(data, { headers: corsHeaders });
}
```

### Pusher Channel Pattern

```typescript
// Channel naming convention
const channelName = `c-${companyId}-${conversationId}`;

// Event types
const EVENTS = {
  AGENT_MESSAGE: 'agent.message',
  SEND_MESSAGE: 'send.message',
};

// Subscribe to channel
const channel = pusher.subscribe(channelName);
channel.bind(EVENTS.AGENT_MESSAGE, (data: MessageData) => {
  // Handle incoming message
});
```

### Redis Message Storage

```typescript
// src/services/redis-service.ts
const MESSAGE_TTL = 300; // 5 minutes

export async function storeMessage(
  conversationId: string,
  message: Message
): Promise<void> {
  const key = `messages:${conversationId}`;
  await redis.lpush(key, JSON.stringify(message));
  await redis.expire(key, MESSAGE_TTL);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const key = `messages:${conversationId}`;
  const messages = await redis.lrange(key, 0, -1);
  return messages.map(m => JSON.parse(m));
}
```

### API Route Pattern

```typescript
// src/app/api/widget/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { corsHeaders } from '@/utils/cors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, companyId } = body;

    // Process message via embeddings service
    const response = await fetch(`${EMBEDDINGS_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message, companyId }),
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: StatusCodes.OK,
      headers: corsHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR, headers: corsHeaders }
    );
  }
}
```

### Widget Embedding

```html
<!-- Customer website integration -->
<script>
  (function() {
    var widget = document.createElement('iframe');
    widget.src = 'https://widget.ersona.io/embed-chat?companyId=xxx&userId=yyy';
    widget.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;';
    document.body.appendChild(widget);
  })();
</script>
```

---

## Message Flow

```
1. User types message in widget
   │
2. Widget sends POST to /api/widget/messages
   │
3. API route forwards to embeddings-encoder
   │
4. embeddings-encoder processes and responds
   │
5. Response stored in Redis (5-min TTL)
   │
6. Pusher notification sent to channel
   │
7. Widget receives via Pusher subscription
   │
8. Message displayed in chat UI
```

---

## API Endpoints

### Widget Routes

```
POST   /api/widget/messages     # Send message
GET    /api/widget/messages     # Get message history
POST   /api/widget/response     # Handle response
POST   /api/widget/checkout     # Process checkout

OPTIONS *                        # CORS preflight
```

### URL Parameters

The embed page accepts:

| Parameter | Description |
|-----------|-------------|
| `companyId` | Company identifier |
| `userId` | Optional user identifier |
| `lang` | Language preference |

```
/embed-chat?companyId=xxx&userId=yyy&lang=en
```

---

## Integration Points

### With embeddings-encoder

```typescript
// Forward messages for AI processing
POST ${EMBEDDINGS_SERVICE_URL}/chat
{
  "conversationId": "uuid",
  "companyId": "uuid",
  "message": {
    "content": "Hello, I need help",
    "platform": "WIDGET"
  }
}
```

### With Pusher

```typescript
// Trigger message event
await pusher.trigger(channelName, 'agent.message', {
  id: messageId,
  content: response,
  timestamp: Date.now(),
});
```

---

## Common Tasks

### Adding a New Component

```typescript
// src/components/NewComponent.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onAction}
    >
      {title}
    </motion.div>
  );
}
```

### Adding a New API Endpoint

```typescript
// src/app/api/widget/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/utils/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

### Styling Guidelines

```typescript
// Use CSS (no Tailwind in this project)
// Styles in globals.css or component-specific CSS

// For dark mode detection
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// For RTL (Hebrew) support
const isRTL = /[\u0590-\u05FF]/.test(text);
```

---

## Configuration

### Environment Variables

```bash
# Widget
NEXT_PUBLIC_WIDGET_API_BASE=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Embeddings Service
EMBEDDINGS_SERVICE_URL=http://localhost:3001

# Pusher
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Next.js Config

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};
```

---

## Do's and Don'ts

### Do's

- Always include CORS headers in responses
- Handle OPTIONS preflight requests
- Use Pusher for real-time updates (not polling)
- Store messages in Redis with TTL
- Support dark mode
- Handle RTL text (Hebrew)
- Use responsive design
- Keep localStorage for message persistence

### Don'ts

- Don't skip CORS headers
- Don't make synchronous blocking calls
- Don't store sensitive data in localStorage
- Don't hardcode company/user IDs
- Don't use Tailwind (plain CSS in this project)

---

## Troubleshooting

### CORS Errors

1. Verify corsHeaders are included in response
2. Check OPTIONS handler exists
3. Verify allowed origins

### Pusher Not Connecting

1. Check NEXT_PUBLIC_PUSHER_* env vars
2. Verify channel name format
3. Check browser console for WebSocket errors

### Messages Not Appearing

1. Check Redis connection
2. Verify Pusher events are firing
3. Check embeddings-encoder is responding
4. Review browser network tab

### Widget Not Loading

1. Check iframe src URL
2. Verify NEXT_PUBLIC_BASE_URL
3. Check browser CSP settings
4. Test in incognito mode

---

## File Locations Quick Reference

| What | Where |
|------|-------|
| API Routes | `src/app/api/widget/*/route.ts` |
| Embed Page | `src/app/embed-chat/page.tsx` |
| Components | `src/components/*.tsx` |
| Pusher Service | `src/services/pusher-service.ts` |
| Redis Service | `src/services/redis-service.ts` |
| CORS Utils | `src/utils/cors.ts` |
| Types | `src/types/message-types.ts` |
| Styles | `src/app/globals.css` |

---

**Port:** 3000
**Framework:** Next.js 15 (App Router)
**Real-time:** Pusher
