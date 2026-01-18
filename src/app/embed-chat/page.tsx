"use client";

import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";

function EmbedChatContent() {

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <ChatWidget/>
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fattalNavy"></div>
        </div>
      }
    >
      <EmbedChatContent />
    </Suspense>
  );
}
