import { db, admin } from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, url, alertEmail } = req.body;

  if (!userId || !url) {
    return res.status(400).json({ error: 'userId and url required' });
  }

  // Validate URL
  let parsedUrl;
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    parsedUrl = new URL(cleanUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check if site is reachable
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    let reachable = false;
    try {
      const check = await fetch(parsedUrl.toString(), {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'SecureWeb-AI-Monitor/1.0' }
      });
      reachable = check.status < 500;
    } catch {
      reachable = false;
    } finally {
      clearTimeout(timeout);
    }

    if (!reachable) {
      return res.status(400).json({
        error: `Cannot reach ${parsedUrl.hostname}. Check the URL is correct.`
      });
    }

    // Save to Firestore
    const siteData = {
      userId,
      url: parsedUrl.toString(),
      domain: parsedUrl.hostname,
      alertEmail: alertEmail || '',
      enabled: true,
      lastScore: 0,
      lastStatus: 'pending',
      lastChecked: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      checkInterval: 'daily',
      uptime: 100
    };

    const docRef = await db
      .collection('monitors')
      .doc(userId)
      .collection('sites')
      .add(siteData);

    return res.status(200).json({
      success: true,
      siteId: docRef.id,
      message: `Now monitoring ${parsedUrl.hostname}`
    });

  } catch (err) {
    console.error('Monitor add error:', err);
    return res.status(500).json({ error: err.message });
  }
}
