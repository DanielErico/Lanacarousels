import type { VercelRequest, VercelResponse } from '@vercel/node';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model = 'meta/llama-3.3-70b-instruct', apiKey, temperature = 0.7, max_tokens = 2048 } = req.body || {};

  // Use provided key or default environment key
  const activeKey = apiKey || process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || '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';

  if (!activeKey) {
    return res.status(400).json({ error: 'No NVIDIA API Key available.' });
  }

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.detail || err?.message || err?.error?.message || `NVIDIA API Error ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: unknown) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error while communicating with NVIDIA API.',
    });
  }
}
