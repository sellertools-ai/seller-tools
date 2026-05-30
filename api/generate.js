export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
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
        model: 'google/gemma-3n-e4b-it:free',
        max_tokens: 1000,
        messages: [
          {role: 'system', content: 'You are a professional Amazon SEO copywriter.'},
          {role: 'user', content: prompt}
        ]
      })
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
    const text = data?.choices?.[0]?.message?.content || '';
    if(!text) throw new Error(data?.error?.message || 'Empty response');
    res.status(200).json({ text });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
