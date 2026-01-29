"use client";

import { useState, useEffect } from "react";
import { DEFAULT_EMAIL_TEMPLATES, EmailTemplate } from "@/lib/email-templates";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    avatar?: string;
    pnr?: string;
  };
  lastEmailSent?: string | null;
  onSend?: (data: {
    subject: string;
    message: string;
    template: string;
  }) => Promise<void>;
  onSave?: (data: {
    id: string;
    name: string;
    subject: string;
    content: string;
  }) => Promise<void>;
  mode?: "send" | "edit";
  templates?: EmailTemplate[];
  initialTemplateId?: string;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  recipient,
  lastEmailSent,
  onSend,
  onSave,
  mode = "send",
  templates,
  initialTemplateId,
}: SendEmailModalProps) {
  const activeTemplates = templates || DEFAULT_EMAIL_TEMPLATES;
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialTemplateId || activeTemplates[0]?.id || "",
  );
  const [subject, setSubject] = useState(activeTemplates[0]?.subject || "");
  const [message, setMessage] = useState(activeTemplates[0]?.content || "");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      const initialTemplate = initialTemplateId
        ? activeTemplates.find((t) => t.id === initialTemplateId)
        : activeTemplates[0];

      setSelectedTemplate(initialTemplate?.id || "");
      setSubject(initialTemplate?.subject || "");
      setMessage(initialTemplate?.content || "");
      setError(null);
      setSuccess(false);
      setIsSending(false);
    }
  }, [isOpen, activeTemplates, initialTemplateId]);

  useEffect(() => {
    const template = activeTemplates.find((t) => t.id === selectedTemplate);
    if (template) {
      if (mode === "send") {
        // Replace placeholders with real values
        let newSubject = template.subject;
        let newContent = template.content;

        const replacements: Record<string, string> = {
          "{NAME}": recipient.name,
          "{EMAIL}": recipient.email,
          "{COMPANY}": recipient.organization || "",
          "{PNR}": recipient.pnr || "",
        };

        Object.entries(replacements).forEach(([key, value]) => {
          newSubject = newSubject.replace(new RegExp(key, "g"), value);
          newContent = newContent.replace(new RegExp(key, "g"), value);
        });

        setSubject(newSubject);
        setMessage(newContent);
      } else {
        // Edit mode: show raw template
        setSubject(template.subject);
        setMessage(template.content);
      }
    }
  }, [selectedTemplate, activeTemplates, mode, recipient]);

  const handleAction = async () => {
    if (!recipient.email || !recipient.email.trim()) {
      setError("Recipient email is required.");
      return;
    }
    if (!message.trim()) {
      setError("Message content cannot be empty.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      if (mode === "edit" && onSave) {
        const template = activeTemplates.find((t) => t.id === selectedTemplate);
        await onSave({
          id: selectedTemplate,
          name: template?.name || "Custom Template",
          subject,
          content: message,
        });
      } else if (onSend) {
        await onSend({ subject, message, template: selectedTemplate });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        mode === "edit"
          ? "Failed to save template."
          : "Failed to send email. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              {mode === "edit" ? "edit_note" : "send"}
            </span>
            {mode === "edit" ? "Edit Template" : "Send Email"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[600px] md:h-auto overflow-hidden">
          {/* Sidebar - Contact Info */}
          <div className="w-full md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Recipient
              </h3>
              <div className="flex items-start gap-3">
                {recipient.avatar ? (
                  <img
                    src={recipient.avatar}
                    alt={recipient.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {recipient.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {recipient.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {recipient.organization || "No Organization"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  mail
                </span>
                <span className="truncate">{recipient.email}</span>
              </div>
              {recipient.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    call
                  </span>
                  <span>{recipient.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                History
              </h3>
              <p className="text-xs text-slate-500">
                Last email sent:{" "}
                <span className="font-bold text-slate-700">
                  {lastEmailSent
                    ? new Date(lastEmailSent).toLocaleString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </span>
              </p>
            </div>
          </div>

          {/* Main Content - Message Editor */}
          <div className="w-full md:w-2/3 p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
            {/* Template Selector */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Email Subject"
                />
              </div>

              <div className="flex-1 min-h-[200px] flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Message
                  </label>
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    {isPreviewMode ? "Edit Mode" : "Preview"}
                  </button>
                </div>

                {isPreviewMode ? (
                  <div className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 whitespace-pre-wrap overflow-y-auto">
                    {message}
                  </div>
                ) : (
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-mono"
                    placeholder="Type your message here..."
                    rows={10}
                  />
                )}
                <div className="text-right mt-1">
                  <span
                    className={`text-[10px] font-bold ${message.length > 1000 ? "text-red-500" : "text-slate-400"}`}
                  >
                    {message.length} characters
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                {mode === "edit"
                  ? "Template saved successfully!"
                  : "Email sent successfully!"}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button
            className="text-slate-500 text-sm font-bold hover:text-slate-700 transition-colors"
            onClick={() => alert("Saved as draft!")}
          >
            Save as Draft
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={isSending || success}
              className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "edit" ? "Saving..." : "Sending..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {mode === "edit" ? "save" : "send"}
                  </span>
                  {mode === "edit" ? "Save Template" : "Send Email"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
