const admin = require('firebase-admin');

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
  if (!db) return res.status(500).json({ error: 'Database not initialized' });

  if (req.method === 'POST') {
    const { userId, url, email, enabled } = req.body;
    if (!userId || !url) return res.status(400).json({ error: 'Missing data' });

    try {
      const monitorId = Buffer.from(url).toString('base64').substring(0, 20);
      await db.collection('monitors').doc(userId).collection('sites').doc(monitorId).set({
        url,
        email,
        enabled,
        lastChecked: new Date(),
        createdAt: new Date(),
        checkInterval: 'daily'
      }, { merge: true });

      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
      const snapshot = await db.collection('monitors').doc(userId).collection('sites').get();
      const sites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(sites);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
