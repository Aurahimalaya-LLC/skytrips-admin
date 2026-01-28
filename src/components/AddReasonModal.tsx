"use client";

import { useEffect, useRef, useState } from "react";

interface AddReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
  initialData?: { uid?: string; title: string; description: string } | null;
}

export function AddReasonModal({ isOpen, onClose, onSubmit, initialData }: AddReasonModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      const targetTitle = initialData?.title || "";
      const targetDescription = initialData?.description || "";
      
      setTitle(prev => prev !== targetTitle ? targetTitle : prev);
      setDescription(prev => prev !== targetDescription ? targetDescription : prev);
    }
  }, [isOpen, initialData]);

  // Focus trap and ESC key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      
      // Simple focus trap
      if (e.key === "Tab" && modalRef.current) {
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

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 shadow-sm border border-teal-100">
              <span className="material-symbols-outlined text-[20px]">{isEditMode ? "edit" : "add"}</span>
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                {isEditMode ? "Edit Reason" : "Add New Reason"}
              </h2>
              <p className="text-sm text-slate-500">
                {isEditMode ? "Update existing reason details" : "Create a new standardized reason code"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors -mr-2 -mt-2"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto">
          {/* Reason UID Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reason UID
            </label>
            <div className="relative">
              <input
                type="text"
                value={initialData?.uid || "Auto-generated"}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none cursor-not-allowed"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">
                auto_awesome
              </span>
            </div>
            <p className="text-xs text-slate-400">System generated unique identifier.</p>
          </div>

          {/* Reason Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reason Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Dissatisfaction"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed internal notes about when to use this reason..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5 bg-slate-50/30 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ title, description })}
            className="rounded-lg bg-teal-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-500 transition-all focus:ring-4 focus:ring-teal-400/20 outline-none"
          >
            {isEditMode ? "Save Changes" : "Create Reason"}
          </button>
        </div>
      </div>
    </div>
  );
}
