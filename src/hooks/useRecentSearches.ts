import { useState, useEffect, useCallback } from "react";

export interface RecentSearchItem {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelClass: string;
  timestamp: number;
  tripType: string;
  segments?: Array<{ origin: string; destination: string; date: string }>;
}

const STORAGE_KEY = "recent_searches";
const MAX_ITEMS = 50;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const loadSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent searches", error);
    }
  }, []);

  useEffect(() => {
    loadSearches();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadSearches();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener("local-storage-update", loadSearches);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-update", loadSearches);
    };
  }, [loadSearches]);

  const addSearch = useCallback((search: Omit<RecentSearchItem, "id" | "timestamp">) => {
    try {
      const newSearch: RecentSearchItem = {
        ...search,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const currentItems: RecentSearchItem[] = stored ? JSON.parse(stored) : [];

      // Remove duplicates
      const filtered = currentItems.filter(
        (item) =>
          !(
            item.origin === search.origin &&
            item.destination === search.destination &&
            item.departureDate === search.departureDate &&
            item.returnDate === search.returnDate &&
            item.tripType === search.tripType
          )
      );

      const updated = [newSearch, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
      window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
      console.error("Failed to add recent search", error);
    }
  }, []);

  const removeSearch = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const currentItems: RecentSearchItem[] = JSON.parse(stored);
      const updated = currentItems.filter((item) => item.id !== id);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
      window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
      console.error("Failed to remove recent search", error);
    }
  }, []);

  const clearSearches = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
      window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
      console.error("Failed to clear recent searches", error);
    }
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
