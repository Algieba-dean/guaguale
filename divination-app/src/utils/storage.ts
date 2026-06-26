const STORAGE_KEY = 'divination_history';
const MAX_RECORDS = 500;
const WARNING_THRESHOLD = 0.8; // 80% capacity

export interface DivinationRecord {
  id: string;
  timestamp: number;
  type: 'liuyao' | 'meihua' | 'ziwei' | 'shaker';
  question?: string;
  data: {
    // Liuyao-specific
    mainHexagram?: number;
    changingLines?: number[];
    transformedHexagram?: number | null;

    // Meihua-specific
    method?: 'number' | 'time';
    inputValues?: number[] | { year: number; month: number; day: number; hour: number };
    hexagram?: number;
    changingLine?: number;

    // Ziwei-specific
    birthInfo?: {
      year: number;
      month: number;
      day: number;
      hour: number;
      gender: 'male' | 'female';
    };
    chartData?: any;

    // Shaker-specific
    shakerData?: {
      poolName: string;
      stickTitle: string;
      stickFortune: string;
      stickExplanation: string;
    };
  };
  userNote?: string;
  accuracy?: boolean | null;
}

interface HistoryStorage {
  history: DivinationRecord[];
}

/**
 * Get all history records
 */
export function getHistory(): DivinationRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: HistoryStorage = JSON.parse(data);
    return parsed.history || [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Save a new divination record
 */
export function saveRecord(record: DivinationRecord): boolean {
  try {
    const history = getHistory();

    // Enforce max records limit
    if (history.length >= MAX_RECORDS) {
      // Remove oldest record
      history.shift();
    }

    history.push(record);

    const storage: HistoryStorage = { history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error('Failed to save record:', error);
    }
    return false;
  }
}

/**
 * Update an existing record
 */
export function updateRecord(id: string, updates: Partial<DivinationRecord>): boolean {
  try {
    const history = getHistory();
    const index = history.findIndex(r => r.id === id);

    if (index === -1) return false;

    history[index] = { ...history[index], ...updates };

    const storage: HistoryStorage = { history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return true;
  } catch (error) {
    console.error('Failed to update record:', error);
    return false;
  }
}

/**
 * Delete a specific record
 */
export function deleteRecord(id: string): boolean {
  try {
    const history = getHistory();
    const filtered = history.filter(r => r.id !== id);

    const storage: HistoryStorage = { history: filtered };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return true;
  } catch (error) {
    console.error('Failed to delete record:', error);
    return false;
  }
}

/**
 * Clear all history
 */
export function clearAllHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
}

/**
 * Get storage capacity warning
 * Returns true if usage is above 80% threshold
 */
export function shouldShowCapacityWarning(): boolean {
  const history = getHistory();
  return history.length >= MAX_RECORDS * WARNING_THRESHOLD;
}

/**
 * Get storage stats
 */
export function getStorageStats() {
  const history = getHistory();
  return {
    count: history.length,
    maxRecords: MAX_RECORDS,
    percentageFull: (history.length / MAX_RECORDS) * 100,
    shouldWarn: shouldShowCapacityWarning()
  };
}
