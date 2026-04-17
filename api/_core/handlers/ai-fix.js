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

  const systemPrompt = `You are a cybersecurity expert specializing in web security. You provide clear, actionable fix recommendations for website vulnerabilities. Always provide specific code examples for Node.js/Express, Apache, Nginx, and Vercel/Netlify platforms. Be concise and beginner-friendly.`;
  const userPrompt = `The website ${url} was scanned and these vulnerabilities were found: ${vulnerabilitiesString}. SSL status: ${sslInfo}. VirusTotal result: ${vtSummary}.

For each vulnerability, provide:
1. A plain English explanation of the risk
2. Ready-to-copy fix code for: Node.js/Express, Apache, Nginx, and Vercel (vercel.json)
3. Priority order to fix them

Format your response as JSON with this structure:
{
  "fixes": [
    {
      "vulnerabilityId": "...",
      "riskExplanation": "...",
      "priority": 1,
      "fixCode": {
        "nodejs": "...",
        "apache": "...",
        "nginx": "...",
        "vercel": "..."
      }
    }
  ],
  "overallAdvice": "...",
  "estimatedFixTime": "30 minutes"
}`;

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
