import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '道之光 · 命理AI',
  description: '八字排盘 | 每日运势 | AI改命建议',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
