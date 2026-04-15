import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ScanResult } from './scan-data';

const STORAGE_KEY = 'secureweb_scan_history';

export function saveScan(scan: ScanResult): void {
  const history = getHistory();
  // Ensure we don't save duplicates
  if (history.some(h => h.url === scan.url && Math.abs(new Date(h.timestamp).getTime() - new Date().getTime()) < 60000)) return;
  
  history.unshift({ ...scan, timestamp: new Date().toISOString() });
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

export async function syncLocalHistory(userId: string): Promise<void> {
  const history = getHistory();
  if (history.length === 0) return;

  try {
    const scansRef = collection(db, 'scans');
    for (const scan of history) {
      await addDoc(scansRef, {
        ...scan,
        userId,
        createdAt: serverTimestamp(),
        synced: true
      });
    }
    clearHistory();
  } catch (err) {
    console.error("History sync failed:", err);
  }
}
