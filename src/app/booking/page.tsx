'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FullPageChatWidget from '@/components/FullPageChatWidget';
import { resolveWidgetConfig } from '@/config/resolve-widget-config';
import type { WidgetConfig } from '@/config/widget-config';

function BookingContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const langOverride = searchParams.get('lang');

  const widgetIdParam = searchParams.get('widgetId');

  useEffect(() => {
    let cancelled = false;
    if (!widgetIdParam) return;
    resolveWidgetConfig(new URLSearchParams(searchParams.toString()))
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch((error) => {
        console.error('[booking] Resolver threw unexpectedly', error);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, widgetIdParam]);

  if (!widgetIdParam) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-background">
        <p className="text-text/60 text-sm">Missing widgetId parameter.</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-dvh w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen overflow-hidden">
      <FullPageChatWidget config={config} langOverride={langOverride} />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingContent />
    </Suspense>
  );
}
