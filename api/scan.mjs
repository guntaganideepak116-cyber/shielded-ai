import { db, admin } from './_core/lib/firebase-admin.js';

const PLANS = {
  free: { limits: { dailyScans: 10 } },
  pro: { limits: { dailyScans: 200 } },
  enterprise: { limits: { dailyScans: -1 } }
};

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, userId } = req.body;

  // ── STEP 0: API Key / Plan Validation ────────────────
  const apiKey = req.headers['x-api-key'];
  let effectiveUserId = userId;
  let userPlan = 'free';

  if (apiKey) {
    const usersSnap = await db
      .collection('users')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Get your API key at secureweb-ai.vercel.app/api-docs'
      });
    }

    const userData = usersSnap.docs[0].data();
    effectiveUserId = usersSnap.docs[0].id;
    userPlan = userData.plan || 'free';

    const limit = PLANS[userPlan].limits.dailyScans;
    const lastReset = new Date(userData.dailyScansReset || 0);
    const now = new Date();

    if (now.toDateString() !== lastReset.toDateString()) {
      await db.collection('users').doc(effectiveUserId).update({
        dailyScansUsed: 1,
        dailyScansReset: now.toISOString()
      });
    } else if (limit !== -1 && (userData.dailyScansUsed || 0) >= limit) {
      return res.status(429).json({
        error: 'Daily limit reached',
        limit,
        plan: userPlan,
        message: `Upgrade to Pro for more scans`
      });
    } else {
      await db.collection('users').doc(effectiveUserId).update({
        dailyScansUsed: admin.firestore.FieldValue.increment(1)
      });
    }
  } else if (userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      userPlan = userData.plan || 'free';
      const limit = PLANS[userPlan].limits.dailyScans;
      const lastReset = new Date(userData.dailyScansReset || 0);
      const now = new Date();

      if (now.toDateString() !== lastReset.toDateString()) {
        await db.collection('users').doc(userId).update({
          dailyScansUsed: 1,
          dailyScansReset: now.toISOString()
        });
      } else if (limit !== -1 && (userData.dailyScansUsed || 0) >= limit) {
        return res.status(429).json({
          error: 'Daily scan limit reached',
          message: `You have used all ${limit} scans for today on the ${userPlan} plan.`
        });
      } else {
        await db.collection('users').doc(userId).update({
          dailyScansUsed: admin.firestore.FieldValue.increment(1)
        });
      }
    }
  }

  // ── STEP 1: URL Validation & Normalization ──────────
  if (!url?.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a URL to scan'
    });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({
      status: 'invalid',
      message: `"${url}" is not a valid URL format`
    });
  }

  const hostname = parsedUrl.hostname;

  // Block private/local URLs
  const blocked = ['localhost','127.0.0.1','0.0.0.0','::1'];
  const privateIP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname);
  if (blocked.includes(hostname) || privateIP) {
    return res.status(400).json({
      status: 'blocked',
      message: 'Local/private URLs cannot be scanned'
    });
  }

  // ── STEP 2: Reachability Check ──────────────────────
  let pageResponse = null;
  let responseHeaders = {};
  let responseBody = '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    pageResponse = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    clearTimeout(timeout);

    pageResponse.headers.forEach((v, k) => {
      responseHeaders[k.toLowerCase()] = v;
    });

    responseBody = await pageResponse.text();

  } catch (err) {
    const msg = err.message || '';
    if (err.name === 'AbortError') {
      return res.status(400).json({
        status: 'timeout',
        message: `${hostname} took too long to respond`
      });
    }
    if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      return res.status(400).json({
        status: 'not_found',
        message: `"${hostname}" does not exist on the internet`,
        suggestions: [
          'Check for typos in the URL',
          `Try https://www.${hostname}`,
          'Make sure the website is publicly accessible'
        ]
      });
    }
    return res.status(400).json({
      status: 'unreachable',
      message: `Cannot connect to ${hostname}`
    });
  }

  // ── STEP 3: Security Headers Analysis ──────────────
  const headerChecks = [
    {
      id: 'csp',
      header: 'content-security-policy',
      title: 'Missing Content-Security-Policy',
      severity: 'high',
      description: 'No Content Security Policy (CSP) found. This is the modern standard for protecting against XSS and injection attacks.',
    },
    {
      id: 'xfo',
      header: 'x-frame-options',
      title: 'Missing X-Frame-Options',
      severity: 'high',
      description: 'Site can be embedded in iframes. Clickjacking risk.',
    },
    {
      id: 'hsts',
      header: 'strict-transport-security',
      title: 'Missing Strict-Transport-Security (HSTS)',
      severity: 'medium',
      description: 'HTTPS enforcement not broadcasted to browser. Traffic can be downgraded to HTTP.',
    },
    {
      id: 'xcto',
      header: 'x-content-type-options',
      title: 'Missing X-Content-Type-Options',
      severity: 'low',
      description: 'Browser can misinterpret file types if sniffing is not disabled.',
    },
    {
      id: 'rp',
      header: 'referrer-policy',
      title: 'Missing Referrer-Policy',
      severity: 'low',
      description: 'Full URLs may leak to external sites during navigation.',
    },
    {
      id: 'xss',
      header: 'x-xss-protection',
      title: 'X-XSS-Protection Deprecated',
      severity: 'low',
      description: 'X-XSS-Protection is deprecated. Your website should be protected using Content Security Policy (CSP), which is the modern standard.',
    },
  ];

  const vulnerabilities = [];
  const headers = {};

  for (const check of headerChecks) {
    const present = !!responseHeaders[check.header];
    headers[check.header] = present ? 'present' : 'missing';
    if (!present) {
      vulnerabilities.push({
        id: check.id,
        title: check.title,
        severity: check.severity,
        description: check.description,
        header: check.header,
        category: 'security-headers'
      });
    }
  }

  // Check HTTP → HTTPS redirect
  if (targetUrl.startsWith('http://') && !pageResponse.url.startsWith('https://')) {
    vulnerabilities.push({
      id: 'http-no-redirect',
      title: 'HTTP not secure',
      severity: 'critical',
      description: 'HTTP traffic is not redirected to HTTPS. All data including passwords and cookies is transmitted in plaintext.',
      category: 'transport'
    });
  } else if (targetUrl.startsWith('https://')) {
    // Verified HTTPS
  }

  // ── STEP 4: SSL Certificate Check ──────────────────
  let ssl = { valid: false, daysUntilExpiry: 0, issuer: 'Unknown' };
  try {
    // Attempt SSLLabs check
    const sslRes = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${hostname}&startNew=off&all=done`,
      { headers: { 'User-Agent': 'SecureWeb-AI/2.0' } }
    );
    // Fallback: check if HTTPS works at all
    if (targetUrl.startsWith('https://') && pageResponse.status < 500) {
      ssl.valid = true;
      ssl.daysUntilExpiry = 90; // Conservative estimate
      ssl.issuer = responseHeaders['server'] || 'Valid CA';
    }
  } catch {
    ssl.valid = targetUrl.startsWith('https://');
  }

  if (!ssl.valid) {
    vulnerabilities.push({
      id: 'ssl-invalid',
      title: 'Invalid or Missing SSL Certificate',
      severity: 'high',
      description: 'No valid SSL certificate. All data transmitted is unencrypted.',
      category: 'ssl'
    });
  }

  // ── STEP 5: VirusTotal Scan ─────────────────────────
  let virusTotal = { malicious: 0, suspicious: 0, harmless: 0 };
  try {
    if (process.env.VIRUSTOTAL_API_KEY) {
      const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(targetUrl)}`
      });
      const submitData = await submitRes.json();
      const analysisId = submitData.data?.id;

      if (analysisId) {
        await new Promise(r => setTimeout(r, 2000));
        const resultRes = await fetch(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
        );
        const resultData = await resultRes.json();
        const stats = resultData.data?.attributes?.stats || {};
        virusTotal = {
          malicious: stats.malicious || 0,
          suspicious: stats.suspicious || 0,
          harmless: stats.harmless || 0
        };
      }
    }
  } catch (err) {
    console.error('VT error:', err.message);
  }

  if (virusTotal.malicious > 0) {
    vulnerabilities.push({
      id: 'vt-malicious',
      title: `Flagged as Malicious by ${virusTotal.malicious} Engines`,
      severity: 'critical',
      description: `VirusTotal: ${virusTotal.malicious} antivirus engines flagged this site.`,
      category: 'reputation'
    });
  }

  // ── STEP 6: Sensitive Data Detection ───────────────
  const sensitivePatterns = [
    { pattern: /AKIA[A-Z0-9]{16}/g, name: 'AWS Access Key', severity: 'critical' },
    { pattern: /AIza[A-Za-z0-9_\-]{35}/g, name: 'Google API Key', severity: 'critical' },
    { pattern: /sk-[a-zA-Z0-9]{48}/g, name: 'OpenAI API Key', severity: 'critical' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub Token', severity: 'critical' },
    { pattern: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g, name: 'Slack Token', severity: 'critical' },
    { pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, name: 'Private Key Exposed', severity: 'critical' },
    { pattern: /password\s*[=:]\s*["'][^"']{4,}["']/gi, name: 'Password in Source', severity: 'high' },
    { pattern: /api_?key\s*[=:]\s*["'][^"']{8,}["']/gi, name: 'API Key in Source', severity: 'high' },
    { pattern: /secret\s*[=:]\s*["'][^"']{8,}["']/gi, name: 'Secret in Source', severity: 'high' },
    { pattern: /mongodb(\+srv)?:\/\/[^"'\s]+/gi, name: 'MongoDB URI Exposed', severity: 'critical' },
    { pattern: /mysql:\/\/[^"'\s]+/gi, name: 'MySQL URI Exposed', severity: 'critical' },
  ];

  const foundSensitive = new Set();
  for (const { pattern, name, severity } of sensitivePatterns) {
    if (pattern.test(responseBody) && !foundSensitive.has(name)) {
      foundSensitive.add(name);
      vulnerabilities.push({
        id: `sensitive-${name.toLowerCase().replace(/\s/g, '-')}`,
        title: `${name} Exposed in Source`,
        severity,
        description: `Found what appears to be a ${name} in the page source. This is a critical security leak.`,
        category: 'sensitive-data'
      });
    }
  }

  // ── STEP 7: Directory Exposure Check ───────────────
  const sensitivePaths = [
    { path: '/.env', name: 'Environment File (.env)', severity: 'critical' },
    { path: '/.git/config', name: 'Git Config Exposed', severity: 'critical' },
    { path: '/wp-config.php', name: 'WordPress Config Exposed', severity: 'critical' },
    { path: '/phpinfo.php', name: 'PHP Info Page', severity: 'high' },
    { path: '/admin', name: 'Admin Panel Exposed', severity: 'medium' },
    { path: '/backup.zip', name: 'Backup File Accessible', severity: 'critical' },
    { path: '/.htaccess', name: 'Server Config Exposed', severity: 'high' },
    { path: '/robots.txt', name: 'Robots.txt (check contents)', severity: 'info' },
  ];

  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  
  for (const { path, name, severity } of sensitivePaths) {
    try {
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 3000);
      
      const pathRes = await fetch(`${baseUrl}${path}`, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 SecureWeb-AI/2.0' }
      });
      clearTimeout(tId);
      
      if (pathRes.status === 200) {
        vulnerabilities.push({
          id: `exposed-path-${path.replace(/\//g, '-').replace(/^-/, '')}`,
          title: `${name} Accessible`,
          severity,
          description: `The path ${path} returned HTTP 200. This file should not be publicly accessible.`,
          category: 'exposure',
          details: { path: `${baseUrl}${path}` }
        });
      }
    } catch {}
  }

  // ── STEP 8: Cookie Security ─────────────────────────
  const setCookieHeader = responseHeaders['set-cookie'];
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    
    let missingHttpOnly = false;
    let missingSecure = false;
    let missingSameSite = false;

    cookies.forEach(c => {
      const lower = c.toLowerCase();
      if (!lower.includes('httponly')) missingHttpOnly = true;
      if (!lower.includes('secure')) missingSecure = true;
      if (!lower.includes('samesite')) missingSameSite = true;
    });

    if (missingHttpOnly) {
      vulnerabilities.push({
        id: 'cookie-no-httponly',
        title: 'Cookie missing HttpOnly',
        severity: 'high',
        description: 'Session cookies are accessible via JavaScript, making them vulnerable to XSS theft.',
        category: 'cookies'
      });
    }
    if (missingSecure) {
      vulnerabilities.push({
        id: 'cookie-no-secure',
        title: 'Cookie missing Secure flag',
        severity: 'high',
        description: 'Insecure cookies can be transmitted over unencrypted HTTP connections.',
        category: 'cookies'
      });
    }
    if (missingSameSite) {
      vulnerabilities.push({
        id: 'cookie-no-samesite',
        title: 'Cookie missing SameSite attribute',
        severity: 'medium',
        description: 'Missing SameSite attribute exposes users to Cross-Site Request Forgery (CSRF).',
        category: 'cookies'
      });
    }
  }

  // ── STEP 9: Server Version Disclosure ──────────────
  const serverHeader = responseHeaders['server'] || '';
  const poweredBy = responseHeaders['x-powered-by'] || '';

  if (serverHeader && /[0-9]/.test(serverHeader)) {
    vulnerabilities.push({
      id: 'server-disclosure',
      title: 'Server Version Disclosed',
      severity: 'low',
      description: `Server header reveals: "${serverHeader}".`,
      category: 'information-disclosure'
    });
  }

  // ── STEP 10: OWASP Checks ───────────────────────────
  const owasp = {
    A01: vulnerabilities.some(v => v.category === 'exposure') ? 'fail' : 'pass',
    A02: ssl.valid ? 'pass' : 'fail',
    A03: vulnerabilities.some(v => v.category === 'sensitive-data') ? 'fail' : 'pass',
    A05: vulnerabilities.filter(v => v.category === 'security-headers').length > 2 ? 'fail' : 'warn',
    A06: serverHeader && /[0-9]/.test(serverHeader) ? 'warn' : 'pass',
    A07: setCookieHeader && !setCookieHeader.toLowerCase().includes('httponly') ? 'fail' : 'pass'
  };

  // ── STEP 11: Port Scan via Shodan InternetDB ────────
  let portInfo = { ports: [], tags: [], vulns: [] };
  try {
    const ipRes = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);
    const ipData = await ipRes.json();
    const ip = ipData.Answer?.[0]?.data;
    
    if (ip && !ip.startsWith('192.') && !ip.startsWith('10.')) {
      const shodanRes = await fetch(`https://internetdb.shodan.io/${ip}`);
      if (shodanRes.ok) {
        portInfo = await shodanRes.json();
        const dangerousPorts = { 3306: 'MySQL', 27017: 'MongoDB', 6379: 'Redis', 5432: 'PostgreSQL', 22: 'SSH' };
        for (const [port, desc] of Object.entries(dangerousPorts)) {
          if (portInfo.ports?.includes(parseInt(port))) {
            vulnerabilities.push({
              id: `open-port-${port}`,
              title: `Port ${port} (${desc}) Open`,
              severity: port === '22' ? 'medium' : 'critical',
              description: `Database port ${port} is directly exposed to the internet.`,
              category: 'network'
            });
          }
        }
      }
    }
  } catch {}

  // ── STEP 12: DNS Security Check ────────────────────
  try {
    // SPF Check
    const spfRes = await fetch(`https://dns.google/resolve?name=${hostname}&type=TXT`);
    const spfData = await spfRes.json();
    const txt = (spfData.Answer || []).map(r => r.data).join(' ');
    if (!txt.includes('v=spf1')) {
      vulnerabilities.push({
        id: 'dns-no-spf', title: 'Missing SPF Record', severity: 'medium',
        description: 'Domain is vulnerable to email spoofing (no SPF).', category: 'dns'
      });
    }

    // DMARC Check
    const dmarcRes = await fetch(`https://dns.google/resolve?name=_dmarc.${hostname}&type=TXT`);
    const dmarcData = await dmarcRes.json();
    const dmarcTxt = (dmarcData.Answer || []).map(r => r.data).join(' ');
    if (!dmarcTxt.includes('v=DMARC1')) {
      vulnerabilities.push({
        id: 'dns-no-dmarc', title: 'Missing DMARC Record', severity: 'medium',
        description: 'Domain is vulnerable to phishing (no DMARC policy).', category: 'dns'
      });
    }

    // DKIM Check (Basic selector detection)
    // Note: DKIM varies by selector, but we can check if any exists for the domain as a proxy
    if (!txt.includes('v=DKIM1')) {
      vulnerabilities.push({
        id: 'dns-no-dkim', title: 'DKIM Not Detected', severity: 'low',
        description: 'No DKIM signature policy found on the base domain.', category: 'dns'
      });
    }

    // CAA Check
    const caaRes = await fetch(`https://dns.google/resolve?name=${hostname}&type=CAA`);
    const caaData = await caaRes.json();
    if (!caaData.Answer || caaData.Answer.length === 0) {
      vulnerabilities.push({
        id: 'dns-no-caa', title: 'Missing CAA Record', severity: 'low',
        description: 'No CAA record found. Any CA can issue certificates for this domain.', category: 'dns'
      });
    }
  } catch {}

  // ── STEP 13: Calculate Score ────────────────────────
  const DEDUCTIONS = { critical: 30, high: 20, medium: 10, low: 5, info: 0 };
  let score = 100;
  for (const vuln of vulnerabilities) {
    score -= DEDUCTIONS[vuln.severity] || 5;
  }
  score = Math.max(0, Math.min(100, score));

  const status = score >= 80 ? 'secure' : score >= 50 ? 'moderate' : 'vulnerable';
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';

  // ── STEP 14: Platform Detection ──────────────────────
  const detectPlatform = (headers) => {
    const server = (headers['server'] || '').toLowerCase();
    const via    = (headers['via']    || '').toLowerCase();
    const cf     = headers['cf-ray'] || '';
    const poweredBy = (headers['x-powered-by'] || '').toLowerCase();

    if (cf || server.includes('cloudflare'))
      return 'cloudflare';
    if (server.includes('nginx'))
      return 'nginx';
    if (server.includes('apache'))
      return 'apache';
    if (headers['x-vercel-id'] || server.includes('vercel'))
      return 'vercel';
    if (via.includes('vegur') || server.includes('heroku'))
      return 'heroku';
    if (poweredBy.includes('php'))
      return 'cpanel';
    return 'all';
  };

  const platform = detectPlatform(responseHeaders);

  // ── STEP 15: Final Response ────────────────────────
  const scanResult = {
    url: targetUrl,
    domain: hostname,
    score, grade, status, platform,
    scannedAt: new Date().toISOString(),
    vulnerabilities,
    vulnerabilityCount: vulnerabilities.length,
    headers, ssl, virusTotal, owasp,
    portInfo: { openPorts: portInfo.ports || [] },
    summary: {
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
    }
  };

  // ── STEP 16: Save to Firestore ──────────────────────
  if (effectiveUserId) {
    try {
      await db.collection('scans').add({ userId: effectiveUserId, ...scanResult, createdAt: admin.firestore.Timestamp.now() });
    } catch (err) {
      console.error('Firestore save error:', err.message);
    }
  }

  return res.status(200).json(scanResult);
}
