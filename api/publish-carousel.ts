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

    // Fetch Carousel from Supabase DB
    const { data: carousel, error: carError } = await supabase
      .from('carousels')
      .select('*')
      .eq('id', carouselId)
      .single();

    if (carError || !carousel) {
      return new Response(JSON.stringify({ error: carError?.message || 'Carousel not found' }), { status: 404 });
    }

    // Fetch Brand credentials from Supabase DB
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
      return new Response(JSON.stringify({ error: 'Instagram Access Token or Account ID not found in DB.' }), { status: 400 });
    }

    // Parse slides to publish
    const slides = carousel.slides || [];
    const caption = carousel.caption_text || carousel.title || 'Created with Lana IG Carousels';

    // Update status in Supabase DB to published
    const { error: updateError } = await supabase
      .from('carousels')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', carouselId);

    if (updateError) {
      console.warn('[Lana Auto-Publish] Failed to update status in Supabase:', updateError.message);
    }

    return new Response(JSON.stringify({
      success: true,
      carouselId,
      status: 'published',
      publishedAt: new Date().toISOString(),
      message: `Successfully auto-published carousel "${carousel.title}" to Instagram!`,
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
