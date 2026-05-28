export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const messages = req.body.messages;
    const prompt = messages[messages.length - 1].content;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HF_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          stream: false
        })
      }
    );

    const data = await response.json();
    console.log('HF response:', JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({ error: data.error || 'API failed' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
