'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminLayout from '@/components/AdminLayout';

export default function ConditionalShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const isAuthRoute = pathname === '/login' || pathname?.startsWith('/auth');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}





