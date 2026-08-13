import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { carouselId, brandId, userId } = await req.json();

    if (!carouselId) {
      return new Response(JSON.stringify({ error: 'Missing carouselId parameter' }), { status: 400 });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uhdrzxjgzzbhuybhvnun.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHJ6eGpnenpiaHV5Ymh2bnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzQwNDYsImV4cCI6MjEwMTQxMDA0Nn0.JcuGIivSJ2KIyORJuslBnej5O5q8I0YET3jbvZUiLB4';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Fetch Carousel from Supabase ──────────────────────────────────────
    const { data: carousel, error: carError } = await supabase
      .from('carousels')
      .select('*, slides(*)')
      .eq('id', carouselId)
      .single();

    if (carError || !carousel) {
      return new Response(JSON.stringify({ error: carError?.message || 'Carousel not found' }), { status: 404 });
    }

    // ── 2. Fetch Brand credentials (IG token + account ID) ───────────────────
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', carousel.brand_id || brandId)
      .single();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ error: 'Brand credentials not found for this carousel' }), { status: 404 });
    }

    const accessToken = process.env.VITE_INSTAGRAM_ACCESS_TOKEN || brand.ig_token;
    const accountId = process.env.VITE_INSTAGRAM_ACCOUNT_ID || brand.ig_account_id;

    if (!accessToken || !accountId) {
      return new Response(JSON.stringify({
        error: 'Instagram Access Token or Account ID not found. Please reconnect your Instagram account in Settings.',
      }), { status: 400 });
    }

    // ── 3. Collect published slide image URLs ────────────────────────────────
    const slides = (carousel.slides || []).sort((a: any, b: any) => a.order_index - b.order_index);
    const imageUrls: string[] = slides.map((s: any) => s.image_url).filter(Boolean);

    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({
        error: 'No publicly accessible slide image URLs found. Please publish directly from the Carousel Studio instead.',
      }), { status: 400 });
    }

    const caption = carousel.caption_text || carousel.title || 'Created with Lana IG Carousels';

    // ── 4. Meta Graph API: Step 1 — Create individual media item containers ──
    const itemContainerIds: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const itemBody = new URLSearchParams({
        image_url: imageUrls[i],
        is_carousel_item: 'true',
        access_token: accessToken,
      });

      const itemRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: itemBody,
      });
      const itemData = await itemRes.json();
      if (!itemRes.ok || itemData.error) {
        return new Response(JSON.stringify({
          error: `Slide ${i + 1} container failed: ${itemData.error?.message || `HTTP ${itemRes.status}`}`,
        }), { status: 502 });
      }
      itemContainerIds.push(itemData.id);
    }

    // ── 5. Meta Graph API: Step 2 — Create parent CAROUSEL container ─────────
    const carouselBody = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: JSON.stringify(itemContainerIds),
      caption,
      access_token: accessToken,
    });

    const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: carouselBody,
    });
    const carouselData = await carouselRes.json();
    if (!carouselRes.ok || carouselData.error) {
      return new Response(JSON.stringify({
        error: `Carousel container failed: ${carouselData.error?.message || `HTTP ${carouselRes.status}`}`,
      }), { status: 502 });
    }
    const creationId = carouselData.id;

    // ── 6. Meta Graph API: Step 3 — Publish to live Instagram Feed ───────────
    const publishBody = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishBody,
    });
    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) {
      return new Response(JSON.stringify({
        error: `Instagram publish failed: ${publishData.error?.message || `HTTP ${publishRes.status}`}`,
      }), { status: 502 });
    }

    // ── 7. Update Supabase status to published (only after confirmed IG post) ─
    const { error: updateError } = await supabase
      .from('carousels')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', carouselId);

    if (updateError) {
      console.warn('[Lana Auto-Publish] Supabase status update failed:', updateError.message);
    }

    return new Response(JSON.stringify({
      success: true,
      carouselId,
      postId: publishData.id,
      postUrl: `https://www.instagram.com/p/${publishData.id}/`,
      status: 'published',
      publishedAt: new Date().toISOString(),
      message: `Successfully published carousel "${carousel.title}" to Instagram!`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('[Lana Auto-Publish Exception]:', err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Server error during automated publishing',
    }), { status: 500 });
  }
}
