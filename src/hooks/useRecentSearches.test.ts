import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from './useRecentSearches';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substring(7)
  }
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window dispatchEvent
window.dispatchEvent = vi.fn();

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual([]);
  });

  it('should add a search', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    const search = {
      origin: 'SYD',
      destination: 'MEL',
      departureDate: '2023-12-01',
      returnDate: '2023-12-10',
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'Economy',
      tripType: 'Round Trip'
    };

    act(() => {
      result.current.addSearch(search);
    });

    expect(result.current.recentSearches).toHaveLength(1);
    expect(result.current.recentSearches[0].origin).toBe('SYD');
    expect(result.current.recentSearches[0].timestamp).toBeDefined();
  });

  it('should remove a search', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    const search = {
      origin: 'SYD',
      destination: 'MEL',
      departureDate: '2023-12-01',
      returnDate: '2023-12-10',
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'Economy',
      tripType: 'Round Trip'
    };

    act(() => {
      result.current.addSearch(search);
    });

    const id = result.current.recentSearches[0].id;

    act(() => {
      result.current.removeSearch(id);
    });

    expect(result.current.recentSearches).toHaveLength(0);
  });

  it('should clear all searches', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    act(() => {
      result.current.addSearch({
        origin: 'SYD',
        destination: 'MEL',
        departureDate: '2023-12-01',
        returnDate: '2023-12-10',
        passengers: { adults: 1, children: 0, infants: 0 },
        travelClass: 'Economy',
        tripType: 'Round Trip'
      });
      result.current.addSearch({
        origin: 'BNE',
        destination: 'PER',
        departureDate: '2023-12-05',
        returnDate: '2023-12-15',
        passengers: { adults: 2, children: 0, infants: 0 },
        travelClass: 'Business',
        tripType: 'Round Trip'
      });
    });

    expect(result.current.recentSearches).toHaveLength(2);

    act(() => {
      result.current.clearSearches();
    });

    expect(result.current.recentSearches).toHaveLength(0);
    expect(localStorage.getItem('recent_searches')).toBeNull();
  });

  it('should handle duplicates by moving to top', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    const search1 = {
      origin: 'SYD',
      destination: 'MEL',
      departureDate: '2023-12-01',
      returnDate: '2023-12-10',
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'Economy',
      tripType: 'Round Trip'
    };

    act(() => {
      result.current.addSearch(search1);
    });
    
    // Add same search again
    act(() => {
      result.current.addSearch(search1);
    });

    // Should still be 1 (or 2 if we allow dups, but my implementation filters them)
    // My implementation filters: item.origin === search.origin ...
    expect(result.current.recentSearches).toHaveLength(1);
    
    // Verify it's a new object (new id/timestamp)
    // Actually, I filter *prev* items that match. Then add new.
    // So the ID should change.
  });

  it('should limit to 50 items', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addSearch({
          origin: `SYD${i}`,
          destination: 'MEL',
          departureDate: '2023-12-01',
          returnDate: '2023-12-10',
          passengers: { adults: 1, children: 0, infants: 0 },
          travelClass: 'Economy',
          tripType: 'Round Trip'
        });
      }
    });

    expect(result.current.recentSearches).toHaveLength(50);
    // The last added (SYD59) should be first
    expect(result.current.recentSearches[0].origin).toBe('SYD59');
  });
});
