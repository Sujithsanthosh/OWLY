import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AIAssistant from "@/components/ui/AIAssistant";

export const metadata: Metadata = {
  title: "Owly | Community Commerce",
  description: "Join tribes, discover food and fashion, shop with creators. The social commerce platform built for communities.",
  keywords: "social commerce, food, fashion, communities, creator economy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[var(--color-bg)] text-[var(--color-text)] min-h-dvh pb-20 md:pb-0 md:pl-[72px] antialiased">
        <Navbar />
        <main className="min-h-dvh">
          {children}
        </main>
        <AIAssistant />
      </body>
    </html>
  );
}
