import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClerkWrapper from "@/components/layout/ClerkWrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicBuild Connect - Verified Project Management & Payments",
  description: "Manage projects, verify field progress, and release payments with confidence. A prototype platform with AI work orders, GPS tracking, and Stripe Connect test mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ClerkWrapper>
          <div className="flex-1 flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster richColors position="top-right" />
        </ClerkWrapper>
      </body>
    </html>
  );
}
