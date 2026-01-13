"use client";
import { useEffect, useRef } from "react";

export default function RefundConfirmModal({
  isOpen,
  bookingId,
  bookingDate,
  amount,
  onConfirm,
  onCancel,
  isProcessing = false,
  isAuthenticated = true,
  onRequireAuth,
}: {
  isOpen: boolean;
  bookingId: number;
  bookingDate: string;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen && firstBtnRef.current) {
      firstBtnRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"></div>
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 id="refund-title" className="text-lg font-bold text-slate-900">
            Confirm Refund Request
          </h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="text-sm text-slate-700">
            Booking ID: <span className="font-mono font-bold text-primary">#{bookingId}</span>
          </div>
          <div className="text-sm text-slate-700">Date: <span className="font-medium">{bookingDate || "-"}</span></div>
          <div className="text-sm text-slate-700">Amount: <span className="font-medium">${Number(amount).toFixed(2)}</span></div>
          <p className="text-xs text-red-600 mt-2">
            This action cannot be undone. The booking will be marked for refund processing.
          </p>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <div className="relative group">
            <button
            ref={firstBtnRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg_white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Cancel refund"
            disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
          <button
            ref={lastBtnRef}
            onClick={() => {
              if (!isAuthenticated) {
                if (onRequireAuth) onRequireAuth();
                return;
              }
              onConfirm();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Confirm refund"
            disabled={isProcessing || !isAuthenticated}
            >
            {isProcessing ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : null}
            <span>Confirm Refund</span>
          </button>
          {!isAuthenticated && (
            <div role="tooltip" className="ml-2 text-xs text-slate-600">
              Sign in required
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
