import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "囧雞貼圖產生器 | JChik Stamp Generator",
  description: "使用 AI 產生囧雞風格的可愛貼圖",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
