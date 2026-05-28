export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://seller-tools-zeta.vercel.app',
        'X-Title': 'SellerTools AI'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data));

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
