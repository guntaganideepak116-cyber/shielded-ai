import { db, admin } from '../../lib/firebase-admin.js';

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
    // Check if site is reachable with fallback
    let reachable = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const check = await fetch(parsedUrl.toString(), {
        method: 'GET', // Use GET as it's more likely to be allowed
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      reachable = check.status < 500;
      clearTimeout(timeout);
    } catch {
      // If network error, still allow if it's a validly formatted URL
      reachable = true; 
    }

    if (!reachable) {
      return res.status(400).json({
        error: `Website ${parsedUrl.hostname} is unresponsive. Please check the URL.`
      });
    }

    if (!db) {
      throw new Error('Database connection not established. Check Firebase Environment Variables.');
    }

    // Save to Firestore using server-side timestamps for reliability
    const siteData = {
      userId,
      url: parsedUrl.toString(),
      domain: parsedUrl.hostname,
      alertEmail: alertEmail || '',
      enabled: true,
      lastScore: 0,
      lastStatus: 'pending',
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
    console.error('Monitor add error:', err.message);
    return res.status(500).json({ 
      error: 'Security Node Error', 
      message: err.message,
      suggestion: 'Ensure FIREBASE_PROJECT_ID and other service account keys are set.' 
    });
  }
}
