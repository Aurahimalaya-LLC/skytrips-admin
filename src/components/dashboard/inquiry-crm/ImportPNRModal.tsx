"use client";

import { useState, useEffect, useRef } from "react";
import TicketPreview from "./TicketPreview";

interface ImportPNRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (pnrText: string) => void;
}

interface ParsedData {
    pnr_number: string;
    passengers: string[];
    segments: Array<{
        flight_number: string;
        airline_code: string;
        departure_airport: string;
        arrival_airport: string;
        departure_time: string;
        arrival_time: string;
        class?: string;
    }>;
    [key: string]: unknown;
}

export default function ImportPNRModal({ isOpen, onClose, onImport }: ImportPNRModalProps) {
    const [pnrText, setPnrText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);

    // Customer & Quote Details State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLTextAreaElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPnrText("");
            setIsSubmitting(false);
            setError(null);
            setPreviewUrl(null);
            setParsedData(null);
            setFirstName("");
            setLastName("");
            setEmail("");
            setWhatsapp("");
            setProposedPrice("");
            
            // Prevent background scroll
            document.body.style.overflow = "hidden";
            // Focus first input
            setTimeout(() => firstInputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Auto-fill names from PNR if available
    useEffect(() => {
        if (parsedData && parsedData.passengers && parsedData.passengers.length > 0) {
            // PNR names are typically SURNAME/FIRSTNAME TITLE
            // e.g. "DOE/JOHN MR" or "SMITH/JANE"
            const rawName = parsedData.passengers[0];
            if (rawName.includes('/')) {
                const [surname, rest] = rawName.split('/');
                const first = rest.split(' ')[0]; // Remove title if present
                setLastName(surname || "");
                setFirstName(first || "");
            } else {
                // Fallback for space separated
                const parts = rawName.split(' ');
                if (parts.length > 1) {
                    setLastName(parts[parts.length - 1]);
                    setFirstName(parts.slice(0, -1).join(' '));
                } else {
                    setLastName(rawName);
                }
            }
        }
    }, [parsedData]);

    // Handle ESC key and click outside
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
            // Simple focus trap
            if (e.key === "Tab" && isOpen && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pnrText.trim()) return;

        setIsSubmitting(true);
        setError(null);
        setPreviewUrl(null);

        try {
            const response = await fetch("/api/pnr/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pnrText }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to process PNR");
            }

            setPreviewUrl(result.previewUrl);
            setParsedData(result.data);
            
            // Note: We don't close immediately anymore, we show the preview
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmImport = () => {
        if (parsedData) {
             const finalData = {
                 ...parsedData,
                 customer: {
                     firstName,
                     lastName,
                     email,
                     whatsapp
                 },
                 quote: {
                     amount: proposedPrice
                 }
             };
             onImport(JSON.stringify(finalData));
             onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">code</span>
                        </div>
                        <div>
                            <h2 id="modal-title" className="text-xl font-black text-slate-900 tracking-tight">Import PNR</h2>
                            <p className="text-sm font-medium text-slate-500">Paste your PNR content below to import flight details.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                  {/* PNR Textarea */}
                  <div className="space-y-2">
                    <label htmlFor="pnr-input" className="text-[11px] font-black text-slate-500 uppercase tracking-widest">PNR Content</label>
                    <textarea
                      id="pnr-input"
                      ref={firstInputRef}
                      required
                      placeholder="Paste PNR text here..."
                      value={pnrText}
                      onChange={(e) => setPnrText(e.target.value)}
                      className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono font-medium outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-slate-400"
                    />
                  </div>
                  
                  {/* Customer & Quote Details - Always visible or only after parsing? 
                      Let's keep them visible but optional until save. 
                      Actually, better to show them clearly. */}
                  <div className="grid grid-cols-2 gap-4">
                      {/* Name Fields */}
                      <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
                          <input 
                              type="text" 
                              value={firstName} 
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="John"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 transition-all"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                          <input 
                              type="text" 
                              value={lastName} 
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Doe"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 transition-all"
                          />
                      </div>

                      {/* Contact Fields */}
                      <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                          <input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="client@example.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 transition-all"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">WhatsApp Number</label>
                          <input 
                              type="tel" 
                              value={whatsapp} 
                              onChange={(e) => setWhatsapp(e.target.value)}
                              placeholder="+1 234 567 8900"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 transition-all"
                          />
                      </div>

                      {/* Price Field - Full Width or Highlighted */}
                      <div className="col-span-2 space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-primary">Proposed Price</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                              <input 
                                  type="number" 
                                  value={proposedPrice} 
                                  onChange={(e) => setProposedPrice(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-8 pr-4 py-3 bg-white border-2 border-primary/10 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                              />
                          </div>
                      </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        {error}
                    </div>
                  )}

                  {parsedData && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Ticket Preview</h4>
                            {previewUrl && (
                                <a 
                                    href={previewUrl} 
                                    download={`ticket-${parsedData?.pnr_number || 'preview'}.png`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                    title="Download Ticket Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PNG
                                </a>
                            )}
                        </div>
                        
                        {/* React Component Preview */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50/50 p-2">
                             <TicketPreview data={parsedData} price={proposedPrice} />
                        </div>
                    </div>
                  )}

                  {/* Fallback to Image if no parsed data but URL exists (rare case) */}
                  {!parsedData && previewUrl && (
                    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md border border-gray-200 shadow-sm bg-white group">
                            <img 
                                src={previewUrl} 
                                alt="Ticket Preview" 
                                className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      Cancel
                    </button>
                    
                    {!previewUrl ? (
                        <button
                        type="submit"
                        disabled={isSubmitting || !pnrText.trim()}
                        className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-primary/20"
                        >
                        {isSubmitting ? (
                            <>
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processing...
                            </>
                        ) : (
                            <>
                            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                            Analyze & Generate
                            </>
                        )}
                        </button>
                    ) : (
                        <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Confirm Import
                        </button>
                    )}
                  </div>
                </form>
            </div>
        </div>
    );
}
