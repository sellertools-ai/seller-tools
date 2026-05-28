export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing' });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://seller-tools-zeta.vercel.app',
        'X-Title': 'SellerTools AI'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    const text = await response.text();
    console.log('Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return res.status(500).json({ error: 'OpenRouter error: ' + text.slice(0, 200) });
    }

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const result = data.choices[0].message.content;
    res.status(200).json({ result });

  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
