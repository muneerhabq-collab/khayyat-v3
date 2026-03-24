import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'خيّاط — نظام إدارة محلات الخياطة', description: 'نظام متكامل لإدارة الطلبات والمقاسات والمخزون' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#d4802a' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body className="font-ar antialiased">{children}</body></html>;
}
