'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/Layout/AppContext';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Cpu, 
  BellRing, 
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  Trash2
} from 'lucide-react';
import { DemoDatabase } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPanelPage() {
  const { auditLogs, company } = useApp();
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'reminder'>('info');
  const [statusMsg, setStatusMsg] = useState('');

  // Sample data representing system scale
  const registeredSmes = [
    { name: company.name, state: company.state, employees: company.employee_count, industry: company.industry, score: company.compliance_score },
    { name: 'Kalinga Iron Works Limited', state: 'West Bengal', employees: 85, industry: 'Manufacturing', score: 92 },
    { name: 'Vaishnavi Retail Apparels', state: 'Telangana', employees: 14, industry: 'Retail & E-Commerce', score: 78 },
    { name: 'Grand Harvest Agro Foods', state: 'Maharashtra', employees: 42, industry: 'Food & Beverage', score: 85 }
  ];

  const adminUsers = [
    { name: 'Vivek Gubba', role: 'Compliance Director', email: 'vivek@vigilant.ai', active: true },
    { name: 'Rahul Sharma', role: 'Legal Auditor', email: 'rahul@vigilant.ai', active: true },
    { name: 'Ananya Sen', role: 'System Administrator', email: 'ananya@vigilant.ai', active: false }
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    // Retrieve active notifications from DemoDatabase, push new notification and save
    const currentNotifs = DemoDatabase.getNotifications();
    const newNotif = {
      id: `notif-admin-${Date.now()}`,
      company_id: company.id, // broadcasts to our tenant
      title: `[GOVT NOTICE] ${broadcastTitle}`,
      message: broadcastMsg,
      type: broadcastType,
      read: false,
      created_at: new Date().toISOString()
    };

    DemoDatabase.saveNotifications([newNotif, ...currentNotifs]);
    DemoDatabase.addAuditLog('System Broadcast Dispatched', `Broadcasted notification: ${broadcastTitle}`);
    
    // Reset Form & Show Success banner
    setBroadcastTitle('');
    setBroadcastMsg('');
    setStatusMsg('Global regulatory notification successfully broadcasted!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setStatusMsg('');
      if (typeof window !== 'undefined') {
        window.location.reload(); // Reload window to sync notification count
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-600" />
          System Administration Cockpit
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
          Manage system tenants, view audit logs, evaluate Gemini token volumes, and broadcast global regulatory alerts.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Companies</span>
            <span className="text-xl font-extrabold text-foreground block">4 SME Tenants</span>
          </div>
          <Building2 className="w-8 h-8 text-blue-500 opacity-20" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Registered Staff</span>
            <span className="text-xl font-extrabold text-foreground block">165 Users</span>
          </div>
          <Users className="w-8 h-8 text-blue-500 opacity-20" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">AI Token Consumed</span>
            <span className="text-xl font-extrabold text-foreground block">124,580 Tokens</span>
          </div>
          <Cpu className="w-8 h-8 text-blue-500 opacity-20" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Fines Monitored</span>
            <span className="text-xl font-extrabold text-emerald-600 block">₹12,500 Monitored</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-emerald-500 opacity-20" />
        </div>
      </div>

      {/* Main Grid: Broadcast Alert & Tenancy overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcaster */}
        <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-amber-500 animate-bounce" /> Broadcast Government Notification
          </h3>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Dispatch a new government notification (e.g. Finance Ministry circular, GST amendment). This instantly broadcasts to the active tenant dashboard.
          </p>

          {statusMsg && (
            <div className="p-3 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Notification Subject
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Finance Ministry extends ESI contributions deadline"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Message Body
              </label>
              <textarea
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Due to technical glitches in standard portals, the Department of Revenue extends filings to July 31..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Risk Classification
              </label>
              <div className="flex gap-4">
                {['info', 'warning', 'reminder'].map(t => (
                  <label key={t} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="broadcast_type"
                      value={t}
                      checked={broadcastType === t}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast Notice
            </button>
          </form>
        </div>

        {/* Right Column: Tenancy List & System Log Audits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Companies List */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Registered SME Corporate Tenancies</h3>
            </div>
            <div className="divide-y divide-border">
              {registeredSmes.map((sme, i) => (
                <div key={i} className="p-3.5 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{sme.name}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {sme.industry} • {sme.state} • {sme.employees} Employees
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      sme.score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      Score: {sme.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">System Audit Trail</h3>
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Compliance Logged</span>
            </div>
            
            <div className="p-3 space-y-2 max-h-56 overflow-y-auto divide-y divide-border">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-2 pb-1.5 flex justify-between items-start text-[10px] leading-relaxed">
                  <div className="pr-4 space-y-0.5">
                    <span className="font-bold text-foreground block">{log.action}</span>
                    <p className="text-muted-foreground">{log.details}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0 font-medium">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
