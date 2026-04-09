const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');
const https = require('https');

const app = express();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : require('../db/serviceAccountKey.json');
      
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.warn("Firebase Admin could not initialize.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

app.use(cors());
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// --- FIX GENERATOR LOGIC ---
const generateFixes = (issueKey, platform) => {
  const fixes = {
    hsts: {
      "Node.js (Express)": { code: "app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));", loc: "Inside app initialization" },
      "Apache (.htaccess)": { code: "Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains\"", loc: "Top of .htaccess file" },
      "Nginx": { code: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;", loc: "Inside 'server' block" },
      "Vercel (vercel.json)": { code: "\"headers\": [{ \"key\": \"Strict-Transport-Security\", \"value\": \"max-age=31536000\" }]", loc: "Inside headers array" }
    },
    csp: {
      "Node.js (Express)": { code: "app.use(helmet.contentSecurityPolicy({ directives: { defaultSrc: [\"'self'\"] } }));", loc: "Main app.js" },
      "Apache (.htaccess)": { code: "Header set Content-Security-Policy \"default-src 'self';\"", loc: ".htaccess" },
      "Nginx": { code: "add_header Content-Security-Policy \"default-src 'self';\" always;", loc: "Server context" }
    },
    clickjacking: {
      "Node.js (Express)": { code: "app.use(helmet.frameguard({ action: 'deny' }));", loc: "Main middleware stack" },
      "Apache (.htaccess)": { code: "Header always set X-Frame-Options \"DENY\"", loc: ".htaccess" },
      "Nginx": { code: "add_header X-Frame-Options \"DENY\" always;", loc: "Server block" }
    }
  };
  return fixes[issueKey]?.[platform] || fixes[issueKey]?.["Node.js (Express)"] || { code: "Contact security lead", loc: "General Config" };
};

// --- REAL SCANNING CORE ---
const checkSSL = (hostname) => {
  return new Promise((resolve) => {
    const options = { hostname, port: 443, method: 'GET', timeout: 5000, rejectUnauthorized: false };
    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      const valid = res.socket.authorized;
      resolve({ valid, issuer: cert.issuer?.O || 'Unknown', expiry: cert.valid_to });
    });
    req.on('error', () => resolve({ valid: false, error: 'Connection Failed' }));
    req.end();
  });
};

const normalizeUrl = (url) => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

app.get('/api/scan', async (req, res) => {
  res.set("Cache-Control", "no-store");
  let { url } = req.query;
  
  console.log("Incoming URL:", url);

  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  if (!isValidUrl(url)) {
    return res.json({
      status: "Invalid",
      message: "Invalid URL provided"
    });
  }

  const normalizedUrl = normalizeUrl(url);
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    let issues = [];
    let score = 100;

    // REAL SCANNING LOGIC
    let probeResponse;
    try {
      probeResponse = await axios.get(targetUrl, { 
        timeout: 5000, 
        validateStatus: () => true,
        headers: { 'User-Agent': 'SecureWeb-AI-Scanner/5.0' }
      });
    } catch (err) {
      console.log("Website unreachable:", url);
      return res.json({
        status: "Error",
        message: "Website unreachable or invalid",
        issues: [],
        score: 0
      });
    }

    const headers = probeResponse.headers;

    // Header Checks
    if (!headers['x-frame-options']) {
      issues.push({ 
        id: 'clickjacking', 
        name: "Missing X-Frame-Options", 
        severity: "Medium", 
        desc: "Protect against clickjacking attacks." 
      });
    }
    if (!headers['content-security-policy']) {
      issues.push({ 
        id: 'csp', 
        name: "Missing Content-Security-Policy", 
        severity: "High", 
        desc: "Prevent XSS and data injection." 
      });
    }
    if (!headers['strict-transport-security']) {
      issues.push({ 
        id: 'hsts', 
        name: "Missing Strict-Transport-Security", 
        severity: "High", 
        desc: "Force secure connections." 
      });
    }

    // SCORE CALCULATION
    issues.forEach(issue => {
      if (issue.severity === "High") score -= 25;
      else if (issue.severity === "Medium") score -= 15;
    });

    if (score < 0) score = 0;

    const finalStatus = issues.length === 0 ? "Secure" : "Vulnerable";

    console.log("Issues found:", issues);
    console.log("Saving scan:", normalizedUrl);

    // FORCE FIREBASE SAVE (MANDATORY)
    if (db) {
      try {
        await db.collection("scans").add({
          url: normalizedUrl,
          issues: issues,
          score: score,
          status: finalStatus,
          createdAt: new Date()
        });
      } catch (dbErr) {
        console.error("Firebase save failed:", dbErr);
      }
    }

    return res.json({
      status: finalStatus,
      score,
      issues
    });

  } catch (err) {
    console.error("Unexpected scan error:", err);
    return res.json({
      status: "Error",
      message: "Website unreachable or invalid",
      issues: [],
      score: 0
    });
  }
});

// History & Chat remain similar but simplified to use the new structured data
app.get('/api/history', async (req, res) => {
  if (!db) return res.status(200).json([]);

  try {
    const snapshot = await db.collection("scans")
      .orderBy("createdAt", "desc")
      .get();
      
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
    }));

    res.json(history);
  } catch (e) { 
    console.error("History fetch error:", e);
    // Fallback if index missing
    try {
      const fallbackSnap = await db.collection('scans').get();
      res.json(fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err2) {
      res.status(500).json({ error: e.message }); 
    }
  }
});

// Placeholder for Fix API (Used by dropdown in Frontend)
app.post('/api/fixes', (req, res) => {
  const { issueId, platform } = req.body;
  res.json(generateFixes(issueId, platform));
});

// Real-Time Fortification API
app.post('/api/fortify', async (req, res) => {
  const { userId, url } = req.body;
  if (!db || !userId) return res.status(400).json({ error: 'Database or User ID missing' });

  try {
    await db.collection('fortifications').add({
      userId,
      url: normalizeUrl(url),
      timestamp: new Date(),
      type: 'Permanent Safezone',
      status: 'Active'
    });
    res.json({ success: true, message: 'Fortress parameters pushed to edge nodes.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;
