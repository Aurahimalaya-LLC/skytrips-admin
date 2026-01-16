"use client";

interface MediaFilterProps {
  filters: {
    search: string;
    type: string;
    category: string;
  };
  setFilters: (filters: any) => void;
}

export function MediaFilter({ filters, setFilters }: MediaFilterProps) {
  const handleChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border  border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4 ">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">
        Filters
      </h3>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Search
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search files..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          File Type
        </label>
        <select
          value={filters.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        >
          <option value="all">All Categories</option>
          <option value="uncategorized">Uncategorized</option>
          <option value="marketing">Marketing</option>
          <option value="documents">Documents</option>
          <option value="profiles">Profiles</option>
        </select>
      </div>
    </div>
  );
}
