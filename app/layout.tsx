import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "卡卡 - AI代码生成",
  description: "使用AI驱动的代码生成更快地构建应用程序",
  generator: '卡卡'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable}`}>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}