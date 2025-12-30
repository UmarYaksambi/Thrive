import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/sonner"; //

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
      <body className="antialiased">
        {children}
        {/* The Toaster component enables notifications across the app */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}