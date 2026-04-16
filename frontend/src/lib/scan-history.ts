import { ScanResult } from './scan-data';

const STORAGE_KEY = 'secureshield_scan_history';

export function saveScan(scan: ScanResult): void {
  const history = getHistory();
  history.unshift(scan);
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
