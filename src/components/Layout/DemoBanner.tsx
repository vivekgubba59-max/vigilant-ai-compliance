'use client';

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { ShieldCheck, ToggleLeft, ToggleRight, Key, Settings, X } from 'lucide-react';

export default function DemoBanner() {
  const { isDemoMode, toggleDemoMode, apiKey, saveApiKey } = useApp();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(inputKey);
    setShowKeyModal(false);
  };

  return (
    <>
      <div className={`w-full py-2 px-4 flex flex-wrap items-center justify-between text-xs font-medium transition-all duration-300 ${
        isDemoMode 
          ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border-b border-amber-500/30 text-amber-600 dark:text-amber-400' 
          : 'bg-gradient-to-r from-emerald-500/20 via-emerald-600/20 to-emerald-500/20 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 animate-pulse" />
          <span>
            {isDemoMode 
              ? 'Evaluating in Interactive Demo Mode (Simulated AI & Local Storage database active)' 
              : 'Production Mode Active (Live Gemini AI client initialized)'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <button 
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 hover:underline decoration-dashed outline-none"
          >
            <Key className="w-3.5 h-3.5" />
            {apiKey ? 'Update API Key' : 'Configure Gemini API Key'}
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="opacity-70">Demo Mode:</span>
            <button 
              onClick={toggleDemoMode}
              className="focus:outline-none transition-transform hover:scale-105"
              aria-label="Toggle Demo Mode"
            >
              {isDemoMode ? (
                <ToggleRight className="w-6 h-6 text-amber-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-emerald-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 mx-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Configure Google Gemini API
              </h3>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Enter your Google AI Studio API Key. If left empty, the agent operates in <strong>Interactive Demo Mode</strong> with a smart fallback client-side compliance response engine.
            </p>

            <form onSubmit={handleSubmitKey} className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-secondary border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
