import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HolsteinBackground } from "@/components/ui/HolsteinBackground";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CattleOS - Modern Farm Management",
  description: "Secure Digital Passport System for Livestock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <HolsteinBackground />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
