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
  ArrowRight,
  Info,
  Search,
  Download,
  FileJson,
  ShieldCheck
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DocumentUploadPage() {
  const { documents, uploadDocument, isLoading } = useApp();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );
  
  const [archiveSearch, setArchiveSearch] = useState('');
  const [progressStage, setProgressStage] = useState<'idle' | 'uploading' | 'ai'>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeDoc = documents.find(d => d.id === selectedDocId) || (documents.length > 0 ? documents[0] : null);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  // Real Preprocessing: Scale high-resolution, grayscale, increase contrast & sharpen (Requirement 3)
  const preprocessCanvas = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // A. Grayscale & Contrast stretching
    const contrast = 50; // contrast percentage (-100 to 100)
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      let val = factor * (gray - 128) + 128;
      val = Math.max(0, Math.min(255, val));

      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imgData, 0, 0);

    // B. Convolution Sharpen Filter (Laplacian Laplacian 3x3)
    const sharpenKernel = [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ];
    const side = 3;
    const halfSide = 1;
    const src = ctx.getImageData(0, 0, width, height).data;
    const output = ctx.createImageData(width, height);
    const dst = output.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dstOff = (y * width + x) * 4;
        
        let r = 0, g = 0, b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
            const srcOff = (scy * width + scx) * 4;
            const wt = sharpenKernel[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
        dst[dstOff] = Math.max(0, Math.min(255, r));
        dst[dstOff + 1] = Math.max(0, Math.min(255, g));
        dst[dstOff + 2] = Math.max(0, Math.min(255, b));
        dst[dstOff + 3] = src[dstOff + 3];
      }
    }
    ctx.putImageData(output, 0, 0);

    return canvas.toDataURL('image/png');
  };

  const renderPdfToCanvas = async (data: Uint8Array): Promise<HTMLCanvasElement> => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    // Scale high-resolution (scale 2.5 represents ~200-300% size boost)
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    return canvas;
  };

  const renderImageToCanvas = (src: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(canvas);
          return;
        }
        
        // Ensure high resolution (at least 2000px width)
        const targetWidth = Math.max(img.width, 2000);
        const scale = targetWidth / img.width;
        const targetHeight = img.height * scale;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas);
      };
      img.onerror = () => {
        const canvas = document.createElement('canvas');
        resolve(canvas);
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    // Validate file extension
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const name = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => name.endsWith(ext));

    if (!isValidType) {
      setValidationError("Unsupported file type. Please upload PDF or Image.");
      return;
    }

    // Validate size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setValidationError("File size exceeds 10 MB.");
      return;
    }

    try {
      setProgressStage('uploading');
      setProgressPercent(20);

      const reader = new FileReader();
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }

      reader.onload = async () => {
        try {
          setProgressStage('ai');
          setProgressPercent(50);

          let preprocessedDataUrl = '';
          if (file.type === 'application/pdf') {
            const arrBuf = reader.result as ArrayBuffer;
            const data = new Uint8Array(arrBuf);
            const canvas = await renderPdfToCanvas(data);
            preprocessedDataUrl = preprocessCanvas(canvas);
          } else {
            const dataUrl = reader.result as string;
            const canvas = await renderImageToCanvas(dataUrl);
            preprocessedDataUrl = preprocessCanvas(canvas);
          }

          const base64Data = preprocessedDataUrl.split(',')[1];

          await uploadDocument(file.name, file.size, base64Data, 'image/png');

          setProgressPercent(100);
          setProgressStage('idle');

          const updatedDocs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vigilant_documents') || '[]') : [];
          if (updatedDocs.length > 0) {
            setSelectedDocId(updatedDocs[0].id);
          }
        } catch (err: any) {
          console.error("Document upload pipeline error:", err);
          
          const msg = err.message || '';
          if (msg.includes("Gemini API Key is missing") || msg.includes("The configured Gemini API key is invalid")) {
            setValidationError(msg);
          } else if (msg === "Invalid API Key") {
            setValidationError("The configured Gemini API key is invalid. Please generate a new API key from Google AI Studio.");
          } else if (msg === "429 Rate Limit") {
            setValidationError("API rate limit exceeded. Please try again in a few moments.");
          } else if (msg === "500 Internal Error") {
            setValidationError("AI server internal error. Please try again later.");
          } else if (msg === "Network Timeout") {
            setValidationError("Network request timed out. Please check your connection.");
          } else if (msg === "Invalid JSON") {
            setValidationError("Unable to extract structured information.");
          } else if (msg === "Large Image") {
            setValidationError("The uploaded image is too large for AI processing.");
          } else if (msg === "Unsupported PDF") {
            setValidationError("Unsupported file format. Please upload a PDF or an Image.");
          } else if (msg === "Empty File") {
            setValidationError("The uploaded file is empty.");
          } else if (msg === "Corrupted File") {
            setValidationError("The uploaded file is corrupted or unreadable.");
          } else {
            setValidationError(msg || "Unable to extract structured information.");
          }
          setProgressStage('idle');
        }
      };
    } catch (err: any) {
      console.warn("Outer upload warning:", err);
      setValidationError("Unable to read this document. Please upload a clearer scan.");
      setProgressStage('idle');
    }
  };

  const downloadJson = () => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeDoc.extracted_data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(activeDoc.extracted_data as any).invoiceNumber || 'document'}_extracted.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadAuditReport = () => {
    if (!activeDoc || !activeDoc.extracted_data) return;
    const ext = activeDoc.extracted_data as any;
    const reportText = `==================================================
REGULATORY COMPLIANCE AUDIT REPORT
==================================================
Document Name: ${activeDoc.file_name}
Document Type: ${ext.documentType || ''}
Invoice Number: ${ext.invoiceNumber || ''}
Invoice Date: ${ext.invoiceDate || ''}
Due Date: ${ext.dueDate || ''}

SELLER DETAILS:
Name: ${ext.sellerName || ''}
GSTIN: ${ext.sellerGSTIN || ''}

BUYER DETAILS:
Name: ${ext.buyerName || ''}
GSTIN: ${ext.buyerGSTIN || ''}

TAXABLE VALUE: ₹${ext.taxableAmount || ''}
CGST: ₹${ext.cgst || ''}
SGST: ₹${ext.sgst || ''}
IGST: ₹${ext.igst || ''}
TOTAL TAX: ₹${ext.totalTax || ''}
GRAND TOTAL: ₹${ext.grandTotal || ''}

COMPLIANCE AUDIT RESULTS:
Status: ${ext.validation_result || ''}

Errors Found:
${(ext.validation_errors || []).map((e: string, i: number) => `${i+1}. ${e}`).join('\n') || 'None'}

Warnings Found:
${(ext.validation_warnings || []).map((w: string, i: number) => `${i+1}. ${w}`).join('\n') || 'None'}

Checklists / Required Actions:
${(ext.checklists || []).map((c: string, i: number) => `- [ ] ${c}`).join('\n') || 'None'}
==================================================
Generated automatically by Vigilant Compliance Platform on ${new Date().toLocaleDateString()}
`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(reportText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${ext.invoiceNumber || 'document'}_compliance_audit_report.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredDocs = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  const renderFieldItem = (label: string, value: any, isMono = false) => {
    const displayVal = (value === undefined || value === null) ? '' : String(value);
    return (
      <div className="p-3 rounded-lg border border-border bg-secondary/5 hover:bg-secondary/15 transition-all">
        <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">{label}</span>
        <span className={`font-semibold text-xs leading-normal block truncate ${
          displayVal === '' ? 'text-muted-foreground italic font-medium' : 'text-foreground'
        } ${isMono ? 'font-mono' : ''}`} title={displayVal}>
          {displayVal === '' ? 'Empty' : 
           (typeof value === 'number' ? '₹' + value.toLocaleString('en-IN') : displayVal)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          AI Document Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
          Upload tax invoices, challans or compliance notices. Perform live structured extraction and regulatory validation using Gemini Vision API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Upload Area & Archive & Preview */}
        <div className="space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* Upload Card */}
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center hover:bg-secondary/20 transition-all relative">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={progressStage !== 'idle'}
            />
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Click to upload files or drag & drop</p>
                <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Preview Container */}
          {activeDoc && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Document Preview</span>
              {activeDoc.file_url && activeDoc.file_url !== '#' && activeDoc.file_type.startsWith('image/') ? (
                <img src={activeDoc.file_url} alt="Document Preview" className="max-h-[300px] w-auto mx-auto rounded-lg object-contain border border-border shadow-sm" />
              ) : (
                <div className="p-8 border border-border rounded-lg bg-secondary/15 flex flex-col items-center justify-center space-y-2">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <span className="text-xs font-semibold text-foreground text-center block max-w-[200px] truncate">{activeDoc.file_name}</span>
                  <span className="text-[10px] text-muted-foreground block">{activeDoc.file_type === 'application/pdf' ? 'PDF Document' : 'Image Document'}</span>
                </div>
              )}
            </div>
          )}

          {/* Searchable File Archives Library */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b border-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Uploaded Documents Archive</h3>
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
          {progressStage !== 'idle' ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
              <h3 className="text-sm font-bold text-foreground">Analyzing document...</h3>
              <p className="text-xs text-muted-foreground">Extracting fields and validation results directly using Gemini Vision API...</p>
            </div>
          ) : activeDoc ? (
            <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
              {/* Doc Details Header */}
              <div className="p-5 border-b border-border bg-secondary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Document Details</span>
                  <h3 className="text-sm font-bold text-foreground">{activeDoc.file_name}</h3>
                </div>
                
                {/* Compliance Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    (activeDoc.extracted_data as any)?.validation_result === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                  }`}>
                    Compliance: {(activeDoc.extracted_data as any)?.validation_result || 'Flagged'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Validation Errors & Alerts */}
                {((activeDoc.extracted_data as any)?.validation_errors || []).length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <span className="text-rose-500 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Validation Errors
                    </span>
                    <ul className="list-disc list-inside text-rose-600 dark:text-rose-400 text-xs space-y-1 leading-relaxed">
                      {((activeDoc.extracted_data as any).validation_errors).map((err: string, i: number) => (
                        <li key={i} className="font-semibold">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Validation Warnings */}
                {((activeDoc.extracted_data as any)?.validation_warnings || []).length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <span className="text-amber-500 text-xs font-bold flex items-center gap-2">
                      <Info className="w-4 h-4" /> Compliance Warnings
                    </span>
                    <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 text-xs space-y-1 leading-relaxed">
                      {((activeDoc.extracted_data as any).validation_warnings).map((warn: string, i: number) => (
                        <li key={i} className="font-semibold">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted JSON Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-500" /> Extracted Document Fields
                  </h4>
                  
                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {renderFieldItem("Document Type", (activeDoc.extracted_data as any)?.documentType)}
                    {renderFieldItem("Invoice Number", (activeDoc.extracted_data as any)?.invoiceNumber, true)}
                    {renderFieldItem("Invoice Date", (activeDoc.extracted_data as any)?.invoiceDate)}
                    {renderFieldItem("Due Date", (activeDoc.extracted_data as any)?.dueDate)}
                    {renderFieldItem("Place of Supply", (activeDoc.extracted_data as any)?.placeOfSupply)}
                    {renderFieldItem("Taxable Amount", (activeDoc.extracted_data as any)?.taxableAmount)}
                    {renderFieldItem("CGST", (activeDoc.extracted_data as any)?.cgst)}
                    {renderFieldItem("SGST", (activeDoc.extracted_data as any)?.sgst)}
                    {renderFieldItem("IGST", (activeDoc.extracted_data as any)?.igst)}
                    {renderFieldItem("Total Tax", (activeDoc.extracted_data as any)?.totalTax)}
                    {renderFieldItem("Grand Total", (activeDoc.extracted_data as any)?.grandTotal)}
                  </div>

                  {/* Seller / Buyer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Seller Card */}
                    <div className="p-4 rounded-xl border border-border bg-secondary/5 space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Seller Details</span>
                      <div className="text-xs space-y-1">
                        <p><strong className="text-foreground">Name:</strong> {(activeDoc.extracted_data as any)?.sellerName || ''}</p>
                        <p><strong className="text-foreground">GSTIN:</strong> {(activeDoc.extracted_data as any)?.sellerGSTIN || ''}</p>
                      </div>
                    </div>

                    {/* Buyer Card */}
                    <div className="p-4 rounded-xl border border-border bg-secondary/5 space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Buyer Details</span>
                      <div className="text-xs space-y-1">
                        <p><strong className="text-foreground">Name:</strong> {(activeDoc.extracted_data as any)?.buyerName || ''}</p>
                        <p><strong className="text-foreground">GSTIN:</strong> {(activeDoc.extracted_data as any)?.buyerGSTIN || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* HSN Codes Display list */}
                  {((activeDoc.extracted_data as any)?.hsnCodes || []).length > 0 && (
                    <div className="p-4 rounded-xl border border-border bg-secondary/5 space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Extracted HSN codes</span>
                      <div className="flex flex-wrap gap-2">
                        {((activeDoc.extracted_data as any).hsnCodes).map((code: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-background border-border text-foreground font-mono">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Center - Checklists & Penalties */}
                  {((activeDoc.extracted_data as any)?.validation_result === 'Approved') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      {/* Checklists */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Compliance Requirements Checklist</span>
                        <div className="space-y-1.5">
                          {((activeDoc.extracted_data as any).checklists || []).map((item: string, idx: number) => (
                            <div key={idx} className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Penalties */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Potential Penalty Liabilities</span>
                        <div className="space-y-1.5">
                          {((activeDoc.extracted_data as any).penalties || []).map((p: any, idx: number) => (
                            <div key={idx} className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> {p.violation}
                              </span>
                              <span>₹{p.amount.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                          {((activeDoc.extracted_data as any).penalties || []).length === 0 && (
                            <div className="p-2 rounded-lg bg-secondary/10 border border-border text-[11px] text-muted-foreground text-center">
                              No penalty liabilities identified.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Downloads Actions */}
                <div className="pt-6 border-t border-border flex flex-wrap gap-3">
                  <button
                    onClick={downloadJson}
                    className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 border border-border rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <FileJson className="w-4 h-4" /> Download JSON
                  </button>
                  <button
                    onClick={downloadAuditReport}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Audit Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
              <FileText className="w-10 h-10 text-slate-400" />
              <h3 className="text-sm font-bold text-foreground">Inspect Document</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                No compliance documents have been loaded. Upload a document from your computer to begin auditing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
