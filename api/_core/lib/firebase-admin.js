import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let serviceAccount = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        // Handle unescaped newlines that often happen in Vercel env vars
        const cleanJson = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\n/g, '\\n').trim();
        serviceAccount = JSON.parse(cleanJson);
      } catch (e) {
        // Fallback: try raw parse if cleaning failed
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      }
    }

    if (serviceAccount) {
      // Ensure the private key has real newlines
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (error) {
    console.error('CRITICAL: Firebase admin initialization failed:', error.message);
  }
}

const db = admin.firestore();
export { db, admin };
