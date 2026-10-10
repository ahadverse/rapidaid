import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SkipLink } from '@/components/layout/skip-link';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const description = 'Priority-based ambulance dispatch, from emergency call to hospital arrival.';

export const metadata: Metadata = {
  title: {
    default: 'RapidAid — Emergency Response Platform',
    template: '%s | RapidAid',
  },
  description,
  applicationName: 'RapidAid',
  openGraph: {
    type: 'website',
    siteName: 'RapidAid',
    title: 'RapidAid — Emergency Response Platform',
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'RapidAid — Emergency Response Platform',
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
