import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      // Add your Supabase storage hostname when in production
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Add your production domain when deployed
      {
        protocol: "https",
        hostname: "book-nest-webapp.vercel.app",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["localhost", "your-supabase-url.supabase.co"],
  },

  transpilePackages: [
    "@repo/ui",
    "@repo/types",
    "@repo/api-client",
  ],
};

export default nextConfig;