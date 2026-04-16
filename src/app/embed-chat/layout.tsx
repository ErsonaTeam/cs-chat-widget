import type { Metadata, Viewport } from "next";
import DevOverlayHider from "@/components/DevOverlayHider";
import EmbedTransparency from "@/components/EmbedTransparency";

export const metadata: Metadata = {
  title: "Chat Widget",
  description: "Embeddable chat widget",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
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
