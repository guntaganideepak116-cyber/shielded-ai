import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const {
    email,
    userName,
    scanResult,
    autoSent
  } = req.body;

  // Validate inputs
  if (!email || !scanResult) {
    return res.status(400).json({
      success: false,
      error: 'Email and scan result are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Email service not configured'
    });
  }

  try {
    const score = scanResult.score || 0;
    const url = scanResult.url || 'Unknown URL';
    const status = scanResult.status || 'unknown';
    const vulns = scanResult.vulnerabilities || [];
    const name = userName || 'there';

    const domain = url
      .replace('https://', '')
      .replace('http://', '')
      .replace(/\/$/, '');

    const scoreColor =
      score >= 80 ? '#00ff88' :
      score >= 50 ? '#ffaa00' : '#ff3366';

    const statusText =
      status === 'secure' ? 'SECURE' :
      status === 'vulnerable' ? 'VULNERABLE' :
      'MODERATE RISK';

    const highCount = vulns.filter(
      v => v.severity === 'high'
    ).length;
    const medCount = vulns.filter(
      v => v.severity === 'medium'
    ).length;
    const lowCount = vulns.filter(
      v => v.severity === 'low'
    ).length;

    // Build vulnerabilities rows
    const vulnRows = vulns.length > 0
      ? vulns.map(v => `
          <tr>
            <td style="padding:10px 16px;
                       border-bottom:1px solid #1a2234;
                       color:#f0f4ff;
                       font-family:Arial,sans-serif;
                       font-size:13px;">
              ${v.title || 'Unknown Issue'}
            </td>
            <td style="padding:10px 16px;
                       border-bottom:1px solid #1a2234;
                       text-align:center;
                       width:90px;">
              <span style="
                background:${
                  v.severity === 'high' ? '#ff3366' :
                  v.severity === 'medium' ? '#ffaa00' :
                  '#8892a4'};
                color:#020409;
                padding:3px 10px;
                border-radius:4px;
                font-size:10px;
                font-weight:bold;
                font-family:Arial,sans-serif;
                letter-spacing:0.5px;">
                ${(v.severity||'low').toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="2" style="
            padding:20px;
            text-align:center;
            color:#00ff88;
            font-family:Arial,sans-serif;
            font-size:14px;">
            ✅ No vulnerabilities found!
          </td></tr>`;

    // Build headers table rows
    const headerKeys = [
      { key: 'content-security-policy',
        name: 'Content-Security-Policy' },
      { key: 'x-frame-options',
        name: 'X-Frame-Options' },
      { key: 'strict-transport-security',
        name: 'Strict-Transport-Security' },
      { key: 'x-content-type-options',
        name: 'X-Content-Type-Options' },
      { key: 'referrer-policy',
        name: 'Referrer-Policy' },
      { key: 'permissions-policy',
        name: 'Permissions-Policy' }
    ];

    const headerRows = headerKeys.map(h => {
      const present =
        scanResult.headers?.[h.key] === 'present';
      return `
        <tr>
          <td style="padding:8px 16px;
                     border-bottom:1px solid #1a2234;
                     color:#f0f4ff;
                     font-family:Courier New,monospace;
                     font-size:11px;">
            ${h.name}
          </td>
          <td style="padding:8px 16px;
                     border-bottom:1px solid #1a2234;
                     text-align:center;width:80px;">
            <span style="color:${
              present ? '#00ff88' : '#ff3366'};
              font-size:14px;">
              ${present ? '✅' : '❌'}
            </span>
          </td>
        </tr>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport"
        content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;
             background:#020409;
             font-family:Arial,sans-serif;">

  <div style="max-width:600px;
              margin:0 auto;
              background:#020409;">

    <!-- TOP ACCENT LINE -->
    <div style="height:3px;
                background:linear-gradient(
                  90deg,#00d4ff,#7c3aed);"></div>

    <!-- HEADER -->
    <div style="padding:28px 32px 20px;
                background:#0a0f1e;
                border-bottom:1px solid #1a2234;">
      <div style="display:flex;
                  align-items:center;
                  gap:12px;">
        <span style="font-size:26px;">🛡️</span>
        <div>
          <div style="color:#00d4ff;
                      font-size:20px;
                      font-weight:bold;
                      letter-spacing:1px;">
            SECUREWEB AI
          </div>
          <div style="color:#8892a4;font-size:12px;">
            Security Audit Report
          </div>
        </div>
      </div>
    </div>

    <!-- GREETING -->
    <div style="padding:20px 32px;
                background:#0d1424;
                border-bottom:1px solid #1a2234;">
      <p style="color:#f0f4ff;
                font-size:14px;
                margin:0;line-height:1.6;">
        Hi <strong style="color:#00d4ff;">${name}</strong>,
        <br><br>
        Your security scan for
        <strong style="color:#f0f4ff;">
          ${domain}
        </strong>
        is complete.
        ${autoSent
          ? 'We\'ve automatically sent you this report.'
          : 'Here are your results.'}
      </p>
    </div>

    <!-- SCORE SECTION -->
    <div style="padding:32px;
                background:#0a0f1e;
                text-align:center;
                border-bottom:1px solid #1a2234;">

      <div style="color:#8892a4;
                  font-size:11px;
                  letter-spacing:2px;
                  margin-bottom:12px;
                  text-transform:uppercase;">
        Security Score
      </div>

      <div style="display:inline-block;
                  background:#0d1424;
                  border:2px solid ${scoreColor};
                  border-radius:50%;
                  width:110px;height:110px;
                  line-height:110px;
                  text-align:center;
                  margin-bottom:16px;">
        <span style="font-size:42px;
                     font-weight:bold;
                     color:${scoreColor};
                     line-height:1;">
          ${score}
        </span>
      </div>

      <div style="color:#8892a4;
                  font-size:13px;
                  margin-bottom:16px;">
        out of 100
      </div>

      <div style="display:inline-block;
                  background:${scoreColor};
                  color:#020409;
                  padding:8px 24px;
                  border-radius:20px;
                  font-weight:bold;
                  font-size:14px;
                  letter-spacing:1px;">
        ${statusText}
      </div>
    </div>

    <!-- URL + SCAN TIME -->
    <div style="padding:16px 32px;
                background:#0d1424;
                border-bottom:1px solid #1a2234;">
      <div style="color:#8892a4;
                  font-size:11px;
                  letter-spacing:1px;
                  margin-bottom:6px;">
        SCANNED WEBSITE
      </div>
      <div style="color:#00d4ff;
                  font-size:15px;
                  font-family:Courier New,monospace;
                  word-break:break-all;">
        ${url}
      </div>
      <div style="color:#8892a4;
                  font-size:12px;
                  margin-top:6px;">
        Scanned: ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short'
        })} IST
      </div>
    </div>

    <!-- STATS ROW -->
    <div style="display:flex;
                border-bottom:1px solid #1a2234;">

      <div style="flex:1;padding:18px 12px;
                  text-align:center;
                  background:#0d1424;
                  border-right:1px solid #1a2234;">
        <div style="font-size:28px;
                    font-weight:bold;
                    color:#ff3366;">
          ${highCount}
        </div>
        <div style="color:#8892a4;
                    font-size:10px;
                    letter-spacing:1px;
                    margin-top:4px;">
          HIGH
        </div>
      </div>

      <div style="flex:1;padding:18px 12px;
                  text-align:center;
                  background:#0d1424;
                  border-right:1px solid #1a2234;">
        <div style="font-size:28px;
                    font-weight:bold;
                    color:#ffaa00;">
          ${medCount}
        </div>
        <div style="color:#8892a4;
                    font-size:10px;
                    letter-spacing:1px;
                    margin-top:4px;">
          MEDIUM
        </div>
      </div>

      <div style="flex:1;padding:18px 12px;
                  text-align:center;
                  background:#0d1424;
                  border-right:1px solid #1a2234;">
        <div style="font-size:28px;
                    font-weight:bold;
                    color:#8892a4;">
          ${lowCount}
        </div>
        <div style="color:#8892a4;
                    font-size:10px;
                    letter-spacing:1px;
                    margin-top:4px;">
          LOW
        </div>
      </div>

      <div style="flex:1;padding:18px 12px;
                  text-align:center;
                  background:#0d1424;">
        <div style="font-size:28px;
                    font-weight:bold;
                    color:${
                      scanResult.ssl?.valid
                        ? '#00ff88' : '#ff3366'};">
          ${scanResult.ssl?.valid ? '✅' : '❌'}
        </div>
        <div style="color:#8892a4;
                    font-size:10px;
                    letter-spacing:1px;
                    margin-top:4px;">
          SSL
        </div>
      </div>

    </div>

    <!-- VULNERABILITIES TABLE -->
    <div style="padding:24px 32px;
                background:#0d1424;
                border-bottom:1px solid #1a2234;">
      <div style="color:#f0f4ff;
                  font-size:14px;
                  font-weight:bold;
                  margin-bottom:14px;
                  letter-spacing:0.5px;">
        🔍 Vulnerabilities Found (${vulns.length})
      </div>
      <table style="width:100%;
                    border-collapse:collapse;
                    background:#0a0f1e;
                    border:1px solid #1a2234;
                    border-radius:8px;
                    overflow:hidden;">
        <thead>
          <tr style="background:#1a2234;">
            <th style="padding:10px 16px;
                       text-align:left;
                       color:#8892a4;
                       font-size:10px;
                       letter-spacing:1px;
                       font-weight:bold;">
              VULNERABILITY
            </th>
            <th style="padding:10px 16px;
                       text-align:center;
                       color:#8892a4;
                       font-size:10px;
                       letter-spacing:1px;
                       font-weight:bold;
                       width:90px;">
              SEVERITY
            </th>
          </tr>
        </thead>
        <tbody>
          ${vulnRows}
        </tbody>
      </table>
    </div>

    <!-- SECURITY HEADERS TABLE -->
    <div style="padding:24px 32px;
                background:#0a0f1e;
                border-bottom:1px solid #1a2234;">
      <div style="color:#f0f4ff;
                  font-size:14px;
                  font-weight:bold;
                  margin-bottom:14px;
                  letter-spacing:0.5px;">
        🔐 Security Headers
      </div>
      <table style="width:100%;
                    border-collapse:collapse;
                    background:#0d1424;
                    border:1px solid #1a2234;">
        <tbody>
          ${headerRows}
        </tbody>
      </table>
    </div>

    <!-- VIRUSTOTAL -->
    <div style="padding:16px 32px;
                background:#0d1424;
                border-bottom:1px solid #1a2234;
                display:flex;
                align-items:center;
                gap:12px;">
      <span style="font-size:20px;">🦠</span>
      <div>
        <div style="color:#f0f4ff;
                    font-size:13px;
                    font-weight:bold;">
          VirusTotal Reputation:
          <span style="color:${
            (scanResult.virusTotal?.malicious || 0) > 0
              ? '#ff3366' : '#00ff88'};">
            ${(scanResult.virusTotal?.malicious || 0) > 0
              ? `${scanResult.virusTotal.malicious} engines flagged as malicious ⚠️`
              : 'Clean — No threats detected ✅'}
          </span>
        </div>
        <div style="color:#8892a4;font-size:12px;
                    margin-top:3px;">
          Harmless: ${scanResult.virusTotal?.harmless || 0}
          &nbsp;•&nbsp;
          Suspicious: ${scanResult.virusTotal?.suspicious || 0}
          &nbsp;•&nbsp;
          Malicious: ${scanResult.virusTotal?.malicious || 0}
        </div>
      </div>
    </div>

    <!-- CTA BUTTON -->
    <div style="padding:28px 32px;
                text-align:center;
                background:#0a0f1e;
                border-bottom:1px solid #1a2234;">

      ${vulns.length > 0 ? `
      <p style="color:#8892a4;font-size:13px;
                margin:0 0 16px 0;">
        Fix these vulnerabilities to improve
        your security score
      </p>
      <a href="https://secureweb-ai.vercel.app/scan"
         style="display:inline-block;
                background:linear-gradient(
                  135deg,#00d4ff,#7c3aed);
                color:#ffffff;
                padding:14px 36px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                font-size:15px;
                letter-spacing:0.5px;">
        🔒 Fix Vulnerabilities Now →
      </a>
      ` : `
      <p style="color:#00ff88;font-size:14px;
                margin:0 0 16px 0;font-weight:bold;">
        ✅ Your website is secure!
        Keep monitoring to stay protected.
      </p>
      <a href="https://secureweb-ai.vercel.app/monitoring"
         style="display:inline-block;
                background:linear-gradient(
                  135deg,#00ff88,#00d4ff);
                color:#020409;
                padding:14px 36px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                font-size:15px;">
        📊 Set Up Monitoring →
      </a>
      `}
    </div>

    <!-- FOOTER -->
    <div style="padding:20px 32px;
                background:#020409;
                text-align:center;
                border-top:1px solid #1a2234;">
      <div style="color:#00d4ff;
                  font-size:14px;
                  font-weight:bold;
                  margin-bottom:4px;">
        🛡️ SecureWeb AI
      </div>
      <div style="color:#8892a4;font-size:11px;
                  margin-bottom:8px;">
        secureweb-ai.vercel.app
      </div>
      <div style="color:#555555;font-size:10px;
                  line-height:1.6;">
        You received this because you scanned a website
        on SecureWeb AI.
        <br>
        This is an automated security report.
      </div>
    </div>

    <!-- BOTTOM ACCENT LINE -->
    <div style="height:3px;
                background:linear-gradient(
                  90deg,#7c3aed,#00d4ff);"></div>

  </div>

</body>
</html>`;

    // SEND via Resend
    const { data, error } = await resend.emails.send({
      from: 'SecureWeb AI <onboarding@resend.dev>',
      to: [email],
      subject: `🛡️ Security Report: ${domain} — Score ${score}/100 ${statusText}`,
      html: htmlContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to send'
      });
    }

    // Return REAL success only after Resend confirms
    return res.status(200).json({
      success: true,
      message: `Report delivered to ${email}`,
      emailId: data?.id,
      autoSent: autoSent || false
    });

  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error'
    });
  }
}
