"use client";

import { useEffect } from "react";

export default function DevOverlayHider() {
  useEffect(() => {
    // Add CSS to hide development overlays
    const style = document.createElement("style");
    style.textContent = `
      /* Hide Next.js development overlay and buttons in embedded iframe */
      #__next-dev-overlay,
      [data-nextjs-scroll-focus-boundary],
      nextjs-portal,
      [data-nextjs-dialog-overlay],
      [data-nextjs-dialog],
      [data-nextjs-toast],
      [data-nextjs-sidebar],
      [data-overlay],
      [data-nextjs-errors-overlay],
      .__next-dev-overlay,
      #react-devtools-portal,
      [data-react-devtools],
      .__react-dev-overlay {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
      
      /* Hide any fixed positioned development elements */
      body > div[style*="position: fixed"][style*="z-index"]:not([id*="chat-widget"]) {
        display: none !important;
      }
      
      /* Ensure clean iframe environment */
      body.embedded-chat {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      /* Hide Next.js build indicator */
      [data-nextjs-build-indicator] {
        display: none !important;
      }
      
      /* Hide hot reload indicators */
      [data-nextjs-hot-reload] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Add body class for targeting
    document.body.classList.add("embedded-chat");

    // Function to continuously hide overlays
    const hideOverlays = () => {
      const overlaySelectors = [
        "#__next-dev-overlay",
        "[data-nextjs-scroll-focus-boundary]",
        "nextjs-portal",
        "[data-nextjs-dialog-overlay]",
        "[data-nextjs-dialog]",
        "[data-nextjs-toast]",
        "[data-nextjs-sidebar]",
        "[data-overlay]",
        "[data-nextjs-errors-overlay]",
        ".__next-dev-overlay",
        "#react-devtools-portal",
        "[data-react-devtools]",
        ".__react-dev-overlay",
        "[data-nextjs-build-indicator]",
        "[data-nextjs-hot-reload]",
      ];

      overlaySelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
            el.style.visibility = "hidden";
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el.style.zIndex = "-9999";
            // Remove from DOM if it's a development overlay
            if (
              el.id === "__next-dev-overlay" ||
              el.classList.contains("__next-dev-overlay")
            ) {
              el.remove();
            }
          }
        });
      });

      // Also hide any React error overlays
      const errorOverlays = document.querySelectorAll(
        "[data-react-error-overlay]"
      );
      errorOverlays.forEach((overlay) => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = "none";
        }
      });
    };

    // Run immediately and set up interval
    hideOverlays();
    const interval = setInterval(hideOverlays, 100);

    // Also run on DOM mutations
    const observer = new MutationObserver(hideOverlays);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      observer.disconnect();
      document.body.classList.remove("embedded-chat");
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
}
