import { Client } from '@upstash/qstash';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { carouselId, scheduledAt, brandId, userId } = await req.json();

    if (!carouselId || !scheduledAt) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: carouselId and scheduledAt' }), { status: 400 });
    }

    const qstashToken = process.env.QSTASH_TOKEN || (import.meta.env?.VITE_QSTASH_TOKEN as string);
    const hostUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://lana-five.vercel.app';

    if (!qstashToken) {
      console.warn('[Lana QStash] QSTASH_TOKEN not set. Saved to Supabase DB for client/polling fallback.');
      return new Response(JSON.stringify({ 
        success: true, 
        scheduled: false, 
        message: 'Saved to Supabase. Add QSTASH_TOKEN to Vercel for 100% background auto-publishing.' 
      }), { status: 200 });
    }

    const qstash = new Client({ token: qstashToken });

    // Calculate delay or target timestamp for QStash (notBefore in seconds)
    const targetDate = new Date(scheduledAt);
    const targetEpochSeconds = Math.floor(targetDate.getTime() / 1000);

    const publishRes = await qstash.publishJSON({
      url: `${hostUrl}/api/publish-carousel`,
      body: { carouselId, brandId, userId },
      notBefore: targetEpochSeconds,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      scheduled: true,
      messageId: publishRes.messageId,
      targetTime: targetDate.toISOString(),
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: unknown) {
    console.error('[Lana QStash Schedule Error]:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Failed to enqueue post with QStash' 
    }), { status: 500 });
  }
}
