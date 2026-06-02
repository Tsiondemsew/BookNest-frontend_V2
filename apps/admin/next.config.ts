import type { NextConfig } from 'next';

/**
 * API traffic is handled by app/api/[...path]/route.ts (forwards cookies correctly).
 * BACKEND_URL must point to Railway / local Express on port 5000.
 */
const nextConfig: NextConfig = {
  transpilePackages: ['@repo/api-client', '@repo/types'],
};

export default nextConfig;
