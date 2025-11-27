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
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:ml-64">
          <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="py-16 px-4 sm:px-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </QueryProvider>
  );
}