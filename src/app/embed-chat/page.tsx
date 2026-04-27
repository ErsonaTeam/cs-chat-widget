"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

function EmbedChatContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");
  const lang = searchParams.get("lang");

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <ChatWidget theme={theme} lang={lang} />
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <EmbedChatContent />
    </Suspense>
  );
}
