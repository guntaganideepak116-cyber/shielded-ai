import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { email, alertType, scanResult, 
          previousScore } = req.body;

  if (!email || !alertType || !scanResult) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
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
    const url = scanResult.url || 'Unknown';
    const scoreDiff = previousScore 
      ? score - previousScore 
      : 0;

    const isImproved = scoreDiff > 0;
    const isCritical = score < 50;

    const alertColor = isCritical 
      ? '#ff3366' 
      : isImproved 
      ? '#00ff88' 
      : '#ffaa00';

    const alertTitle = isCritical
      ? '🚨 CRITICAL: Security Score Below 50!'
      : isImproved
      ? '✅ Security Score Improved!'
      : '⚠️ Security Score Alert';

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;
             background:#020409;
             font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">

    <!-- Alert Header -->
    <div style="
      background:${alertColor};
      padding:24px 32px;
      text-align:center;">
      <div style="
        color:#020409;
        font-size:20px;
        font-weight:bold;">
        ${alertTitle}
      </div>
    </div>

    <!-- Content -->
    <div style="
      padding:32px;
      background:#0d1424;">

      <div style="
        background:#0a0f1e;
        border:1px solid #1a2234;
        border-radius:12px;
        padding:24px;
        text-align:center;
        margin-bottom:24px;">

        <div style="color:#8892a4;font-size:13px;
                    margin-bottom:8px;">
          CURRENT SECURITY SCORE
        </div>
        <div style="
          font-size:56px;
          font-weight:bold;
          color:${alertColor};">
          ${score}
        </div>
        <div style="color:#8892a4;font-size:13px;">
          out of 100
        </div>

        ${previousScore ? `
          <div style="
            margin-top:16px;
            padding:12px;
            background:#1a2234;
            border-radius:8px;
            color:#f0f4ff;
            font-size:14px;">
            Previous: ${previousScore}/100 
            ${isImproved 
              ? `<span style="color:#00ff88;">
                   ↑ +${scoreDiff} improved
                 </span>` 
              : `<span style="color:#ff3366;">
                   ↓ ${scoreDiff} dropped
                 </span>`}
          </div>
        ` : ''}
      </div>

      <div style="
        color:#8892a4;
        font-size:13px;
        margin-bottom:8px;">
        MONITORED WEBSITE
      </div>
      <div style="
        color:#00d4ff;
        font-size:15px;
        margin-bottom:24px;
        word-break:break-all;">
        ${url}
      </div>

      <div style="
        color:#8892a4;
        font-size:13px;
        margin-bottom:24px;">
        Alert generated: ${new Date().toLocaleString()}
      </div>

      <a href="https://secureweb-ai.vercel.app/scan"
         style="
           display:block;
           background:linear-gradient(
             135deg,#00d4ff,#7c3aed);
           color:#ffffff;
           padding:14px;
           border-radius:8px;
           text-decoration:none;
           font-weight:bold;
           font-size:15px;
           text-align:center;">
        View & Fix Issues →
      </a>
    </div>

    <!-- Footer -->
    <div style="
      padding:16px 32px;
      background:#020409;
      text-align:center;
      border-top:1px solid #1a2234;">
      <div style="
        color:#00d4ff;
        font-size:13px;
        font-weight:bold;">
        🛡️ SecureWeb AI Monitoring
      </div>
      <div style="color:#8892a4;font-size:11px;
                  margin-top:4px;">
        secureweb-ai.vercel.app
      </div>
    </div>

  </div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'SecureWeb AI <onboarding@resend.dev>',
      to: [email],
      subject: `${alertTitle} — ${url}`,
      html: htmlContent
    });

    if (error) {
      console.error('Resend alert error:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Alert sent to ${email}`,
      emailId: data?.id
    });

  } catch (err) {
    console.error('Alert email error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
