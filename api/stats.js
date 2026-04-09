import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
        : null;
        
      if (serviceAccount) {
          admin.initializeApp({
              credential: admin.credential.cert(serviceAccount)
          });
      }
    } catch (e) {
      console.warn("Firebase Admin could not initialize in Stats API.");
    }
}

const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!db) throw new Error("Database not connected");

    // Count real scans from Firestore
    const scansSnapshot = await db.collection('scans').count().get();
    const totalScans = scansSnapshot.data().count;

    // Count real users
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Count secure sites (score >= 90)
    const secureSnapshot = await db.collection('scans')
      .where('score', '>=', 90)
      .count()
      .get();
    const secureCount = secureSnapshot.data().count;

    return res.status(200).json({
      totalScans,
      totalUsers,
      secureCount,
      updatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("Stats API Error:", err.message);
    return res.status(200).json({
      totalScans: 0,
      totalUsers: 0,
      secureCount: 0
    });
  }
}
