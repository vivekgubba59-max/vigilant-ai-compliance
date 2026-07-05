'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import DemoBanner from './DemoBanner';
import { useApp } from './AppContext';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  // Define paths that bypass the default dashboard Shell layout
  const isAuthOrLanding = 
    pathname === '/' || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/forgot-password');

  if (isAuthOrLanding) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dynamic Demo Mode / Key Config Banner */}
      <DemoBanner />
      
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
