import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
// import { FloatingNewsletter } from '@/components/newsletter/FloatingNewsletter';
import { AnalyticsWrapper } from '@/components/analytics-wrapper';
// import { FloatingEmailSignup } from '@/components/floating-email-signup';
import { getServerSettings } from '@/lib/server-data';

const inter = Inter({ subsets: ['latin'] });

// Disable caching / static rendering globally
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata: Metadata = {
  title: "Kocky's Bar & Grill - Best Food, Drinks & Atmosphere",
  description: 'Experience the best bar and grill in town. Great food, amazing drinks, live entertainment, and the perfect atmosphere for any occasion.',
  keywords: 'bar, grill, restaurant, food, drinks, happy hour, reservations, catering, mobile bar, food truck',
  openGraph: {
    title: "Kocky's Bar & Grill",
    description: 'Experience the best bar and grill in town',
    type: 'website',
    locale: 'en_US',
    url: 'https://kockysbar.com',
    siteName: "Kocky's Bar & Grill",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Kocky's Bar & Grill",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kocky's Bar & Grill",
    description: 'Experience the best bar and grill in town',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings on the server with error handling
  let settings = null;
  try {
    settings = await getServerSettings();
  } catch (error) {
    console.error('Server-side settings fetch failed:', error);
    // Continue with null - Footer will use fallbacks
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/* <AnalyticsWrapper /> */}
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer settings={settings} />
          </div>
          {/* <FloatingEmailSignup /> */}
          {/* <FloatingNewsletter /> */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
