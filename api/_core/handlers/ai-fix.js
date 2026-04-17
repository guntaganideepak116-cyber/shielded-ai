import axios from 'axios';

export default async function handler(req, res) {
  // CORS for Vercel
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

  const { url, vulnerabilities, ssl, virusTotal } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key missing' });
  }

  const vulnerabilitiesString = (vulnerabilities || []).map(v => `${v.title} (${v.severity})`).join(', ');
  const sslInfo = `Valid: ${ssl?.valid}, Days Until Expiry: ${ssl?.daysUntilExpiry}, Issuer: ${ssl?.issuer}`;
  const vtSummary = `Malicious: ${virusTotal?.malicious}, Suspicious: ${virusTotal?.suspicious}, Harmless: ${virusTotal?.harmless}`;

  const systemPrompt = `You are a cybersecurity expert specializing in web security. You provide high-fidelity, production-ready fix code for website vulnerabilities. 

STRICT RULES FOR SPECIFIC VULNERABILITIES:

1. 🔴 HTTP → HTTPS REDIRECT:
   - If ID is 'http-no-redirect', you MUST provide code for ALL these platforms: Vercel (vercel.json), Netlify (_redirects), GitHub Pages (JS snippet), Apache (.htaccess), NGINX (config snippet), and Cloudflare (instructions).
   - Follow the exact JSON/snippet formats provided in the system documentation.

2. 🍪 COOKIE SECURITY:
   - If cookie issues (HttpOnly, Secure, SameSite) are detected, provide Express.js/Node.js fixes: res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "Strict" });
   - IF the platform is static (Vercel/Netlify/GitHub Pages), explicitly warn: "Cookie security cannot be configured on static hosting. Use a backend to set secure cookies."

3. 🛡️ XSS PROTECTION:
   - For XSS risk, prioritize Content Security Policy (CSP). State: "X-XSS-Protection is deprecated. Your website is protected using Content Security Policy (CSP), which is the modern standard."

4. FORMAT: Always return a valid JSON object.`;

  const userPrompt = `The website ${url} was scanned and these vulnerabilities were found: ${vulnerabilitiesString}. SSL status: ${sslInfo}. VirusTotal result: ${vtSummary}.
  
For each vulnerability, provide:
1. A plain English explanation of the risk.
2. The specific fix code or instructions.
3. Priority level (1-10).

Format your response as a JSON object with this exact structure:
{
  "fixes": [
    {
      "vulnerabilityId": "...",
      "vulnerability": "...",
      "riskExplanation": "...",
      "priority": 1,
      "platformFixes": {
        "nodejs": { "code": "...", "instructions": "..." },
        "vercel": { "code": "...", "instructions": "..." },
        "netlify": { "code": "...", "instructions": "..." },
        "github": { "code": "...", "instructions": "..." },
        "apache": { "code": "...", "instructions": "..." },
        "nginx": { "code": "...", "instructions": "..." },
        "cloudflare": { "code": "...", "instructions": "..." }
      }
    }
  ],
  "overallAdvice": "...",
  "estimatedFixTime": "..."
}

CRITICAL: For 'http-no-redirect', populate ALL platforms. For cookie issues, populate 'nodejs' and add static warnings to others. For XSS, explain the CSP priority in 'instructions'.`;

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-5-haiku-20241022",
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 1500,
        temperature: 0.1
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 25000
      }
    );

    const content = response.data?.content?.[0]?.text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse AI response' };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Anthropic API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: 'AI recommendation service failed' });
  }
}
