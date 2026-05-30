declare module 'next-pwa' {
  export interface RuntimeCaching {
    urlPattern:
      | RegExp
      | string
      | ((context: { request: Request; url?: URL }) => boolean);
    handler: string;
    method?: string;
    options?: Record<string, unknown>;
  }

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: RegExp[];
    customWorkerDir?: string;
    fallbacks?: Record<string, string>;
  }

  export default function withPWA(config: PWAConfig): (nextConfig: unknown) => unknown;
}
