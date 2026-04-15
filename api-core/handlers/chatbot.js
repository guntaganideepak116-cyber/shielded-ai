import Anthropic from '@anthropic-ai/sdk';

let client;

export default async function handler(req, res) {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  if (!client) {
    return res.status(500).json({ error: 'Chat service not configured (API key missing)' });
  }
  // CORS
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, scanContext } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      system: `You are SecureWeb AI assistant.
      
Rules — follow STRICTLY:
- English only, always
- No markdown headers (no ###, ####)
- No asterisk bullets (no *, **)
- No bold formatting
- Max 3-4 sentences per response
- Answer directly — no "I need more info" stalling
- Sound like a helpful security expert friend
- If you give code, keep it to 1-2 lines max

Context about this user's last scan:
${scanContext ? JSON.stringify(scanContext) : 'No scan done yet'}`,
      messages: [
        { role: 'user', content: message }
      ]
    });

    const text = response.content[0]?.text || '';

    // Strip any markdown that slipped through
    const cleaned = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[-*•]\s/gm, '')
      .trim();

    return res.status(200).json({
      success: true,
      message: cleaned
    });

  } catch (err) {
    console.error('Anthropic Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Could not get response'
    });
  }
}
