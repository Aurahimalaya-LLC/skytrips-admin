"use client";

import { useState, useRef } from "react";
import { mediaService } from "@/lib/media-service";

interface MediaUploaderProps {
  onUploadSuccess: (file: any) => void;
  onUploadComplete?: () => void;
}

export function MediaUploader({
  onUploadSuccess,
  onUploadComplete,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    // Filter out duplicates if needed, or just append
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      const result = await uploadFile(file);
      if (result) {
        successCount++;
        onUploadSuccess(result);
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);

    if (successCount > 0 && onUploadComplete) {
      onUploadComplete();
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const result = await mediaService.uploadFile(file);
      if (result) {
        return result;
      } else {
        alert(`Failed to upload ${file.name}`);
        return null;
      }
    } catch (err: any) {
      console.error("Upload exception:", err);
      alert(
        `An error occurred while uploading ${file.name}: ${err.message || err}`
      );
      return null;
    }
  };

  if (selectedFiles.length > 0 && !isUploading) {
    return (
      <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
        <h3 className="font-bold text-lg mb-4">
          Selected Files ({selectedFiles.length})
        </h3>
        <div className="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined text-slate-500">
                  description
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {/* <button
            onClick={() => setSelectedFiles([])}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button> */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-small rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Add More
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1 bg-primary text-white font-small rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            Save Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Uploading files...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <span className="material-symbols-outlined text-2xl">
              cloud_upload
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Images, videos, and documents
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
          >
            Select Files
          </button>
        </div>
      )}
    </div>
  );
}
