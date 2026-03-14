"use client";

import { useEffect } from "react";

export default function LoadingSpinner() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes typing-dot {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        30% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .typing-dot {
          animation: none !important;
          opacity: 0.6 !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-white shadow-sm border border-fattalNavy/10 px-4 py-3 rounded-2xl inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot block rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: "var(--theme-primary, #1d2b4d)",
            animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
