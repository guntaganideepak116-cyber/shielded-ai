const API_URL = ''; // Relative to same origin (Vercel rewrites)

export async function fetchUserScans() {
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

export async function runScan(url: string, userId?: string) {
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
  // Since we are using Express without WebSockets for now, 
  // we'll just poll or rely on initial load.
  // Real-time could be added via SSE or WebSockets later.
  const interval = setInterval(async () => {
    const count = await getGlobalScanCount();
    callback(count);
  }, 30000);

  return () => clearInterval(interval);
}
