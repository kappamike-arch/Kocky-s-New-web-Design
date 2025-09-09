import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import AdminLayout from '@/components/AdminLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Kocky's Admin Panel - Secure Management Portal",
  description: 'Secure admin panel for managing Kocky\'s Bar & Grill',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="admin-panel">
            <AdminSidebar />
            <AdminLayout>
              {children}
            </AdminLayout>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <SonnerToaster 
            position="bottom-right"
            theme="dark"
            richColors
          />
        </Providers>
      </body>
    </html>
  );
}
