'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWidget from '@/components/ChatWidget';
import { resolveWidgetConfig } from '@/config/resolve-widget-config';
import type { WidgetConfig } from '@/config/widget-config';

function EmbedChatContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const langOverride = searchParams.get('lang');

  useEffect(() => {
    let cancelled = false;
    resolveWidgetConfig(new URLSearchParams(searchParams.toString()))
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch((error) => {
        console.error('[embed-chat] Resolver threw unexpectedly', error);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (!config) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <ChatWidget config={config} langOverride={langOverride} />
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <Suspense fallback={null}>
      <EmbedChatContent />
    </Suspense>
  );
}
