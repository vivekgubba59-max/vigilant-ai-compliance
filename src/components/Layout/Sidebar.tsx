'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './AppContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Building, 
  ShieldAlert, 
  Activity,
  LogOut,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname() || '';
  const { company, logoutUser } = useApp();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Compliance Tracker', href: '/tracker', icon: CalendarCheck },
    { name: 'AI Compliance Chat', href: '/chat', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Company Profile', href: '/profile', icon: Building },
    { name: 'Admin Panel', href: '/admin', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card text-card-foreground flex flex-col h-full flex-shrink-0">
      {/* Branding Header */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600 shadow-lg text-white">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-lg text-foreground block">Vigilant AI</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Compliance Copilot</span>
        </div>
      </div>

      {/* Company Selector Quick-card */}
      <div className="p-4 mx-4 my-4 rounded-xl bg-secondary/50 border border-border/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <span className="text-xs font-semibold text-foreground block truncate">{company.name}</span>
          <span className="text-[10px] text-muted-foreground block truncate">{company.industry} • {company.state}</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        {/* Compliance Mini Status */}
        <div className="px-2 py-1.5 flex items-center justify-between text-xs rounded-lg bg-secondary/30 border border-border/30">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Compliance Score:
          </span>
          <span className={`font-bold ${
            company.compliance_score >= 80 
              ? 'text-emerald-500' 
              : company.compliance_score >= 60 
                ? 'text-amber-500' 
                : 'text-rose-500'
          }`}>
            {company.compliance_score}%
          </span>
        </div>
        
        <button
          onClick={() => {
            logoutUser();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
