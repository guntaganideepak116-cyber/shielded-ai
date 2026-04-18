import Groq from "groq-sdk";

let client;

export default async function handler(req, res) {
  if (!client && process.env.GROQ_API_KEY) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  if (!client) {
    console.error('GROQ_API_KEY is missing in environment variables');
    return res.status(500).json({ error: 'Assistant service misconfigured (API key missing)' });
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, scanContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Valid messages array required' });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the SecureWeb AI Security Assistant. 
          Context: ${scanContext ? JSON.stringify(scanContext) : 'Generic security inquiry'}.
          Guidelines:
          1. Be concise and professional.
          2. Help users fix web vulnerabilities.
          3. Mention specific tools and headers (CSP, HSTS, etc.) when relevant.
          4. Keep it conversational - respond directly to the latest user message while keeping previous context in mind.`
        },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 512,
      top_p: 1,
      stream: false,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    return res.status(200).json({
      success: true,
      message: responseText
    });

  } catch (err) {
    console.error('Groq API Error:', err);
    return res.status(500).json({
      success: false,
      error: 'The AI brain is currently recalibrating. Please try again soon.'
    });
  }
}
