const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');

const app = express();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // For Vercel, we'll use environment variables instead of a file
    // but users can still upload the file if they prefer.
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : require('../db/serviceAccountKey.json');
      
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.warn("Firebase Admin could not initialize. Check environment variables or serviceAccountKey.json.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Security Scan Endpoint
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Perform Head Request for efficiency
    const response = await axios.head(targetUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'SECURESHIELD-AI-Scanner/2.0' },
      validateStatus: () => true
    });

    const headers = response.headers;
    
    const securityChecks = {
      hsts: !!headers['strict-transport-security'],
      csp: !!headers['content-security-policy'],
      frameOptions: !!headers['x-frame-options'],
      contentTypeOptions: !!headers['x-content-type-options'],
      xssProtection: !!headers['x-xss-protection'],
      referrerPolicy: !!headers['referrer-policy'],
      serverInfo: headers['server'] || headers['x-powered-by'] || null,
    };

    const platform = headers['server'] || headers['x-powered-by'] || 'unknown';

    res.json({ 
      url: targetUrl, 
      securityChecks, 
      platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan website', details: error.message });
  }
});

// Save Scan Result
app.post('/api/history', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  
  const { userId, scanResult } = req.body;
  if (!userId || !scanResult) return res.status(400).json({ error: 'Missing data' });

  try {
    await db.collection('scans').add({
      userId,
      ...scanResult,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

// Get Scan History
app.get('/api/history', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'UserId is required' });

  try {
    const snapshot = await db.collection('scans')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const scans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().createdAt?.toDate()?.toISOString()
    }));
    
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});

module.exports = app;
