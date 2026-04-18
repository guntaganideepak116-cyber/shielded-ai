import { type ScanResult, type AiFixResponse } from './scan-data';

const API_BASE_URL = '/api';

export async function callSecurityScan(url: string, scanType: string = 'basic'): Promise<ScanResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, scanType }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Scan failed');
    return await response.json();
  } catch (error) {
    console.error('API Scan Error:', error);
    return null;
  }
}

export async function getAiFixes(scanResult: ScanResult): Promise<AiFixResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: scanResult.url,
        vulnerabilities: scanResult.vulnerabilities,
        ssl: scanResult.ssl,
        virusTotal: scanResult.virusTotal
      }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('AI Fix generation failed');
    return await response.json();
  } catch (error) {
    console.error('AI Fix Error:', error);
    return null;
  }
}

export async function fetchUserHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    return [];
  }
}

export async function fortifySecurity(userId: string, url: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/fortify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, url }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Fortification failed');
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Fortification Error:', error);
    return false;
  }
}

export async function sendEmailAlert(email: string, scanResult: ScanResult, alertType: string = 'report', previousScore: number | null = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, alertType, scanResult, previousScore })
    });

    if (!response.ok) throw new Error('Email alert failed');
    return await response.json();
  } catch (error) {
    console.error('Email API Error:', error);
    return null;
  }
}
