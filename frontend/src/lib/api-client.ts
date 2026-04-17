import { type Vulnerability } from './scan-data';

const API_URL = ''; // Relative to origin

export interface ScanItem {
  id: string;
  url: string;
  score: number;
  grade: string;
  vulnerabilities: Vulnerability[];
  created_at?: string;
  timestamp?: Date | string;
}

export interface ScanResponse {
  score: number;
  grade: string;
  platform: string;
  vulnerabilities: Vulnerability[];
}

export async function fetchUserScans(): Promise<ScanItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
}

export async function getGlobalScanCount(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();
    return data.totalScans || 12400;
  } catch (error) {
    console.error('Error fetching counter:', error);
    return 12400;
  }
}

export async function runScan(url: string, userId?: string): Promise<ScanResponse> {
  const response = await fetch(`${API_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, userId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Scan failed');
  }
  
  return await response.json();
}

export function subscribeToCounter(callback: (value: number) => void) {
  const interval = setInterval(async () => {
    const count = await getGlobalScanCount();
    callback(count);
  }, 30000);

  return () => clearInterval(interval);
}
