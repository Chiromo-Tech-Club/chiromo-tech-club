import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Profile avatar uploads allow up to 5 MB on the client; default Server Action
  // body limit is 1 MB, which rejects those saves with a 413 before the action runs.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
};

export default nextConfig;