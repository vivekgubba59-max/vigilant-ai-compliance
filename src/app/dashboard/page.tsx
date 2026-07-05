'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/components/Layout/AppContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { company, compliances, notifications } = useApp();

  // Calculate Metrics
  const activeCompliances = compliances.filter(c => c.status !== 'completed');
  const overdue = compliances.filter(c => c.status === 'overdue');
  const pending = compliances.filter(c => c.status === 'pending');
  const upcoming = compliances.filter(c => c.status === 'upcoming');
  const totalPenalties = overdue.reduce((sum, c) => sum + c.penalty_amount, 0);

  // Group compliances by priority
  const highPriority = activeCompliances
    .filter(c => c.priority === 'high')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Generate dynamic AI Auditor recommendations based on company and compliances
  const getAiRecommendations = () => {
    const recs = [];
    
    if (overdue.length > 0) {
      recs.push({
        id: 'rec-1',
        title: 'Immediate Remediation Required',
        desc: `You have ${overdue.length} overdue compliance task(s) carrying active penalties of ${formatCurrency(totalPenalties)}. Settle ESIC/PF payments immediately.`,
        action: 'View Overdue Tasks',
        link: '/tracker?status=overdue'
      });
    }

    if (company.employee_count >= 20 && !company.licenses.pf) {
      recs.push({
        id: 'rec-2',
        title: 'PF Registration Mandatory Threshold',
        desc: `Your employee size has reached ${company.employee_count}. Employee Provident Fund registration is legally required for firms with 20+ workers.`,
        action: 'Enable PF License',
        link: '/profile'
      });
    }

    if (company.industry === 'Manufacturing' && !company.licenses.factory) {
      recs.push({
        id: 'rec-3',
        title: 'Factories Act Inspection',
        desc: 'Manufacturing industries must document machinery checklists and hazard registers under Factories Act.',
        action: 'Manage Profile',
        link: '/profile'
      });
    }

    if (company.licenses.gst && compliances.filter(c => c.category === 'GST' && c.status === 'pending').length > 0) {
      recs.push({
        id: 'rec-4',
        title: 'GST Reconciliation Advisory',
        desc: 'Monthly GSTR-1 deadlines are approaching. Match your accounts register with GSTR-2B to avoid credit mismatches.',
        action: 'Consult Chat Agent',
        link: '/chat?q=How to reconcile GSTR-2B'
      });
    }

    // Default recommendation if compliance score is perfect
    if (recs.length === 0) {
      recs.push({
        id: 'rec-default',
        title: 'General Health Audit Status: Excellent',
        desc: 'Your compliance score is healthy. Upload tax notices or vendor contracts to audit custom obligations.',
        action: 'Upload Contract Document',
        link: '/documents'
      });
    }

    return recs;
  };

  const aiRecommendations = getAiRecommendations();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance Workspace</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back. Here is your company compliance status overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Query Copilot
          </Link>
          <Link
            href="/documents"
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-card-foreground hover:bg-secondary flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Scan Document
          </Link>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Score Gauge */}
        <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compliance Score</span>
            <CheckCircle className={`w-5 h-5 ${company.compliance_score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{company.compliance_score}%</span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3 h-3" />
              Healthy
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                company.compliance_score >= 80 
                  ? 'bg-emerald-500' 
                  : company.compliance_score >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
              }`}
              style={{ width: `${company.compliance_score}%` }}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Risk</span>
            <ShieldAlert className={`w-5 h-5 ${company.risk_score > 30 ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{company.risk_score}%</span>
            <span className="text-[10px] text-amber-500 font-bold">
              {company.risk_score > 30 ? 'Critical Attention' : 'Moderate Surcharges'}
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                company.risk_score > 50 
                  ? 'bg-rose-500' 
                  : company.risk_score > 20 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${company.risk_score}%` }}
            />
          </div>
        </div>

        {/* Pending Tasks count */}
        <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Tasks</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{activeCompliances.length}</span>
            <span className="text-xs text-muted-foreground">
              {overdue.length} Overdue • {pending.length + upcoming.length} Upcoming
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium">Keep list cleared to maximize score</p>
        </div>

        {/* Penalties Accrued */}
        <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Late Fees / Penalties</span>
            <AlertTriangle className={`w-5 h-5 ${totalPenalties > 0 ? 'text-rose-500' : 'text-muted-foreground'}`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${totalPenalties > 0 ? 'text-rose-500' : 'text-foreground'}`}>
              {formatCurrency(totalPenalties)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium">Accumulating interest under GST / EPF Act</p>
        </div>
      </div>

      {/* Grid: Calendar, Deadlines, AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* High Priority Deadlines */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Critical Deadlines ({highPriority.length})
              </h3>
              <Link href="/tracker" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
                Full Tracker
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="p-5 divide-y divide-border">
              {highPriority.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No high priority items pending. Good work!
                </div>
              ) : (
                highPriority.map((comp, idx) => (
                  <div key={comp.id} className={`py-3.5 flex justify-between items-center ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground block">{comp.title}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                          comp.status === 'overdue' 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/25' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                        }`}>
                          {comp.status.toUpperCase()}
                        </span>
                        <span className="px-1.5 py-0.2 text-[8px] rounded bg-secondary text-muted-foreground uppercase font-bold">
                          {comp.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal max-w-lg">{comp.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-foreground block">{formatDate(comp.due_date)}</span>
                      {comp.penalty_amount > 0 && (
                        <span className="text-[9px] text-rose-500 font-semibold block mt-0.5">
                          Fine: {formatCurrency(comp.penalty_amount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Auditing Feed */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                AI Compliance recommendations
              </h3>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Real-time Analysis</span>
            </div>
            
            <div className="p-5 space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-lg bg-secondary/30 border border-border/60 flex items-start gap-3.5 relative group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">{rec.title}</span>
                    <p className="text-[11px] text-muted-foreground leading-normal mt-1 max-w-xl">{rec.desc}</p>
                    <Link
                      href={rec.link}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline mt-2.5"
                    >
                      {rec.action}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Summary Panel */}
        <div className="space-y-6">
          {/* Quick Metrics Calendar Summary */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Compliance Health Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Active Employees:</span>
                <span className="font-semibold text-foreground">{company.employee_count}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">State Audit Context:</span>
                <span className="font-semibold text-foreground">{company.state}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">GSTIN Registered:</span>
                <span className="font-mono font-semibold text-foreground">{company.gst_number || 'N/A'}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Completed Tasks:</span>
                <span className="font-semibold text-emerald-500">
                  {compliances.filter(c => c.status === 'completed').length} / {compliances.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Active Overdue Tasks:</span>
                <span className="font-semibold text-rose-500">{overdue.length}</span>
              </div>
            </div>
          </div>

          {/* Setup / Sandbox Status */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">Evaluator Guideline</span>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 leading-normal">
              To trigger dynamic compliance scores and simulate overdue penalties, go to the <strong>Company Profile</strong> page and alter the state or staff count. The AI will recalculate checklists and penalties dynamically.
            </p>
            <Link
              href="/profile"
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Go to Profile Setup
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
