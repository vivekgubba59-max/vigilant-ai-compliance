'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from './AppContext';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { currentUser } = useApp();
  const [mounted, setMounted] = useState(false);

  // Define paths that bypass the default dashboard Shell layout
  const isAuthOrLanding = 
    pathname === '/' || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/forgot-password');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthOrLanding && !currentUser) {
      router.push('/login');
    }
  }, [mounted, currentUser, isAuthOrLanding, router]);

  // Prevent flashing content during initial hydration check
  if (!mounted) {
    return null;
  }

  if (isAuthOrLanding) {
    return <>{children}</>;
  }

  // If we are on a protected page but have no user session, show empty loading block while redirecting
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Core Sidebar Navigation */}
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden bg-background text-foreground">
          {/* Header Panel */}
          <Header />
          
          {/* Main Context Screen */}
          <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
