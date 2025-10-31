// app/dashboard/layout.tsx
'use client';

import DashboardNavbar from '@/components/dashboard/layout/Navbar';
import DashboardSidebar from '@/components/dashboard/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.push('/');
        } else if (user?.role === 'USER') {
          router.push('/');
        } else {
          setChecking(false);
        }
      }, 100);
  
      return () => clearTimeout(timer);
    }, [isAuthenticated, user, router]);

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="ml-64">
          {/* Navbar */}
          <DashboardNavbar />

          {/* Page Content */}
          <main className="pt-16 p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </QueryProvider>
  );
}