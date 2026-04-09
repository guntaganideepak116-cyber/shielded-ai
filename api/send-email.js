import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { email, scanResult } = req.body;

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
      error: 'Invalid email address format'
    });
  }

  // Check API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({
      success: false,
      error: 'Email service not configured'
    });
  }

  try {
    const score = scanResult.score || 0;
    const status = scanResult.status || 'unknown';
    const url = scanResult.url || 'Unknown URL';
    const vulns = scanResult.vulnerabilities || [];
    const highCount = vulns.filter(
      v => v.severity === 'high'
    ).length;
    const medCount = vulns.filter(
      v => v.severity === 'medium'
    ).length;
    const lowCount = vulns.filter(
      v => v.severity === 'low'
    ).length;

    const scoreColor = score >= 80 ? '#00ff88' 
                     : score >= 50 ? '#ffaa00' 
                     : '#ff3366';

    const statusText = status === 'secure' 
      ? 'SECURE' 
      : status === 'vulnerable' 
      ? 'VULNERABLE' 
      : 'MODERATE RISK';

    // Build vulnerabilities HTML list
    const vulnListHTML = vulns.length > 0
      ? vulns.map(v => `
          <tr>
            <td style="padding:10px 12px;
                       border-bottom:1px solid #1a2234;
                       color:#f0f4ff;
                       font-family:Arial,sans-serif;
                       font-size:13px;">
              ${v.title || 'Unknown Issue'}
            </td>
            <td style="padding:10px 12px;
                       border-bottom:1px solid #1a2234;
                       text-align:center;">
              <span style="
                background:${v.severity==='high'
                  ? '#ff3366'
                  : v.severity==='medium'
                  ? '#ffaa00'
                  : '#8892a4'};
                color:#020409;
                padding:2px 8px;
                border-radius:4px;
                font-size:11px;
                font-weight:bold;
                font-family:Arial,sans-serif;">
                ${(v.severity||'low').toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="2" style="
            padding:16px;
            text-align:center;
            color:#00ff88;
            font-family:Arial,sans-serif;">
            ✅ No vulnerabilities found!
          </td></tr>`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" 
        content="width=device-width,initial-scale=1">
  <title>SecureWeb AI Security Report</title>
</head>
<body style="
  margin:0;
  padding:0;
  background:#020409;
  font-family:Arial,sans-serif;">

  <!-- Wrapper -->
  <div style="
    max-width:600px;
    margin:0 auto;
    background:#020409;">

    <!-- Header -->
    <div style="
      background:linear-gradient(135deg,#0d1424,#1a2234);
      padding:32px 32px 24px;
      border-bottom:2px solid #00d4ff;">
      <div style="
        color:#00d4ff;
        font-size:22px;
        font-weight:bold;
        margin-bottom:4px;">
        🛡️ SecureWeb AI
      </div>
      <div style="color:#8892a4;font-size:13px;">
        Security Audit Report
      </div>
    </div>

    <!-- Score Section -->
    <div style="
      padding:32px;
      text-align:center;
      background:#0a0f1e;
      border-bottom:1px solid #1a2234;">
      <div style="
        color:#8892a4;
        font-size:13px;
        margin-bottom:8px;
        text-transform:uppercase;
        letter-spacing:1px;">
        Security Score
      </div>
      <div style="
        font-size:64px;
        font-weight:bold;
        color:${scoreColor};
        line-height:1;">
        ${score}
      </div>
      <div style="
        color:#8892a4;
        font-size:14px;
        margin-bottom:16px;">
        out of 100
      </div>
      <div style="
        display:inline-block;
        background:${scoreColor};
        color:#020409;
        padding:6px 20px;
        border-radius:20px;
        font-weight:bold;
        font-size:14px;">
        ${statusText}
      </div>
    </div>

    <!-- URL Info -->
    <div style="
      padding:20px 32px;
      background:#0d1424;
      border-bottom:1px solid #1a2234;">
      <div style="color:#8892a4;font-size:12px;
                  margin-bottom:4px;">
        SCANNED WEBSITE
      </div>
      <div style="color:#00d4ff;font-size:15px;
                  word-break:break-all;">
        ${url}
      </div>
      <div style="color:#8892a4;font-size:12px;
                  margin-top:8px;">
        Scanned on: ${new Date().toLocaleString()}
      </div>
    </div>

    <!-- Stats Row -->
    <div style="
      display:flex;
      border-bottom:1px solid #1a2234;">
      <div style="
        flex:1;
        padding:20px;
        text-align:center;
        background:#0d1424;
        border-right:1px solid #1a2234;">
        <div style="
          font-size:28px;
          font-weight:bold;
          color:#ff3366;">
          ${highCount}
        </div>
        <div style="color:#8892a4;font-size:11px;">
          HIGH
        </div>
      </div>
      <div style="
        flex:1;
        padding:20px;
        text-align:center;
        background:#0d1424;
        border-right:1px solid #1a2234;">
        <div style="
          font-size:28px;
          font-weight:bold;
          color:#ffaa00;">
          ${medCount}
        </div>
        <div style="color:#8892a4;font-size:11px;">
          MEDIUM
        </div>
      </div>
      <div style="
        flex:1;
        padding:20px;
        text-align:center;
        background:#0d1424;">
        <div style="
          font-size:28px;
          font-weight:bold;
          color:#8892a4;">
          ${lowCount}
        </div>
        <div style="color:#8892a4;font-size:11px;">
          LOW
        </div>
      </div>
    </div>

    <!-- SSL Status -->
    <div style="
      padding:16px 32px;
      background:#0a0f1e;
      border-bottom:1px solid #1a2234;
      display:flex;
      align-items:center;
      gap:12px;">
      <span style="font-size:18px;">
        ${scanResult.ssl?.valid ? '🔒' : '⚠️'}
      </span>
      <div>
        <div style="color:#f0f4ff;font-size:13px;
                    font-weight:bold;">
          SSL Certificate: 
          ${scanResult.ssl?.valid 
            ? 'Valid ✅' 
            : 'Invalid / Missing ❌'}
        </div>
        ${scanResult.ssl?.daysUntilExpiry 
          ? `<div style="color:#8892a4;font-size:12px;">
               Expires in ${scanResult.ssl.daysUntilExpiry} days
             </div>` 
          : ''}
      </div>
    </div>

    <!-- Vulnerabilities Table -->
    <div style="padding:24px 32px;background:#0d1424;">
      <div style="
        color:#f0f4ff;
        font-size:15px;
        font-weight:bold;
        margin-bottom:16px;">
        Vulnerabilities Found (${vulns.length})
      </div>
      <table style="
        width:100%;
        border-collapse:collapse;
        background:#0a0f1e;
        border-radius:8px;
        overflow:hidden;
        border:1px solid #1a2234;">
        <thead>
          <tr style="background:#1a2234;">
            <th style="
              padding:10px 12px;
              text-align:left;
              color:#8892a4;
              font-size:11px;
              font-weight:bold;
              letter-spacing:1px;">
              ISSUE
            </th>
            <th style="
              padding:10px 12px;
              text-align:center;
              color:#8892a4;
              font-size:11px;
              font-weight:bold;
              letter-spacing:1px;
              width:80px;">
              SEVERITY
            </th>
          </tr>
        </thead>
        <tbody>
          ${vulnListHTML}
        </tbody>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="
      padding:24px 32px;
      text-align:center;
      background:#0a0f1e;
      border-top:1px solid #1a2234;">
      <a href="https://secureweb-ai.vercel.app"
         style="
           display:inline-block;
           background:linear-gradient(
             135deg,#00d4ff,#7c3aed);
           color:#ffffff;
           padding:14px 32px;
           border-radius:8px;
           text-decoration:none;
           font-weight:bold;
           font-size:15px;">
        View Full Report →
      </a>
      <div style="
        margin-top:12px;
        color:#8892a4;
        font-size:12px;">
        Fix vulnerabilities and re-scan to improve 
        your security score
      </div>
    </div>

    <!-- Footer -->
    <div style="
      padding:20px 32px;
      background:#020409;
      border-top:1px solid #1a2234;
      text-align:center;">
      <div style="color:#00d4ff;font-size:13px;
                  font-weight:bold;margin-bottom:4px;">
        🛡️ SecureWeb AI
      </div>
      <div style="color:#8892a4;font-size:11px;">
        secureweb-ai.vercel.app
      </div>
      <div style="
        color:#8892a4;
        font-size:10px;
        margin-top:8px;">
        You received this because you requested 
        a security report. 
        This is an automated message.
      </div>
    </div>

  </div>
</body>
</html>`;

    // ACTUALLY SEND THE EMAIL via Resend
    const { data, error } = await resend.emails.send({
      from: 'SecureWeb AI <onboarding@resend.dev>',
      to: [email],
      subject: `🛡️ Security Report: ${url} — Score ${score}/100`,
      html: htmlContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to send email'
      });
    }

    // Only return success if Resend confirms
    return res.status(200).json({
      success: true,
      message: `Report sent to ${email}`,
      emailId: data?.id
    });

  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
