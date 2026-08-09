import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Intercept requests to /__clerk and securely proxy them to the Clerk Frontend API
  async rewrites() {
    return [
      {
        source: "/__clerk/:path*",
        destination: "https://clerk.chiromo-tech-club.vercel.app/:path*", 
      },
    ];
  },
};

export default nextConfig;