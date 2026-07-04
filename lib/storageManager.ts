import { SheetData } from '@/types/grid';

const STORAGE_KEY = 'minisheet-grid';

function getDefaultSheetData(): SheetData {
  return {
    grid: {},
    lastModified: Date.now(),
  };
}

/**
 * Loads the grid state from localStorage.
 * Returns a default empty SheetData when running on the server (SSR)
 * or when no data has been persisted yet.
 */
export function loadGrid(): SheetData {
  if (typeof window === 'undefined') {
    return getDefaultSheetData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultSheetData();
    }

    const parsed = JSON.parse(raw) as Partial<SheetData>;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.grid !== 'object') {
      return getDefaultSheetData();
    }

    return {
      grid: parsed.grid ?? {},
      lastModified: typeof parsed.lastModified === 'number' ? parsed.lastModified : Date.now(),
    };
  } catch {
    return getDefaultSheetData();
  }
}

/**
 * Serialises the given SheetData to JSON and persists it to localStorage.
 * No-op when running on the server (SSR) or if localStorage is unavailable.
 */
export function saveGrid(data: SheetData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Swallow errors (e.g. storage quota exceeded, privacy mode restrictions).
  }
}
