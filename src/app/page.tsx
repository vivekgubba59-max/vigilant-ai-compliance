import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle2, Cpu, FileSpreadsheet, Bot, Languages, Mic } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-blue-600/30 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-500/20 text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white block">Vigilant AI</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Compliance Copilot</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-all">
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex-1 flex flex-col items-center justify-center">
        {/* Startup Pitch Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium mb-6">
          <Cpu className="w-3.5 h-3.5" />
          AI-Powered Compliance Management Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl">
          AI-Powered Compliance Management for Indian Businesses
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          Automate GST, EPF, ESI, Labour Law, Factory Act and Regulatory Compliance with intelligent reminders and real-time compliance tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link 
            href="/signup" 
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-semibold shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/login" 
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-semibold flex items-center justify-center gap-2 hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Grid preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-8">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Gemini Compliance Agent</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Understand complex tax rulings and labor mandates instantly. Generate structured checklists automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Automated OCR Extract</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drag-and-drop tax notices or rental agreements. The AI parses deadlines, fine structures, and queues calendar tracker tasks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Multilingual Voice Agent</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask compliance queries using your voice. Conversational responses fully localizable into English, Hindi, and Telugu.
            </p>
          </div>
        </div>
      </section>

      {/* Trust factors */}
      <section className="border-t border-white/5 bg-slate-950/50 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-semibold uppercase tracking-wider text-center md:text-left">
          <span>Supported Obligation Frameworks:</span>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-2 md:mt-0 text-white/70">
            <span className="hover:text-white transition-all">GST & Customs</span>
            <span className="hover:text-white transition-all">EPF & ESIC</span>
            <span className="hover:text-white transition-all">Labour Laws</span>
            <span className="hover:text-white transition-all">Factories Act</span>
            <span className="hover:text-white transition-all">FSSAI & PCB</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-slate-500 text-xs mt-auto">
        <p>© 2026 Vigilant AI Technologies Private Limited. All rights reserved.</p>
        <p className="mt-1 text-slate-600">Built as an Intelligent Agent SaaS Prototype for Next-Generation SME Automation.</p>
      </footer>
    </div>
  );
}
