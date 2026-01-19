import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tjrmemmsieltajotxddk.supabase.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Adjust as needed, but Vercel's hard 4.5MB limit still applies to the final response
    },
  },
};

export default nextConfig;
