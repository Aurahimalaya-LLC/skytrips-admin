"use client";

import { useState, useEffect, useRef } from "react";
import { Booking } from "@/types";
import { supabase } from "@/lib/supabase";

interface NotificationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  booking: Booking;
}

export default function NotificationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
}: NotificationConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sending" | "success" | "failed">("pending");
  const [smsStatus, setSmsStatus] = useState<"pending" | "sending" | "success" | "failed">("pending");
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Focus the confirm button by default
      setTimeout(() => confirmButtonRef.current?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
      
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const customerName = booking.travellers?.[0]?.firstName || booking.email || "Customer";
  const customerEmail = booking.email || "N/A";
  const customerPhone = booking.phone || "N/A";

  const emailPreview = `Subject: Booking Issued - PNR: ${booking.PNR}\n\nDear ${customerName},\n\nYour booking #${booking.id} has been successfully issued.`;
  const smsPreview = `SkyTrips: Your booking #${booking.id} (PNR: ${booking.PNR}) has been issued. Safe travels!`;

  const logNotification = async (type: "Email" | "SMS", recipient: string, content: string, status: string, errorMsg?: string) => {
    try {
      await supabase.from("notification_logs").insert([
        {
          booking_id: booking.id,
          type,
          recipient,
          content,
          status,
          error_message: errorMsg,
          sent_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error("Failed to log notification:", e);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError(null);
    setEmailStatus("sending");
    setSmsStatus("sending");

    try {
      // 1. Update Booking Status (Already handled by the caller usually, but we ensure it here if needed)
      await onConfirm();

      // 2. Send Email
      let emailSuccess = false;
      if (booking.email) {
        try {
          const emailRes = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: booking.email,
              subject: `Booking Issued - PNR: ${booking.PNR}`,
              html: `<p>Dear ${customerName},</p><p>Your booking <strong>#${booking.id}</strong> (PNR: ${booking.PNR}) has been successfully issued.</p><p>Safe travels!</p>`,
            }),
          });
          if (emailRes.ok) {
            setEmailStatus("success");
            emailSuccess = true;
            await logNotification("Email", booking.email, emailPreview, "Success");
          } else {
            throw new Error("Email API failed");
          }
        } catch (e) {
          setEmailStatus("failed");
          await logNotification("Email", booking.email || "Unknown", emailPreview, "Failed", e instanceof Error ? e.message : String(e));
        }
      } else {
        setEmailStatus("failed");
      }

      // 3. Send SMS
      if (booking.phone) {
        try {
          const smsRes = await fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: booking.phone,
              message: smsPreview,
            }),
          });
          if (smsRes.ok) {
            setSmsStatus("success");
            await logNotification("SMS", booking.phone, smsPreview, "Success");
          } else {
            throw new Error("SMS API failed");
          }
        } catch (e) {
          setSmsStatus("failed");
          await logNotification("SMS", booking.phone || "Unknown", smsPreview, "Failed", e instanceof Error ? e.message : String(e));
        }
      } else {
        setSmsStatus("failed");
      }

      // Final Check
      if (emailStatus === "failed" || smsStatus === "failed") {
        // We still consider it partially successful if at least one worked or status was updated
      }

      setTimeout(() => {
        onClose();
        setIsProcessing(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending": return <span className="material-symbols-outlined animate-spin text-blue-500">sync</span>;
      case "success": return <span className="material-symbols-outlined text-emerald-500">check_circle</span>;
      case "failed": return <span className="material-symbols-outlined text-red-500">error</span>;
      default: return <span className="material-symbols-outlined text-slate-300">pending</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600" aria-hidden="true">verified</span>
            <h3 id="modal-title" className="text-lg font-black text-slate-900">Confirm Issuance</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Customer Info */}
          <section aria-labelledby="recipient-info-title">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 id="recipient-info-title" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recipient Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Name</p>
                  <p className="text-sm font-bold text-slate-900">{customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Booking ID</p>
                  <p className="text-sm font-bold text-slate-900">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900 truncate" title={customerEmail}>{customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                  <p className="text-sm font-bold text-slate-900">{customerPhone}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Notification Preview */}
          <section className="space-y-4" aria-labelledby="notification-preview-title">
            <h4 id="notification-preview-title" className="sr-only">Notification Previews</h4>
            
            <div className="border border-slate-100 rounded-xl overflow-hidden" aria-live="polite">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Email Notification</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{emailStatus}</span>
                  {getStatusIcon(emailStatus)}
                </div>
              </div>
              <div className="p-4 text-xs text-slate-600 font-mono whitespace-pre-wrap bg-white border-l-4 border-l-emerald-500">
                {emailPreview}
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden" aria-live="polite">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">SMS Notification</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{smsStatus}</span>
                  {getStatusIcon(smsStatus)}
                </div>
              </div>
              <div className="p-4 text-xs text-slate-600 font-mono whitespace-pre-wrap bg-white border-l-4 border-l-blue-500">
                {smsPreview}
              </div>
            </div>
          </section>

          {error && (
            <div 
              className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-shake"
              role="alert"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-[2] px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none flex items-center justify-center gap-2"
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">sync</span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">send</span>
                Confirm & Send Notifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
