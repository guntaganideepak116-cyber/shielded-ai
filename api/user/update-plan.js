import { db } from '../lib/firebase-admin.js';

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

  const { userId, plan } = req.body;
  if (!userId || !plan) {
    return res.status(400).json({ error: 'userId and plan required' });
  }

  const allowedPlans = ['free', 'pro', 'enterprise'];
  if (!allowedPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    // In a real app, you'd verify payment before this
    await db.collection('users').doc(userId).set({
      plan,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({
      success: true,
      message: `Plan upgraded to ${plan}`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
