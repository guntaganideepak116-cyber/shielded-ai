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
    console.warn("Firebase Admin could not initialize in History API.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!db) {
      return res.status(200).json([]);
  }

  try {
    const snapshot = await db.collection("scans")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
      
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
    }));

    return res.status(200).json(history);
  } catch (e) { 
    console.error("History fetch error:", e);
    return res.status(500).json({ error: e.message }); 
  }
}
