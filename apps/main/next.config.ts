import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "your-supabase-url.supabase.co"],
  },

  transpilePackages: [
    "@repo/ui",
    "@repo/types",
    "@repo/api-client",
  ],
};

export default nextConfig;