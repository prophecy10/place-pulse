import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Place Pulse | Google Maps Rating and Review History',
  description:
    'Google shows you the current rating. Place Pulse shows you how that rating got there. Factual historical rating and review count records.',
  keywords: ['Google Maps rating history', 'Place Pulse', 'Google reviews over time', 'review velocity', 'place rating tracking'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090a0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-full bg-[#090a0f] text-slate-100 flex flex-col selection:bg-sky-500/20 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
