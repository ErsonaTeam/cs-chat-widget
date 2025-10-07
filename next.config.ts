import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static file serving and custom rewrites for HTML files
  async rewrites() {
    return [
      // Serve static HTML files from public directory
      {
        source: '/test-embed.html',
        destination: '/test-embed.html',
      },
      {
        source: '/test-conversation-continuity.html', 
        destination: '/test-conversation-continuity.html',
      },
      {
        source: '/test-cross-origin.html',
        destination: '/test-cross-origin.html',
      },
    ];
  },
};

export default nextConfig;
