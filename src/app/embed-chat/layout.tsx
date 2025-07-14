import type { Metadata } from "next";
import DevOverlayHider from "@/components/DevOverlayHider";
import EmbedTransparency from "@/components/EmbedTransparency";

export const metadata: Metadata = {
  title: "Chat Widget",
  description: "Embeddable chat widget",
};

export default function EmbedChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full w-full bg-transparent embed-chat-layout">
      <EmbedTransparency />
      <DevOverlayHider />
      {children}
    </div>
  );
}
