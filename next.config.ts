import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 — public development URL
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Cloudflare R2 — direct storage URL
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Custom R2 domain (add yours here when you set one up)
      // { protocol: "https", hostname: "assets.boilagbe.com" },
    ],
  },
  // Allow the FastAPI backend to be called from the same Vercel project
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
