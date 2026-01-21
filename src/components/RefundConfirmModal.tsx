"use client";
import { useEffect, useRef, useState } from "react";
import { Traveller } from "@/types";

export default function RefundConfirmModal({
  isOpen,
  bookingId,
  bookingDate,
  amount,
  travellers = [],
  onConfirm,
  onCancel,
  isProcessing = false,
  isAuthenticated = true,
  onRequireAuth,
  hideWarning = false,
}: {
  isOpen: boolean;
  bookingId: number;
  bookingDate: string;
  amount: number;
  travellers?: Traveller[];
  onConfirm: (selectedTravellerIds?: string[]) => void;
  onCancel: () => void;
  isProcessing?: boolean;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
  hideWarning?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastBtnRef = useRef<HTMLButtonElement | null>(null);

  const [selectedTravellerIds, setSelectedTravellerIds] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (isOpen) {
      // Default to selecting all travellers when modal opens
      const allIds = travellers.map((t, index) => t.id || `temp-${index}`);
      setSelectedTravellerIds(allIds);
    }
  }, [isOpen, travellers]);

  const toggleTraveller = (id: string) => {
    setSelectedTravellerIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    const allIds = travellers.map((t, index) => t.id || `temp-${index}`);
    if (selectedTravellerIds.length === allIds.length) {
      setSelectedTravellerIds([]);
    } else {
      setSelectedTravellerIds(allIds);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
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
            Booking ID:{" "}
            <span className="font-mono font-bold text-primary">
              #{bookingId}
            </span>
          </div>
          <div className="text-sm text-slate-700">
            Date: <span className="font-medium">{bookingDate || "-"}</span>
          </div>
          <div className="text-sm text-slate-700">
            Amount:{" "}
            <span className="font-medium">${Number(amount).toFixed(2)}</span>
          </div>

          {travellers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">
                  Select Travellers
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  {selectedTravellerIds.length === travellers.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
                {travellers.map((t, index) => {
                  const tId = t.id || `temp-${index}`;
                  return (
                    <label
                      key={tId}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTravellerIds.includes(tId)}
                        onChange={() => toggleTraveller(tId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">
                          {t.firstName} {t.lastName}
                        </div>
                        {t.eticketNumber && (
                          <div className="text-xs text-slate-500 font-mono">
                            {t.eticketNumber}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {selectedTravellerIds.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one traveller.
                </p>
              )}
            </div>
          )}

          {!hideWarning && (
            <p className="text-xs text-red-600 mt-2">
              This action cannot be undone. The booking will be marked for
              refund processing.
            </p>
          )}
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
              if (travellers.length > 0 && selectedTravellerIds.length === 0) {
                return;
              }
              onConfirm(selectedTravellerIds);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Confirm refund"
            disabled={
              isProcessing ||
              !isAuthenticated ||
              (travellers.length > 0 && selectedTravellerIds.length === 0)
            }
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
