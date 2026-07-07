'use client';

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User, 
  Check, 
  AlertTriangle, 
  Info,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Header() {
  const { notifications, markNotificationRead, theme, toggleTheme, currentUser } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <header className="h-16 border-b border-border bg-card text-card-foreground flex items-center justify-between px-6 z-30">
      {/* Welcome Message or Breadcrumb */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">Compliance Center</h2>
        <p className="text-xs text-muted-foreground">Automating compliance, tracking, and risk management.</p>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Aesthetic */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search regulations or status..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all focus:outline-none"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-all focus:outline-none"
            aria-label="Toggle Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card text-card-foreground shadow-2xl p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-xs font-bold text-foreground">Compliance Alerts</span>
                {unreadNotifications.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {unreadNotifications.length} New
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-2.5 rounded-lg border text-xs flex gap-2.5 relative group transition-all ${
                        notif.read 
                          ? 'border-border bg-card opacity-60' 
                          : 'border-blue-500/20 bg-blue-500/5'
                      }`}
                    >
                      {notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      ) : notif.type === 'reminder' ? (
                        <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-1 pr-4">
                        <span className="font-semibold block text-foreground">{notif.title}</span>
                        <span className="text-muted-foreground block leading-relaxed mt-0.5">{notif.message}</span>
                        {notif.due_date && (
                          <span className="text-[10px] text-muted-foreground font-semibold block mt-1">
                            Due Date: {formatDate(notif.due_date)}
                          </span>
                        )}
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="absolute right-2 top-2 p-0.5 rounded bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Quick Identity */}
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center text-muted-foreground">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-foreground block">
              {currentUser ? currentUser.fullName : 'Vivek Gubba'}
            </span>
            <span className="text-[10px] text-muted-foreground block font-medium">
              {currentUser ? currentUser.role : 'Compliance Manager'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
