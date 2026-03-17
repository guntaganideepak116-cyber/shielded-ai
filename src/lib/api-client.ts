const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function callSecurityScan(url: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error('Scan failed');
    return await response.json();
  } catch (error) {
    console.error('API Scan Error:', error);
    return null;
  }
}

export async function saveScanToDb(userId: string, scanResult: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scanResult }),
    });

    if (!response.ok) throw new Error('Failed to save history');
    return true;
  } catch (error) {
    console.error('API Save Error:', error);
    return false;
  }
}

export async function fetchUserHistory(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/history?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    return [];
  }
}

export async function incrementGlobalCounter() {
  // This could also be moved to the backend
  console.log('Global counter logic would go here');
}
