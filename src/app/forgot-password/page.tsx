'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please fill in your email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 relative selection:bg-blue-600/30">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 shadow-xl shadow-blue-500/20 text-white">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-xl text-white block">Vigilant AI</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Regulatory Intelligence</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-1 text-center">Reset Password</h2>
        
        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300">
              If an account exists for <strong>{email}</strong>, we have dispatched a password recovery email.
            </p>
            <div className="pt-2">
              <Link 
                href="/login" 
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 w-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 text-center mb-6">
              Enter your email address and we will dispatch a passcode reset link.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@company.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                Send Recovery Link
              </button>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all text-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
