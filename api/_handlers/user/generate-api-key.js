import { db } from '../../lib/firebase-admin.js';
import crypto from 'crypto';

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

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    // Generate secure random API key
    const apiKey = 'sw_' + crypto
      .randomBytes(24)
      .toString('base64url');

    // Save to Firestore
    await db.collection('users').doc(userId).set({
      apiKey,
      apiKeyCreatedAt: new Date().toISOString(),
      plan: 'free',
      dailyScansUsed: 0,
      dailyScansReset: new Date().toISOString(),
    }, { merge: true });

    return res.status(200).json({
      success: true,
      apiKey
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
