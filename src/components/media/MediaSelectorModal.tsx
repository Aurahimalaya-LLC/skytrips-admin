"use client";

import { useState, useEffect } from "react";
import { MediaList } from "./MediaList";
import { mediaService, MediaFile } from "@/lib/media-service";

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile | MediaFile[]) => void;
  multiple?: boolean;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect, multiple = false }: MediaSelectorModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
  });

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setSelectedFiles([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [filters]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getFiles(filters);
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles((prev) => {
        const isSelected = prev.some((f) => f.media_id === file.media_id);
        if (isSelected) {
          return prev.filter((f) => f.media_id !== file.media_id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      onSelect(file);
      onClose(); // Single select closes immediately
    }
  };

  const handleConfirm = () => {
    onSelect(selectedFiles);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">photo_library</span>
            Select Media {multiple && selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Search */}
             <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
             </div>
             
             {/* Type Filter */}
             <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="audio">Audio</option>
              </select>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="all">All Categories</option>
                <option value="uncategorized">Uncategorized</option>
                <option value="marketing">Marketing</option>
                <option value="documents">Documents</option>
                <option value="profiles">Profiles</option>
              </select>
           </div>

           <div className="flex gap-2 shrink-0 border-l border-slate-200 dark:border-slate-700 pl-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
                title="List View"
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 relative">
           <MediaList 
             files={files} 
             loading={loading} 
             viewMode={viewMode}
             selectionMode={true}
             selectedIds={selectedFiles.map(f => f.media_id)}
             onSelect={handleSelect}
           />
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500">
            {files.length} items found
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {multiple && (
              <button 
                onClick={handleConfirm}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select ({selectedFiles.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
