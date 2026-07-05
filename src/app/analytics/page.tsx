'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Layout/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Download, 
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { callGeminiAgent } from '@/lib/gemini';
import { formatCurrency, formatDate } from '@/lib/utils';

// Helper to render bold text like **Overall Compliance** inside list items/paragraphs
function parseBoldText(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-foreground font-bold">{part}</strong>;
    }
    return part;
  });
}

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = (key: number) => {
    if (tableRows.length === 0 && tableHeader.length === 0) return null;
    
    const el = (
      <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              {tableHeader.map((cell, i) => (
                <th key={i} className="p-2.5 font-bold text-foreground">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-secondary/30 transition-all odd:bg-secondary/10">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-muted-foreground font-medium">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableHeader = [];
    tableRows = [];
    inTable = false;
    return el;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect Table Row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        // Parse header row
        tableHeader = line.split('|').slice(1, -1);
      } else {
        // Skip separator row | :--- | :--- |
        if (line.includes(':---') || line.includes('---:')) {
          continue;
        }
        // Parse data row
        tableRows.push(line.split('|').slice(1, -1));
      }
    } else {
      // If we were in a table and hit a non-table line, flush it
      if (inTable) {
        const tableElement = flushTable(i);
        if (tableElement) renderedElements.push(tableElement);
      }

      if (line === '') {
        continue;
      }

      if (line.startsWith('# ')) {
        renderedElements.push(
          <h1 key={i} className="text-sm font-extrabold border-b border-border pb-1 pt-3 text-foreground uppercase tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        renderedElements.push(
          <h2 key={i} className="text-xs font-bold pt-3 text-foreground uppercase tracking-wider flex items-center gap-1">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        renderedElements.push(
          <h3 key={i} className="text-[11px] font-semibold pt-1 text-foreground">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        const text = line.replace('- ', '');
        renderedElements.push(
          <li key={i} className="list-disc ml-4 mt-0.5 text-muted-foreground">
            {parseBoldText(text)}
          </li>
        );
      } else {
        renderedElements.push(
          <p key={i} className="text-muted-foreground">
            {parseBoldText(line)}
          </p>
        );
      }
    }
  }

  // Flush any remaining table at the end of content
  if (inTable) {
    const tableElement = flushTable(lines.length);
    if (tableElement) renderedElements.push(tableElement);
  }

  return renderedElements;
}

export default function AnalyticsPage() {
  const { compliances, company } = useApp();
  const [mounted, setMounted] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats
  const completed = compliances.filter(c => c.status === 'completed').length;
  const pending = compliances.filter(c => c.status === 'pending').length;
  const overdue = compliances.filter(c => c.status === 'overdue').length;
  const upcoming = compliances.filter(c => c.status === 'upcoming').length;

  const total = compliances.length || 1;
  const complianceRate = Math.round((completed / total) * 100);

  // Chart 1: Tasks distribution data
  const pieData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#3b82f6' },
    { name: 'Overdue', value: overdue, color: '#ef4444' },
    { name: 'Upcoming', value: upcoming, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Chart 2: Category distribution data
  const categoryCount = compliances.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(categoryCount).map(key => ({
    name: key,
    tasks: categoryCount[key]
  }));

  // Chart 3: Compliance score progress trend (Mocked historical milestones)
  const lineData = [
    { month: 'Jan', score: 65, benchmark: 70 },
    { month: 'Feb', score: 70, benchmark: 70 },
    { month: 'Mar', score: 68, benchmark: 72 },
    { month: 'Apr', score: 72, benchmark: 72 },
    { month: 'May', score: 75, benchmark: 74 },
    { month: 'Jun', score: company.compliance_score, benchmark: 75 }
  ];

  // AI Report Generator trigger
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate Gemini API report writing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const totalFines = compliances
        .filter(c => c.status === 'overdue')
        .reduce((sum, c) => sum + c.penalty_amount, 0);

      const overdueCount = compliances.filter(c => c.status === 'overdue').length;
      const pendingCount = compliances.filter(c => c.status === 'pending').length;

      let statusDescription = 'Excellent';
      if (complianceRate < 60) statusDescription = 'Critical Alert';
      else if (complianceRate < 80) statusDescription = 'Needs Improvement';
      else if (complianceRate < 95) statusDescription = 'Good Standing';

      let reportContent = '';

      if (reportType === 'summary') {
        reportContent = `# VIGILANT AI - CORPORATE COMPLIANCE REPORT
**Entity:** ${company.name}
**Industry:** ${company.industry} | **State:** ${company.state}
**Audit Period:** Q2 2026 | **Generated On:** ${new Date().toLocaleDateString('en-IN')}

---

## 1. Executive Summary
Vigilant AI has performed a compliance intelligence audit of **${company.name}** operational records under Indian statutory frameworks. Based on registered staff thresholds and license categories, the overall rating has been calculated. Immediate settlement of overdue tasks is recommended.

## 2. Compliance Score & Status
| Metric | Value | Audit Category |
| :--- | :--- | :--- |
| **Overall Compliance Score** | ${complianceRate}% | ${statusDescription} |
| **Compliance Status** | Active Audit | Monitored |
| **Risk Score / Exposure** | ${company.risk_score}/100 | ${company.risk_score > 30 ? 'Moderate' : 'Low'} |
| **Staff Count** | ${company.employee_count} | EPF / ESIC Obligation Threshold |

## 3. Key Findings & Violations Identified
- **ESIC Contribution Challan Payment:** Currently **OVERDUE** since June 15. Accumulated active penalty of ${formatCurrency(totalFines)} accrued under Section 85-B of the ESIC Act.
- **GST Invoice Reconciliation:** GSTR-1 filings are matching, but discrepancies are detected between GSTR-2B purchase registers and GSTR-3B summaries.

## 4. Applicable Regulations
- **GST Regulations:** Central Goods and Services Tax Act, 2017 (Sec 37 - GSTR-1, Sec 39 - GSTR-3B).
- **Provident Fund:** Employees' Provident Funds & Miscellaneous Provisions Act, 1952.
- **Employee Insurance:** Employees' State Insurance Act, 1948.
- **Factory Safety:** Factories Act, 1948 (State safety muster rolls).

## 5. Risk Assessment & Priority Level
- **Critical Risk (High Exposure):** Non-payment of ESIC. Priority: **HIGH**. Exposure: Surcharges, legal interest notices.
- **Moderate Risk (Medium Exposure):** Input Tax Credit discrepancy. Priority: **MEDIUM**. Exposure: Portal block of outbound invoice filing.

## 6. Recommended Actions & Timeline
| Recommended Action | Priority Level | Target Timeline | Responsible Party |
| :--- | :--- | :--- | :--- |
| Deposit pending ESIC monthly contributions | **HIGH** | Within 48 Hours | Payroll Manager |
| File GSTR-2B discrepancy response | **MEDIUM** | Before July 15 | GST Auditor |
| Maintain Form 21 Factory Safety muster roll | **LOW** | July 28 | Supervisor |

## 7. AI Insights
The platform predicts a 7% reduction in statutory risks by automating invoice audits. Immediate implementation of electronic ECR challan verification will prevent recurring payroll penalties.

## 8. Final Conclusion
The operational regulatory stance is solid at ${complianceRate}%, but requires immediate settlement of the ${overdueCount} overdue items to prevent prosecution and interest penalty accumulation. Corrective actions must be taken on the active GST notice before July 15 to safeguard commercial transactions.`;
      } else if (reportType === 'risk') {
        reportContent = `# VIGILANT AI - RISK ASSESSMENT REPORT
**Entity:** ${company.name}
**Industry:** ${company.industry} | **State:** ${company.state}
**Audit Period:** Q2 2026 | **Generated On:** ${new Date().toLocaleDateString('en-IN')}

---

## 1. Executive Summary
This risk assessment details current statutory exposures for **${company.name}** under active GST, PF, and Labour legislations. Risk parameters are weighted by employee counts and state-specific inspection histories.

## 2. Compliance Score & Status
| Metric | Value | Audit Category |
| :--- | :--- | :--- |
| **Risk Score / Exposure** | ${company.risk_score}/100 | ${company.risk_score > 30 ? 'Moderate Risk Exposure' : 'Low Risk Exposure'} |
| **Active Fines / Liabilities** | ${formatCurrency(totalFines)} | Accruing daily interest |
| **Compliance Rating** | ${complianceRate}% | Status: Active Audit |

## 3. Key Findings & Violations Identified
- **ESIC Contribution Surcharges:** Delay of over 20 days in ESI monthly deposit challan, resulting in Section 85 penalty damages.
- **GST ITC Reconciliation Discrepancy:** Potential suspension of GSTR-1 billing due to unmatched vendor uploads.

## 4. Applicable Regulations
- **Employees' State Insurance Act, 1948:** Penalty interest under Section 85-B and damages under Section 97.
- **CGST Act, 2017:** Section 37 outbound returns block under Rule 59(6) for discrepancy defaults.

## 5. Risk Assessment & Priority Level
- **Critical Risk (High Exposure):** Non-payment of ESIC. Priority: **HIGH**. Exposure: Surcharges, legal notices under Section 85.
- **Moderate Risk (Medium Exposure):** Input Tax Credit discrepancy. Priority: **MEDIUM**. Exposure: Portal block of outbound invoice filing.

## 6. Recommended Actions & Timeline
| Recommended Action | Priority Level | Target Timeline | Responsible Party |
| :--- | :--- | :--- | :--- |
| Deposit pending ESIC monthly contributions | **HIGH** | Within 48 Hours | Payroll Manager |
| File GSTR-2B discrepancy response | **MEDIUM** | Before July 15 | GST Auditor |
| Maintain Form 21 Factory Safety muster roll | **LOW** | July 28 | Supervisor |

## 7. AI Insights
By automating GSTR-2B invoice comparisons, the platform predicts a 7% increase in cash flow reconciliation speed by eliminating unmatched vendor transactions. Transitioning to automatic ECR payroll deposits will prevent future ESIC penalty occurrences.

## 8. Final Conclusion
The operational regulatory stance is solid at ${complianceRate}%, but requires immediate settlement of the ${overdueCount} overdue items to prevent prosecution and interest penalty accumulation. Corrective actions must be taken on the active GST notice before July 15 to safeguard commercial transactions.`;
      } else {
        reportContent = `# VIGILANT AI - OPERATIONAL COMPLIANCE AUDIT
**Entity:** ${company.name}
**Industry:** ${company.industry} | **State:** ${company.state}
**Audit Period:** Q2 2026 | **Generated On:** ${new Date().toLocaleDateString('en-IN')}

---

## 1. Executive Summary
This checklist document serves as a detailed operational log for **${company.name}** compliance activities. These items have been audited and updated in real-time.

## 2. Compliance Score & Status
| Metric | Value | Audit Category |
| :--- | :--- | :--- |
| **Overall Compliance Score** | ${complianceRate}% | ${statusDescription} |
| **Active Tasks Pending** | ${compliances.filter(c => c.status !== 'completed').length} | Monitored |
| **Completed Obligations** | ${compliances.filter(c => c.status === 'completed').length} | Cleared |

## 3. Key Findings & Violations Identified
- **ESIC Contribution Challan Payment:** Currently **OVERDUE** since June 15. Accumulated active penalty of ${formatCurrency(totalFines)} accrued under Section 85-B of the ESIC Act.
- **GST Invoice Reconciliation:** GSTR-1 filings are matching, but discrepancies are detected between GSTR-2B purchase registers and GSTR-3B summaries.

## 4. Applicable Regulations
- **GST Regulations:** Central Goods and Services Tax Act, 2017 (Sec 37 - GSTR-1, Sec 39 - GSTR-3B).
- **Provident Fund:** Employees' Provident Funds & Miscellaneous Provisions Act, 1952.
- **Employee Insurance:** Employees' State Insurance Act, 1948.
- **Factory Safety:** Factories Act, 1948 (State safety muster registers).

## 5. Risk Assessment & Priority Level
- **Critical Risk (High Exposure):** Non-payment of ESIC. Priority: **HIGH**. Exposure: Surcharges, legal interest notices.
- **Moderate Risk (Medium Exposure):** Input Tax Credit discrepancy. Priority: **MEDIUM**. Exposure: Portal block of outbound invoice filing.

## 6. Recommended Actions & Timeline
| Recommended Action | Priority Level | Target Timeline | Responsible Party |
| :--- | :--- | :--- | :--- |
| Deposit pending ESIC monthly contributions | **HIGH** | Within 48 Hours | Payroll Manager |
| File GSTR-2B discrepancy response | **MEDIUM** | Before July 15 | GST Auditor |
| Maintain Form 21 Factory Safety muster roll | **LOW** | July 28 | Supervisor |

## 7. AI Insights
The platform predicts a 7% reduction in statutory risks by automating invoice audits. Immediate implementation of electronic ECR challan verification will prevent recurring payroll penalties.

## 8. Final Conclusion
The operational regulatory stance is solid at ${complianceRate}%, but requires immediate settlement of the ${overdueCount} overdue items to prevent prosecution and interest penalty accumulation. Corrective actions must be taken on the active GST notice before July 15 to safeguard commercial transactions.`;
      }

      setGeneratedReport(reportContent);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Compliance Analytics & Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Monitor historical compliance scores, category distributions, and compile customized audit reports.
          </p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Compliance Rating</span>
            <span className="text-xl font-extrabold text-foreground block">{complianceRate}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">SME Risk Index</span>
            <span className="text-xl font-extrabold text-foreground block">{company.risk_score}/100</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Benchmarked Rank</span>
            <span className="text-xl font-extrabold text-foreground block">Top 15%</span>
          </div>
        </div>
      </div>

      {/* Grid: Recharts Visualizations */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historical Trend Line Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Compliance score history</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} name="Your Score" />
                  <Line type="monotone" dataKey="benchmark" stroke="#9ca3af" strokeDasharray="5 5" name="SME Average" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Status Distribution Pie */}
          <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Pending Task Breakdowns</h3>
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Score Display in center */}
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-foreground">{complianceRate}%</span>
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">Health Rate</span>
              </div>
            </div>

            {/* Labels Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Load Distributions Bar Chart */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Task Distributions by Regulation Category</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', fontSize: '10px' }} />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Auditor Audit Report Generator Panel */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI Auditor - Compliance Report Synthesizer
          </h3>
          <span className="text-[9px] font-bold uppercase text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded">
            Gemini SDK
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report configuration selector */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Select Audit Document Type</span>
            
            <div className="space-y-2">
              {[
                { type: 'summary', name: 'Executive Compliance Summary', desc: 'Overview of rating, core issues, and filings status' },
                { type: 'risk', name: 'Surcharges & Risk Assessment', desc: 'Calculates active penalties and statutory exposures' },
                { type: 'audit', name: 'Standard Compliance Audit Checklist', desc: 'Lists full checklist log history and deadlines' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setReportType(opt.type)}
                  className={`w-full p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    reportType === opt.type
                      ? 'border-blue-500 bg-blue-500/5 text-foreground'
                      : 'border-border bg-background hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${reportType === opt.type ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">{opt.name}</span>
                    <span className="text-[9px] text-muted-foreground block leading-tight mt-0.5">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Report
                </>
              )}
            </button>
          </div>

          {/* Generated report panel display */}
          <div className="md:col-span-2 rounded-lg border border-border bg-background p-5 relative min-h-64 flex flex-col justify-between max-h-[400px] overflow-y-auto print:border-none print:bg-white print:text-black">
            {generatedReport ? (
              <div className="space-y-4 flex-1">
                {/* Print action icons */}
                <div className="flex justify-end gap-2 border-b border-border pb-3 mb-3 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 text-[10px] font-semibold"
                    title="Print / Save PDF"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print PDF
                  </button>
                </div>

                {/* Print-only Header */}
                <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-2 mb-6 w-full text-[10px] text-slate-500 font-sans">
                  <span className="font-bold">{company.name}</span>
                  <span className="uppercase font-semibold">Compliance Audit & Risk Analysis</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                </div>

                <div 
                  id="printed-report-area" 
                  className="text-xs space-y-3 leading-relaxed font-sans text-foreground select-text print:text-xs"
                >
                  {renderMarkdown(generatedReport)}
                </div>

                {/* Print-only Footer */}
                <div className="hidden print:block border-t border-slate-300 pt-2 mt-8 w-full text-[9px] text-slate-400 text-center font-sans">
                  <span>Page 1 of 1 • Vigilant AI Auditor Framework</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-12">
                <FileSpreadsheet className="w-10 h-10 text-slate-400" />
                <h4 className="text-xs font-bold text-foreground">Ready to Synthesize Report</h4>
                <p className="text-[10px] text-muted-foreground max-w-xs leading-normal">
                  Configure the type of report you require on the left pane and trigger the AI compilation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
