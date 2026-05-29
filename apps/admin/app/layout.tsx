import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { ThemeInit } from "@/components/theme-init";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

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
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] font-sans text-[var(--foreground)]" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
