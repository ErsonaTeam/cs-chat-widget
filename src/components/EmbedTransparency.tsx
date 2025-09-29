"use client";

import { useEffect } from "react";

export default function EmbedTransparency() {
  useEffect(() => {
    // Add transparent classes to html and body for iframe embedding
    document.documentElement.classList.add("embed-transparent");
    document.body.classList.add("embed-transparent");

    // Cleanup function to remove classes when component unmounts
    return () => {
      document.documentElement.classList.remove("embed-transparent");
      document.body.classList.remove("embed-transparent");
    };
  }, []);

  return null; // This component doesn't render anything visible
}
