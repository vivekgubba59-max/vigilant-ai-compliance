'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Layout/AppContext';
import { Building, ShieldCheck, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { callGeminiAgent } from '@/lib/gemini';
import { LocalDatabase } from '@/lib/database';

export default function CompanyProfilePage() {
  const router = useRouter();
  const { company, updateCompany, apiKey, saveApiKey } = useApp();
  
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [state, setState] = useState(company.state);
  const [employeeCount, setEmployeeCount] = useState(company.employee_count);
  const [gstNumber, setGstNumber] = useState(company.gst_number);
  const [licenses, setLicenses] = useState(company.licenses);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setApiKeyInput(apiKey);
  }, [apiKey]);

  const industries = [
    'Manufacturing',
    'IT Services',
    'Food & Beverage',
    'Retail & E-Commerce',
    'Healthcare & Pharma',
    'Construction & Real Estate'
  ];

  const states = [
    'Karnataka',
    'Maharashtra',
    'Delhi',
    'Tamil Nadu',
    'Telangana',
    'Gujarat',
    'West Bengal',
    'Uttar Pradesh'
  ];

  const handleLicenseToggle = (key: keyof typeof licenses) => {
    setLicenses({
      ...licenses,
      [key]: !licenses[key]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboarding(true);
    setStatusMessage('Analyzing regulatory framework for your industry...');

    try {
      // Save Google Gemini API Key first
      saveApiKey(apiKeyInput);

      const updated = {
        ...company,
        name,
        industry,
        state,
        employee_count: Number(employeeCount),
        gst_number: gstNumber,
        licenses
      };

      // Call context update
      updateCompany(updated);

      // Trigger compliance checklist generation
      setStatusMessage('Simulating AI Auditor checks under Indian corporate legislations...');
      
      const newObligations = await callGeminiAgent('recommend', {
        industry,
        state,
        employeeCount: Number(employeeCount),
        licenses
      });

      // Save generated compliances
      if (newObligations && newObligations.length > 0) {
        LocalDatabase.saveCompliances(newObligations);
        // Force context update of scores
        updateCompany(updated);
      }

      setStatusMessage('Compliance dashboard successfully generated!');
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setStatusMessage('Error setting up compliance profile. Continuing to dashboard...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } finally {
      setIsOnboarding(false);
    }
  };

  // Auto detect licenses based on employee count/industry
  useEffect(() => {
    // PF is mandatory for >= 20 employees, ESI for >= 10 employees in non-seasonal factories
    const nextLicenses = { ...licenses };
    if (employeeCount >= 20) {
      nextLicenses.pf = true;
    }
    if (employeeCount >= 10) {
      nextLicenses.esi = true;
    }
    if (industry === 'Food & Beverage') {
      nextLicenses.fssai = true;
    } else {
      nextLicenses.fssai = false;
    }
    if (industry === 'Manufacturing') {
      nextLicenses.factory = true;
      nextLicenses.pcb = true;
    }
    setLicenses(nextLicenses);
  }, [employeeCount, industry]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      {/* Onboarding Loading Overlay */}
      {isOnboarding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center">
          <div className="p-6 max-w-sm rounded-2xl bg-card border border-border flex flex-col items-center justify-center shadow-2xl">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">Analyzing Profile Obligations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed animate-pulse">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          Company Profile Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provide your business coordinates. Vigilant AI builds your real-time compliance tracker based on these credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Form */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Registered Corporate Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AeroCraft Manufacturing Pvt Ltd"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Industry Vertical
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  State of Registration
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {states.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Employee Count
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  GST Number (GSTIN)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Optional. If empty, the system will fall back to server-configured environment variables.
                </p>
              </div>
            </div>

            {/* License Configuration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Active Licenses & Mandatory Registrations
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'gst', name: 'GSTIN Registration', desc: 'Allows goods & services taxation' },
                  { key: 'pf', name: 'Employees Provident Fund (EPF)', desc: 'Mandatory for payroll with 20+ staff' },
                  { key: 'esi', name: 'Employee State Insurance (ESIC)', desc: 'Mandatory for payroll with 10+ staff' },
                  { key: 'fssai', name: 'FSSAI License', desc: 'Food operations licensing' },
                  { key: 'pcb', name: 'Pollution Control Board Consent', desc: 'Air/Water pollution certification' },
                  { key: 'factory', name: 'Factories Act License', desc: 'Manufacturing plant operations' },
                ].map((lic) => {
                  const isActive = licenses[lic.key as keyof typeof licenses];
                  return (
                    <button
                      type="button"
                      key={lic.key}
                      onClick={() => handleLicenseToggle(lic.key as keyof typeof licenses)}
                      className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-500/5 text-foreground' 
                          : 'border-border bg-background/50 hover:bg-secondary/40 text-muted-foreground'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-border'
                      }`}>
                        {isActive && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block text-foreground">{lic.name}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">{lic.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/10 focus:outline-none hover:scale-[1.01] transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                Initialize AI Audit Dashboard
              </button>
            </div>
          </form>
        </div>

        {/* Informative Side-card */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Auditor Insights
            </h3>
            
            <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">EPF Threshold Alert:</strong> EPF registration is mandatory in India when employees reach 20. Non-compliance results in damages under Sec 14B.
              </li>
              <li>
                <strong className="text-foreground">ESIC Health Insurance:</strong> Required for non-seasonal factories or commercial institutions employing 10 or more employees drawing wages up to ₹21,000/month.
              </li>
              <li>
                <strong className="text-foreground">PCB Environment:</strong> Industries are classified into Red, Orange, Green, and White categories. Consent to Establish (CTE) and Consent to Operate (CTO) must be updated.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-600 dark:text-amber-400">
            <span className="font-semibold block mb-1">Interactive Sandbox Tip:</span>
            Changing employee count or vertical automatically configures license recommendations. Saving will trigger the Gemini engine to rebuild compliance checklists.
          </div>
        </div>
      </div>
    </div>
  );
}
