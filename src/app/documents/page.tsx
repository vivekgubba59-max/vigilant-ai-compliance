'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/Layout/AppContext';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ListChecks, 
  Sparkles,
  ArrowRight,
  Info,
  CalendarRange,
  Search,
  Plus,
  Trash2,
  Save,
  MessageSquare
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DocumentUploadPage() {
  const { documents, uploadDocument, updateDocument, isLoading } = useApp();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );
  
  // Local state for searching the document archive
  const [archiveSearch, setArchiveSearch] = useState('');

  const activeDoc = documents.find(d => d.id === selectedDocId) || (documents.length > 0 ? documents[0] : null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    simulateUpload(file.name, file.size);
  };

  const simulateUpload = async (name: string, size: number) => {
    await uploadDocument(name, size);
    // Sync active document selection to the newly created document
    const updatedDocs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vigilant_documents') || '[]') : [];
    if (updatedDocs.length > 0) {
      setSelectedDocId(updatedDocs[0].id);
    }
  };

  // Preset file mocks to trigger OCR instantly for evaluations
  const presets = [
    { name: 'GSTR_Notice_DRC_01C_June.pdf', size: 1542000, desc: 'GST Mismatch Notice' },
    { name: 'Commercial_Lease_Agreement.docx', size: 843000, desc: 'Corporate Rent Lease Contract' },
    { name: 'Factories_Act_Inspection_Report.pdf', size: 2150000, desc: 'Industrial Plant Audit Notice' }
  ];

  // Search Filter logic for Document archive
  const filteredDocs = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  // --- Editable Handlers ---
  const handleRenameFile = (newName: string) => {
    if (!activeDoc) return;
    updateDocument({
      ...activeDoc,
      file_name: newName
    });
  };

  const handleUpdateSummary = (newSummary: string) => {
    if (!activeDoc) return;
    updateDocument({
      ...activeDoc,
      summary: newSummary
    });
  };

  const handleUpdateChecklist = (index: number, val: string) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextChecklists = [...(activeDoc.extracted_data.checklists || [])];
    nextChecklists[index] = val;
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        checklists: nextChecklists
      }
    });
  };

  const handleAddChecklistItem = () => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextChecklists = [...(activeDoc.extracted_data.checklists || []), 'New custom requirement checklist item'];
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        checklists: nextChecklists
      }
    });
  };

  const handleRemoveChecklistItem = (index: number) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextChecklists = (activeDoc.extracted_data.checklists || []).filter((_, i) => i !== index);
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        checklists: nextChecklists
      }
    });
  };

  const handleUpdateActionItem = (index: number, val: string) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextActions = [...(activeDoc.extracted_data.action_items || [])];
    nextActions[index] = val;
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        action_items: nextActions
      }
    });
  };

  const handleUpdateDeadline = (index: number, field: 'title' | 'date', val: string) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextDeadlines = [...(activeDoc.extracted_data.deadlines || [])];
    nextDeadlines[index] = {
      ...nextDeadlines[index],
      [field]: val
    };
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        deadlines: nextDeadlines
      }
    });
  };

  const handleUpdatePenalty = (index: number, field: 'violation' | 'amount', val: any) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const nextPenalties = [...(activeDoc.extracted_data.penalties || [])];
    nextPenalties[index] = {
      ...nextPenalties[index],
      [field]: field === 'amount' ? Number(val) : val
    };
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        penalties: nextPenalties
      }
    });
  };

  const handleUpdateWarning = (val: string) => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    updateDocument({
      ...activeDoc,
      extracted_data: {
        ...activeDoc.extracted_data,
        warnings: [val]
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          AI Document Inspector
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
          Upload notices, letters, or contracts. Review, edit, and audit details extracted by the Gemini compliance agent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Upload Area, Presets & Searchable Archive */}
        <div className="space-y-6">
          {/* Drag & Drop Card */}
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center hover:bg-secondary/20 transition-all relative">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Click to upload files or drag & drop</p>
                <p className="text-[10px] text-muted-foreground">PDF, DOCX, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Presets Panel */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Demo Presets (Instant OCR Audit)
            </h3>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Click any of the preset files below to simulate live Gemini OCR extraction, automatic task generation, and risk categorization.
            </p>
            <div className="space-y-2 pt-1">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => simulateUpload(p.name, p.size)}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-blue-600/5 hover:border-blue-500/30 text-left flex items-center justify-between text-[11px] group transition-all"
                >
                  <span className="font-semibold text-foreground truncate group-hover:text-blue-500">{p.name}</span>
                  <span className="text-[9px] text-muted-foreground px-2 py-0.5 rounded bg-background flex-shrink-0">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Searchable File Archives Library */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b border-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Uploaded Documents Archive</h3>
              
              {/* Search Bar - Specific Requirement */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter uploaded files..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-background text-[11px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching files found.
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                      activeDoc?.id === doc.id
                        ? 'bg-blue-600/10 border border-blue-500/20 text-foreground'
                        : 'border border-transparent hover:bg-secondary/40 text-muted-foreground'
                    }`}
                  >
                    <FileText className={`w-4 h-4 flex-shrink-0 ${activeDoc?.id === doc.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div className="overflow-hidden flex-1">
                      <span className="text-xs font-semibold text-foreground block truncate">{doc.file_name}</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Details */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Gemini OCR Engine Running</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Digitizing text, identifying statutory violations, pulling deadline coordinates, and formulating action plans...
                </p>
              </div>
            </div>
          ) : activeDoc ? (
            <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
              {/* Doc Details Header */}
              <div className="p-5 border-b border-border bg-secondary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Audited Document Analysis</span>
                  {/* File Name Input (Editable Requirement) */}
                  <input
                    type="text"
                    value={activeDoc.file_name}
                    onChange={(e) => handleRenameFile(e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-border text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 py-0.5"
                    title="Rename Document"
                  />
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 self-start sm:self-auto">
                  AI Inspected
                </span>
              </div>

              {/* Editable Summary Section */}
              <div className="p-5 border-b border-border space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500" /> AI Executive Summary
                </span>
                {/* Editable Summary textarea */}
                <textarea
                  value={activeDoc.summary || ''}
                  onChange={(e) => handleUpdateSummary(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                  rows={3}
                  placeholder="Extracted document summary..."
                />
              </div>

              {/* Extracted Details Grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checklists and Action Items */}
                <div className="space-y-6">
                  {/* Checklist Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-blue-500" /> Extracted Compliance Checklist
                      </h4>
                      {/* Add Checklist button */}
                      <button
                        onClick={handleAddChecklistItem}
                        className="p-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Add Checklist Item"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 checklist-container">
                      {(activeDoc.extracted_data?.checklists || []).map((item, idx) => (
                        <div key={idx} className="p-2 border border-border bg-background rounded-lg flex items-center gap-2 relative group">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          {/* Compliance checklist input */}
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateChecklist(idx, e.target.value)}
                            className="checklist-item-input flex-1 bg-transparent border-none text-[11px] font-semibold text-foreground focus:outline-none p-0 pr-6"
                          />
                          <button
                            onClick={() => handleRemoveChecklistItem(idx)}
                            className="absolute right-2 p-1 text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Steps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Recommended Action Steps</h4>
                    <div className="space-y-2">
                      {(activeDoc.extracted_data?.action_items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="w-4 h-4 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateActionItem(idx, e.target.value)}
                            className="w-full bg-transparent border-b border-border text-xs text-foreground focus:outline-none focus:border-blue-500 py-0.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deadlines, Penalties & Warnings */}
                <div className="space-y-6">
                  {/* Compliance Deadlines list */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                      <CalendarRange className="w-4 h-4 text-amber-500" /> Compliance Deadlines
                    </h4>
                    <div className="space-y-2">
                      {(activeDoc.extracted_data?.deadlines || []).map((dl, idx) => (
                        <div key={idx} className="p-2 border border-amber-500/10 bg-amber-500/5 rounded-lg flex flex-col gap-1.5">
                          <input
                            type="text"
                            value={dl.title}
                            onChange={(e) => handleUpdateDeadline(idx, 'title', e.target.value)}
                            className="w-full bg-transparent border-none text-[11px] font-semibold text-foreground focus:outline-none p-0"
                            placeholder="Deadline Action Title"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-muted-foreground">Select Due Date:</span>
                            <input
                              type="date"
                              value={dl.date}
                              onChange={(e) => handleUpdateDeadline(idx, 'date', e.target.value)}
                              className="bg-transparent border-none text-[10px] font-bold text-amber-600 dark:text-amber-400 focus:outline-none p-0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Identified Penalty Liabilities */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Identified Penalty Liabilities
                    </h4>
                    <div className="space-y-2">
                      {(activeDoc.extracted_data?.penalties || []).map((p, idx) => (
                        <div key={idx} className="p-2 border border-rose-500/10 bg-rose-500/5 rounded-lg flex gap-3 items-center justify-between">
                          <input
                            type="text"
                            value={p.violation}
                            onChange={(e) => handleUpdatePenalty(idx, 'violation', e.target.value)}
                            className="flex-1 bg-transparent border-none text-[11px] font-semibold text-foreground focus:outline-none p-0 pr-2"
                            placeholder="Violation description"
                          />
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 flex-shrink-0">
                            <span>₹</span>
                            <input
                              type="number"
                              value={p.amount}
                              onChange={(e) => handleUpdatePenalty(idx, 'amount', e.target.value)}
                              className="w-16 bg-transparent border-none text-[10px] font-bold text-rose-500 focus:outline-none text-right p-0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Warnings */}
                  {activeDoc.extracted_data?.warnings && activeDoc.extracted_data.warnings.length > 0 && (
                    <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Auditor Risk Warning
                      </span>
                      <textarea
                        value={activeDoc.extracted_data.warnings[0] || ''}
                        onChange={(e) => handleUpdateWarning(e.target.value)}
                        className="w-full bg-transparent border-none text-[10px] text-rose-600 dark:text-rose-400 focus:outline-none leading-relaxed font-medium p-0"
                        rows={2}
                        placeholder="Risk notification detail..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-border bg-secondary/20 flex justify-end">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  These compliance parameters are automatically saved and updated on your system.
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400" />
              <h3 className="text-sm font-bold text-foreground">Inspect Document</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                No compliance documents have been loaded. Upload a document from your computer or click one of the demo presets to begin auditing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
