"use client";

import { useState, useRef } from "react";
import { mediaService } from "@/lib/media-service";

interface MediaUploaderProps {
  onUploadSuccess: (file: any) => void;
}

export function MediaUploader({ onUploadSuccess }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFiles = async (fileList: FileList) => {
    setIsUploading(true);
    const files = Array.from(fileList);

    for (const file of files) {
      await uploadFile(file);
    }
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const result = await mediaService.uploadFile(file);
      if (result) {
        onUploadSuccess(result);
      } else {
        alert(`Failed to upload ${file.name}`);
      }
    } catch (err) {
      console.error("Upload exception:", err);
      alert(`An error occurred while uploading ${file.name}`);
    }
  };

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
            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
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
