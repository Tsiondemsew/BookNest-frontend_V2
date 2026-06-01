import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import { ThemeInit } from "@/components/theme-init";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookNest Admin",
  description: "BookNest catalog moderation console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body
        className="min-h-full flex flex-col bg-background font-sans text-foreground transition-colors"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
