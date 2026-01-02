import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/sonner"; 
import { NetworkStatus } from '@/components/network-status';

export const metadata: Metadata = {
  title: 'Thrive - Personalized Learning Platform',
  description: 'Your personalized learning companion with AI-powered tutoring and progress tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#151313" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <NetworkStatus />
        {children}
      </body>
    </html>
  );
}