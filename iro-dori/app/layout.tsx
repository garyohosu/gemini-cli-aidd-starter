import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iro-dori — ムード・メモ",
  description: "感情で色が変わるメモ帳。Google AI Studio (Gemini) が気持ちを分析します。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
