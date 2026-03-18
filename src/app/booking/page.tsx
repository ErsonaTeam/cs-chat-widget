"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FullPageChatWidget from "@/components/FullPageChatWidget";

function BookingContent() {
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId") ?? "";
  const theme = searchParams.get("theme");

  if (!widgetId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Missing widgetId parameter.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <FullPageChatWidget widgetId={widgetId} theme={theme} />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fattalNavy" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
