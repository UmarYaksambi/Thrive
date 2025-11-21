import './globals.css';
import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
