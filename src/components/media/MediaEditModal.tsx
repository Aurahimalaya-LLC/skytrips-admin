"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaFile } from "@/lib/media-service";
import { MediaThumbnail } from "./MediaThumbnail";

interface MediaEditModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MediaFile>) => Promise<void>;
}

export function MediaEditModal({ file, isOpen, onClose, onSave }: MediaEditModalProps) {
  const [formData, setFormData] = useState({
    title: file.title || "",
    alt_text: file.alt_text || "",
    caption: file.caption || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(file.media_id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Media Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 relative">
                <MediaThumbnail file={file} objectFit="contain" />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p><span className="font-semibold">File Name:</span> {file.title}</p>
                <p><span className="font-semibold">Size:</span> {(file.file_size / 1024).toFixed(2)} KB</p>
                <p><span className="font-semibold">Type:</span> {file.mime_type}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-slate-400 font-normal">
                    {formData.title.length}/255
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alt Text
                  <span className="ml-2 text-xs text-slate-400 font-normal">
                    {formData.alt_text.length}/125
                  </span>
                </label>
                <input
                  type="text"
                  name="alt_text"
                  value={formData.alt_text}
                  onChange={handleChange}
                  maxLength={125}
                  placeholder="Describe image for accessibility"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Caption
                </label>
                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
