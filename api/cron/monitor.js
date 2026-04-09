const admin = require('firebase-admin');
const axios = require('axios');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : null;
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  } catch (e) {}
}

const db = admin.apps.length ? admin.firestore() : null;

module.exports = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  try {
    // This is a simplified cron that iterates over all users' monitors
    // Performance Note: For many users, this should be parallelized or batched
    const monitorsSnap = await db.collectionGroup('sites').where('enabled', '==', true).get();
    const results = [];

    for (const doc of monitorsSnap.docs) {
      const monitor = doc.data();
      const { url, email, lastScore } = monitor;

      // Run new scan (Internal call or external call to the scan API)
      // For Vercel Serverless, we can use an internal function or just re-implement the scan logic
      // Simplest: call the local scan API endpoint
      try {
        const scanResponse = await axios.post(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/scan`, { url });
        const newResult = scanResponse.data;
        const newScore = newResult.score;

        // Update last checked
        await doc.ref.update({
          lastScore: newScore,
          lastChecked: new Date()
        });

        // 4. Send email if score dropped significantly (10+ points)
        if (lastScore && (lastScore - newScore) >= 10) {
           await resend.emails.send({
             from: 'SecureWeb AI <onboarding@resend.dev>',
             to: email,
             subject: `🚨 ALERT: Security Score Drop for ${url}`,
             html: `
               <h2>Security Alert</h2>
               <p>The security score for ${url} has dropped from ${lastScore} to ${newScore}.</p>
               <p>Please review your security settings immediately.</p>
               <a href="https://secureweb-ai.vercel.app/dashboard">View Dashboard</a>
             `
           });
        }

        results.push({ url, status: 'scanned', score: newScore });
      } catch (e) {
        results.push({ url, status: 'failed', error: e.message });
      }
    }

    res.status(200).json({ success: true, scans: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
