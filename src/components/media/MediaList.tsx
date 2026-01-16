"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MediaEditModal } from "./MediaEditModal";
import { MediaThumbnail } from "./MediaThumbnail";
import { MediaFile } from "@/lib/media-service";

interface MediaListProps {
  files: MediaFile[];
  loading: boolean;
  viewMode: "grid" | "list";
  onDelete?: (id: string, path: string) => void;
  onUpdate?: (id: string, updates: Partial<MediaFile>) => Promise<void>;
  onSelect?: (file: MediaFile) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
}

export function MediaList({ files, loading, viewMode, onDelete, onUpdate, onSelect, selectionMode = false, selectedIds = [] }: MediaListProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

  const selectedFile = selectedFileId ? files.find((f) => f.media_id === selectedFileId) || null : null;

  const handleFileClick = (file: MediaFile) => {
    if (selectionMode && onSelect) {
      onSelect(file);
    } else {
      setSelectedFileId(file.media_id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
        <p>No files found</p>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleEditClick = (e: React.MouseEvent, file: MediaFile) => {
    e.stopPropagation();
    setEditingFile(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.media_id}
              className={`group relative bg-white dark:bg-slate-800 border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                selectedIds.includes(file.media_id)
                  ? "border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Thumbnail */}
              <div
                className="aspect-square cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <MediaThumbnail file={file} />
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={file.title}>
                  {file.title}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-slate-500">{formatSize(file.file_size)}</span>
                  {!selectionMode && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleEditClick(e, file)}
                        className="text-slate-400 hover:text-primary transition-colors p-1"
                        title="Edit Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(file.media_id, file.file_path);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Size</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.media_id}
                  className={`border-b transition-colors ${
                    selectedIds.includes(file.media_id)
                      ? "bg-primary/5 border-primary/20 dark:bg-primary/10"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        <MediaThumbnail file={file} />
                      </div>
                      <span
                        className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px] cursor-pointer hover:underline"
                        onClick={() => handleFileClick(file)}
                      >
                        {file.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{formatSize(file.file_size)}</td>
                  <td className="py-3 px-4 text-sm text-slate-500 capitalize">{file.mime_type?.split('/')[0] || 'file'}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!selectionMode && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => handleEditClick(e, file)}
                          className="text-slate-400 hover:text-primary transition-colors p-1"
                          title="Edit Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDelete?.(file.media_id, file.file_path)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && (
        <MediaEditModal
          file={editingFile}
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          onSave={onUpdate}
        />
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedFileId(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg truncate pr-4">{selectedFile.title}</h3>
              <div className="flex gap-2">
                 <button 
                  onClick={() => {
                    setSelectedFileId(null);
                    setEditingFile(selectedFile);
                  }}
                  className="text-slate-500 hover:text-primary dark:hover:text-primary mr-2"
                  title="Edit"
                 >
                  <span className="material-symbols-outlined">edit</span>
                 </button>
                <button onClick={() => setSelectedFileId(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
              <div className="relative w-full h-[60vh]">
                 <MediaThumbnail file={selectedFile} objectFit="contain" />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">File Details</p>
                <p>Size: {formatSize(selectedFile.file_size)}</p>
                <p>Type: {selectedFile.mime_type}</p>
                {selectedFile.width && selectedFile.height && <p>Dimensions: {selectedFile.width}x{selectedFile.height}</p>}
                {selectedFile.duration && <p>Duration: {selectedFile.duration}s</p>}
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Metadata</p>
                <p>Uploaded: {new Date(selectedFile.created_at).toLocaleString()}</p>
                <p>Category: {selectedFile.categories?.join(", ") || "Uncategorized"}</p>
                {selectedFile.alt_text && <p>Alt Text: {selectedFile.alt_text}</p>}
                {selectedFile.caption && <p>Caption: {selectedFile.caption}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
