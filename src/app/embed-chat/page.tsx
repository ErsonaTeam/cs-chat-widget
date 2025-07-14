"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

function EmbedChatContent() {
  const searchParams = useSearchParams();
  const [queryParams, setQueryParams] = useState<{
    userId?: string;
    lang?: string;
  }>({});

  useEffect(() => {
    const userId = searchParams.get("userId") || undefined;
    const lang = searchParams.get("lang") || undefined;
    setQueryParams({ userId, lang });
  }, [searchParams]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <ChatWidget {...queryParams} />
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <EmbedChatContent />
    </Suspense>
  );
}
