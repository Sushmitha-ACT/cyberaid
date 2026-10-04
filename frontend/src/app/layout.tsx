import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import BackgroundVideo from "@/components/BackgroundVideo";
import AuthProvider from "@/components/AuthProvider";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CyberAid — Digital Problem First-Aid",
  description: "Know what to do when something goes wrong online. Get an immediate recovery plan for digital safety incidents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <AuthProvider>
          <BackgroundVideo />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
