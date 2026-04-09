import axios from 'axios';
import admin from 'firebase-admin';
import { checkHeaders } from '../lib/headerChecks.js';
import { checkSSL } from '../lib/sslCheck.js';
import { checkVirusTotal } from '../lib/virusTotal.js';
import { calculateScore, getStatus } from '../lib/scoreCalculator.js';

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
      console.warn("Firebase Admin could not initialize in Scan API.");
    }
}

const db = admin.apps.length ? admin.firestore() : null;

// Simple in-memory rate limit store
const ipStore = new Map();

export default async function handler(req, res) {
  // Access-Control headers for Vercel
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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // URL Pre-processing: Ensure protocol exists
  let targetUrlInput = url.trim();
  if (!targetUrlInput.startsWith('http://') && !targetUrlInput.startsWith('https://')) {
    targetUrlInput = 'https://' + targetUrlInput;
  }

  // 1. Rate Limiting (5 per IP per min)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 60000;
  if (ipStore.has(ip)) {
      const { count, start } = ipStore.get(ip);
      if (now - start < windowMs) {
          if (count >= 5) {
              return res.status(429).json({ error: 'Rate limit exceeded. Max 5 scans per minute.' });
          }
          ipStore.set(ip, { count: count + 1, start });
      } else {
          ipStore.set(ip, { count: 1, start: now });
      }
  } else {
      ipStore.set(ip, { count: 1, start: now });
  }

  // 2. URL Validation & Reachability
  // STEP 1: Basic validation
  if (!targetUrlInput || typeof targetUrlInput !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a URL to scan'
    });
  }

  // STEP 3: Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrlInput);
  } catch (e) {
    return res.status(400).json({
      status: 'invalid',
      message: `"${url}" is not a valid URL format. Example: https://google.com`
    });
  }

  // STEP 4: Block dangerous/private URLs
  const hostname = parsedUrl.hostname;
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(hostname);
  
  if (blockedHosts.includes(hostname) || isPrivateIP) {
    return res.status(400).json({
      status: 'blocked',
      message: 'Local/private URLs cannot be scanned for security reasons'
    });
  }

  const targetUrl = parsedUrl.toString();

  // STEP 5: REAL EXISTENCE CHECK
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'SecureWeb-AI-Scanner/1.0' }
    });
    clearTimeout(timeoutId);
    
    // If it's a 4xx or 5xx, some sites block HEAD, we'll let axios.get try later
    // Only block if it's a DNS failure (ENOTFOUND) handled in the catch block
  } catch (fetchError) {
    if (fetchError.name === 'AbortError') {
      return res.status(400).json({
        status: 'timeout',
        message: `Cannot reach "${hostname}". The website is taking too long to respond.`,
        url: targetUrl
      });
    }

    // DNS failure or complete connection failure
    if (fetchError.name === 'TypeError' || fetchError.code === 'ENOTFOUND' || fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('getaddrinfo')) {
      return res.status(400).json({
        status: 'not_found',
        message: `"${hostname}" does not exist on the internet. Please check the URL.`,
        url: targetUrl,
        suggestions: [
          `Did you mean https://www.${hostname}?`,
          'Check for typos in the URL'
        ]
      });
    }

    // For other errors (CORS, SSL during HEAD, 403 on HEAD), we'll let the main axios.get handle it or fail there.
    // So we DON'T throw/return here if it's just a general failure of the HEAD request.
  }

  try {
    // 3. Parallel Scanning
    const [probeRes, sslResult, vtResult] = await Promise.all([
      axios.get(targetUrl, { 
        timeout: 10000, 
        validateStatus: () => true 
      }),
      checkSSL(hostname),
      checkVirusTotal(targetUrl, process.env.VIRUSTOTAL_API_KEY)
    ]);

    const headers = probeRes?.headers || {};
    const { findings, status: headerStatus } = checkHeaders(headers);

    // Additional Check: HTTP to HTTPS Redirect
    if (parsedUrl.protocol === 'http:') {
        // If it returns a 3xx redirect to https, it's fine.
        // We'll just check if the initial request was http and no HSTS.
        findings.push({
            id: 'unsecured-protocol',
            title: 'Unsecured Protocol (HTTP)',
            severity: 'high',
            description: 'This URL uses HTTP which does not provide encryption.',
            header: 'N/A'
        });
    }

    // SSL findings integration
    if (!sslResult.valid || sslResult.daysUntilExpiry <= 0) {
        findings.push({
            id: 'invalid-ssl',
            title: 'Invalid or Expired SSL',
            severity: 'high',
            description: 'SSL certificate is missing, expired, or invalid.',
            header: 'N/A'
        });
    } else if (sslResult.daysUntilExpiry < 30) {
        findings.push({
            id: 'low-ssl-expiry',
            title: 'SSL Expiring Soon',
            severity: 'medium',
            description: `SSL certificate will expire in ${sslResult.daysUntilExpiry} days.`,
            header: 'N/A'
        });
    }

    // VirusTotal findings integration
    if (vtResult.malicious > 0) {
        findings.push({
            id: 'malicious-detection',
            title: 'Malicious URL detected',
            severity: 'high',
            description: 'URL flagged as malicious by multiple security engines via VirusTotal.',
            header: 'N/A'
        });
    } else if (vtResult.suspicious > 0) {
        findings.push({
            id: 'suspicious-detection',
            title: 'Suspicious URL flagging',
            severity: 'medium',
            description: 'One or more security engines flagged this URL as suspicious.',
            header: 'N/A'
        });
    }
    // OWASP Top 10 Analysis
    const owaspResults = {
      a01: { name: 'Broken Access Control', status: 'pass' },
      a03: { name: 'Injection/Disclosure', status: 'pass' },
      a05: { name: 'Security Misconfiguration', status: 'pass' },
      a06: { name: 'Vulnerable Components', status: 'pass' },
      a07: { name: 'Auth Failures', status: 'pass' }
    };

    if (headers['x-powered-by'] || headers['server']) {
        owaspResults.a03.status = 'warn'; owaspResults.a06.status = 'warn';
    }
    if (!headers['set-cookie']?.toString().includes('Secure')) owaspResults.a07.status = 'warn';
    if (!headers['x-content-type-options']) owaspResults.a05.status = 'fail';

    const score = calculateScore(findings, sslResult, vtResult);

    // Fetch previous scan score from Firestore (if exists)
    let prevScore = null;
    if (db) {
        try {
            const prevScanRef = await db.collection("scans")
                .where("url", "==", targetUrl)
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();
            if (!prevScanRef.empty) {
                prevScore = prevScanRef.docs[0].data().score;
            }
        } catch (fErr) {
            console.error("Firestore history fetch failed:", fErr);
        }
    }

    const result = {
      url: targetUrl,
      status: getStatus(score),
      score,
      prevScore, 
      scannedAt: new Date().toISOString(),
      ssl: sslResult,
      virusTotal: vtResult,
      vulnerabilities: findings,
      headers: headerStatus,
      owasp: owaspResults
    };

    // Save to Firestore (History)
    if (db) {
        try {
            await db.collection("scans").add({
                url: targetUrl,
                score: result.score,
                status: result.status,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                vulnerabilities: findings,
                headers: headerStatus,
                ssl: sslResult,
                virusTotal: vtResult
            });
        } catch (dbErr) {
            console.error("Firestore Save Error:", dbErr.message);
        }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Scan API Error:", error.message);
    return res.status(200).json({ 
      url, 
      status: "unreachable", 
      message: "The website could not be reached or timed out." 
    });
  }
}
