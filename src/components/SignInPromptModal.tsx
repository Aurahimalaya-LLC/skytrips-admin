"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignInPromptModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastBtnRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && firstBtnRef.current) firstBtnRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"></div>
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 id="signin-title" className="text-lg font-bold text-slate-900">
            Sign In Required
          </h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-slate-700">
            You need to be authenticated to confirm refunds. Please sign in to continue.
          </p>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            ref={firstBtnRef}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            ref={lastBtnRef}
            onClick={() => {
              router.push("/login");
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Go to sign in"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
