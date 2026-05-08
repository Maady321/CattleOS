import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HolsteinBackground } from "@/components/ui/HolsteinBackground";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SchemaMarkup } from "@/components/SEO/SchemaMarkup";
import { Navbar } from "@/components/landing/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isMl = locale === 'ml';

  return {
    metadataBase: new URL("https://cattle0s.netlify.app"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en-IN': '/en',
        'ml-IN': '/ml',
        'x-default': '/',
      },
    },
    title: {
      default: isMl ? "കാറ്റിൽഒഎസ് | സ്മാർട്ട് കന്നുകാലി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം" : "CattleOS | Smart Cattle Management Platform",
      template: "%s | CattleOS",
    },
    description: isMl 
      ? "ക്ഷീരകർഷകർക്കായി നിർമ്മിച്ച സ്മാർട്ട് കന്നുകാലി മാനേജ്‌മെന്റ് സോഫ്റ്റ്‌വെയർ. ആരോഗ്യം, പാൽ ഉൽപ്പാദനം, വാക്സിനേഷൻ എന്നിവ ട്രാക്ക് ചെയ്യുക."
      : "Smart cattle management software for dairy farms. Track health, milk production, breeding, vaccinations, and analytics.",
    keywords: [
      "cattle management software",
      "livestock tracking",
      "dairy farm software",
      "cattle health monitoring",
      "farm analytics"
    ],
    verification: {
      google: "ryDB1u5hJVTI3UA3pokaq8wuHq0DkrDQOuv8l1M7JVg",
    },
    openGraph: {
      title: "CattleOS",
      description: isMl ? "സ്മാർട്ട് കന്നുകാലി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം" : "Smart cattle management platform",
      url: `https://cattle0s.netlify.app/${locale}`,
      siteName: "CattleOS",
      locale: isMl ? 'ml_IN' : 'en_IN',
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "CattleOS",
      description: isMl ? "സ്മാർട്ട് കന്നുകാലി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം" : "Smart cattle management platform",
      images: ["/og-image.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <SchemaMarkup />
          <Navbar />
          <HolsteinBackground />
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
