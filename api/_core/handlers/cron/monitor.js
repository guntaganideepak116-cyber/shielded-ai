import { db, admin } from '../../lib/firebase-admin.js';
import axios from 'axios';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  try {
    const monitorsSnap = await db.collectionGroup('sites').where('enabled', '==', true).get();
    const results = [];

    for (const doc of monitorsSnap.docs) {
      const monitor = doc.data();
      const { url, email, lastScore } = monitor;

      try {
        const scanResponse = await axios.post(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/scan`, { url });
        const newResult = scanResponse.data;
        const newScore = newResult.score;

        await doc.ref.update({
          lastScore: newScore,
          lastChecked: new Date()
        });

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

    return res.status(200).json({ success: true, scans: results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
