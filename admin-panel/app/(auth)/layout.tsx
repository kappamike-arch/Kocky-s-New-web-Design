import type { Metadata } from 'next';
import '../globals.css';
import { Providers } from '../providers';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';

export const metadata: Metadata = {
  title: "Kocky's Admin Login",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
          <SonnerToaster position="bottom-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}





