"use client";
import { useState, useEffect, useRef } from "react";

type Role = "super_admin" | "manager" | "agent";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: any) => Promise<void>;
}

export function InviteUserModal({ isOpen, onClose, onInvite }: InviteUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("super_admin");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap could be implemented here, but simple return focus is requested
  
  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onInvite({ fullName, email, role: selectedRole, mfaEnabled });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900">
            Invite New User
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-8">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
              />
            </div>
          </div>

          {/* Assign Role */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 block">
              Assign Role
            </label>
            <div className="space-y-3">
              {/* Super Admin Option */}
              <label 
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedRole === "super_admin" 
                    ? "border-teal-600 bg-teal-50/30 ring-1 ring-teal-600" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="super_admin"
                  checked={selectedRole === "super_admin"}
                  onChange={() => setSelectedRole("super_admin")}
                  className="sr-only"
                />
                <div className="flex w-full items-start gap-3">
                  <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedRole === "super_admin"
                      ? "border-teal-600 bg-teal-600"
                      : "border-slate-300 bg-white"
                  }`}>
                    {selectedRole === "super_admin" && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Super Admin</div>
                    <p className="mt-1 text-sm text-slate-500">
                      Full system access, including billing, user management, and security settings.
                    </p>
                  </div>
                </div>
              </label>

              {/* Manager Option */}
              <label 
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedRole === "manager" 
                    ? "border-teal-600 bg-teal-50/30 ring-1 ring-teal-600" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={selectedRole === "manager"}
                  onChange={() => setSelectedRole("manager")}
                  className="sr-only"
                />
                <div className="flex w-full items-start gap-3">
                  <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedRole === "manager"
                      ? "border-teal-600 bg-teal-600"
                      : "border-slate-300 bg-white"
                  }`}>
                    {selectedRole === "manager" && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Manager</div>
                    <p className="mt-1 text-sm text-slate-500">
                      Ability to manage all bookings, edit tours, and view operational reports.
                    </p>
                  </div>
                </div>
              </label>

              {/* Agent Option */}
              <label 
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedRole === "agent" 
                    ? "border-teal-600 bg-teal-50/30 ring-1 ring-teal-600" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="agent"
                  checked={selectedRole === "agent"}
                  onChange={() => setSelectedRole("agent")}
                  className="sr-only"
                />
                <div className="flex w-full items-start gap-3">
                  <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedRole === "agent"
                      ? "border-teal-600 bg-teal-600"
                      : "border-slate-300 bg-white"
                  }`}>
                    {selectedRole === "agent" && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Agent</div>
                    <p className="mt-1 text-sm text-slate-500">
                      Can view, create, and edit bookings. Limited access to system settings.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* MFA Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-teal-700">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">Enable Multi-Factor Authentication</div>
                <p className="text-sm text-slate-500">Require an extra security step for this user</p>
              </div>
            </div>
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                mfaEnabled ? "bg-teal-700" : "bg-slate-200"
              }`}
              role="switch"
              aria-checked={mfaEnabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  mfaEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5 bg-slate-50/30 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
