"use client";

import { useEffect } from "react";

export default function LoadingSpinner() {
  // Add CSS keyframes for loader animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes l7 {
        33%{background-size:calc(100%/5) 0%  ,calc(100%/5) 100%,calc(100%/5) 100%}
        50%{background-size:calc(100%/5) 100%,calc(100%/5) 0%  ,calc(100%/5) 100%}
        66%{background-size:calc(100%/5) 100%,calc(100%/5) 100%,calc(100%/5) 0%  }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 shadow-sm border border-gray-200 chat-message-bot px-8 py-3 rounded-xl space-x-2"
      style={{
        width: "50px",
        aspectRatio: "5",
        background: `
          radial-gradient(circle closest-side, #4B5563 90%, transparent) 10% 50%,
          radial-gradient(circle closest-side, #4B5563 90%, transparent) 50% 50%,
          radial-gradient(circle closest-side, #4B5563 90%, transparent) 90% 50%
        `,
        backgroundSize: "calc(100%/5) 100%",
        backgroundRepeat: "no-repeat",
        animation: "l7 1s infinite linear",
      }}
    />
  );
} 