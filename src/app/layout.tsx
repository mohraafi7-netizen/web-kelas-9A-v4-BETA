import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SpaceBackground } from '@/components/ui';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import Providers from './providers';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import { RouteGuard } from '@/components/RouteGuard';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Galaxy Class',
    template: '%s | Galaxy Class',
  },
  description: 'Official website of Galaxy Class - One Class, One Story, One Galaxy.',
  keywords: ['Galaxy Class', 'class website', 'school', 'students'],
  authors: [{ name: 'Galaxy Class' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://galaxyclass.example.com',
    siteName: 'Galaxy Class',
    title: 'Galaxy Class',
    description: 'Official website of Galaxy Class',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galaxy Class',
    description: 'Official website of Galaxy Class',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-cosmic-950 text-slate-50 flex`}
      >
        <SpaceBackground />
        <Providers>
          <RouteGuard>
            <Sidebar />
            <div className="flex-1 md:ml-[var(--sidebar-width,16rem)] flex flex-col min-h-screen transition-all duration-300">
              <Navbar />
              <main className="flex-1 relative z-10 pb-20 md:pb-0">{children}</main>
              <Footer />
            </div>
            <AdminMobileNav />
          </RouteGuard>
          <OnboardingModal />
        </Providers>
      </body>
    </html>
  );
}
