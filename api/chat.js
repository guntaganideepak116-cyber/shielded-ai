import axios from 'axios';

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

  try {
    const { messages, domain, score } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: { message: "Server configuration error: Groq API Key missing in Vercel." } });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are SECUREWEB AI Expert. Site: ${domain || 'Unknown'}, Score: ${score || '??'}/100. Provide direct, helpful security advice. Use markdown.`
          },
          ...(messages || []).map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      { 
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json' 
        },
        timeout: 10000
      }
    );

    const aiContent = response.data?.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No response from AI engine.");
    }

    // Matching exactly what your frontend expects
    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [{ text: aiContent }]
          }
        }
      ]
    });

  } catch (error) {
    console.error("GROQ_SERVER_ERROR:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: { message: "AI Tunnel failed" },
      details: error.message 
    });
  }
}
