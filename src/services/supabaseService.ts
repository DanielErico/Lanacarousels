import { supabase } from './supabaseClient';
import { Brand, Carousel, Slide } from '../types/lana';

// ─── BRANDS CRUD ───────────────────────────────────────────────────────────────

export async function fetchUserBrands(userId: string): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return [];
  }

  return data.map((b) => ({
    id: b.id,
    name: b.name,
    websiteUrl: b.website_url || '',
    industry: b.industry || '',
    description: b.description || '',
    audience: b.audience || '',
    voice: b.voice || 'High Impact Marketing',
    primaryColor: b.primary_color || '#0284C7',
    secondaryColor: b.secondary_color || '#C85A1A',
    accentColor: b.accent_color || '#E8691C',
    igHandle: b.ig_handle || '',
    igConnected: b.ig_connected || false,
    igAccountName: b.ig_account_name || '',
    postingFrequency: b.posting_frequency || '3x / week',
    isPrimary: b.is_primary ?? false,
  }));
}

export async function saveBrandToSupabase(userId: string, brand: Brand): Promise<Brand | null> {
  const payload = {
    user_id: userId,
    name: brand.name,
    website_url: brand.websiteUrl,
    industry: brand.industry,
    description: brand.description,
    audience: brand.audience,
    voice: brand.voice,
    primary_color: brand.primaryColor,
    secondary_color: brand.secondaryColor,
    accent_color: brand.accentColor,
    ig_handle: brand.igHandle,
    ig_connected: brand.igConnected,
    ig_account_name: brand.igAccountName,
    posting_frequency: brand.postingFrequency,
    is_primary: true,
  };

  // Check if existing brand (UUID string format)
  const isExistingUuid = Boolean(brand.id && brand.id.includes('-') && !brand.id.startsWith('brand-'));

  if (isExistingUuid) {
    const { data, error } = await supabase
      .from('brands')
      .update(payload)
      .eq('id', brand.id)
      .select()
      .single();

    if (error || !data) return null;
    return { ...brand, id: data.id };
  } else {
    const { data, error } = await supabase
      .from('brands')
      .insert(payload)
      .select()
      .single();

    if (error || !data) return null;
    return { ...brand, id: data.id };
  }
}

// ─── CAROUSELS & SLIDES CRUD ───────────────────────────────────────────────────

export async function fetchUserCarousels(userId: string, brandId?: string): Promise<Carousel[]> {
  let query = supabase.from('carousels').select('*, slides(*)').eq('user_id', userId);
  if (brandId) {
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((c) => {
    const sortedSlides: Slide[] = (c.slides || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((s: any) => ({
        id: s.id,
        orderIndex: s.order_index,
        type: s.type,
        headline: s.headline || '',
        subtext: s.subtext || '',
        badge: s.badge || '',
        bgGradient: s.bg_gradient || '#0284C7',
        textColor: s.text_color || '#FFFFFF',
        accentColor: s.accent_color || '#E8691C',
        wordCount: s.word_count || 0,
      }));

    return {
      id: c.id,
      brandId: c.brand_id,
      title: c.title || 'Untitled Carousel',
      sourceType: c.source_type || 'prompt',
      status: c.status || 'draft',
      stylePreset: c.style_preset || 'navy_orange_diagonal',
      frameworkType: c.framework_type || 'educational_tips',
      hookType: c.hook_type || 'bold_claim',
      platformSpec: c.platform_spec || 'ig_4_5',
      slides: sortedSlides,
      caption: {
        id: `cap-${c.id}`,
        text: c.caption_text || '',
        hashtags: Array.isArray(c.caption_hashtags) ? c.caption_hashtags : [],
        cta: c.caption_cta || '',
      },
      performanceScore: c.performance_score || { overall: 85, hookStrength: 85, readability: 85, slideFlow: 85, captionEngagement: 85, suggestions: [] },
      scheduledAt: c.scheduled_at,
      publishedAt: c.published_at,
    };
  });
}

export async function saveCarouselToSupabase(userId: string, carousel: Carousel): Promise<Carousel | null> {
  const carouselPayload = {
    user_id: userId,
    brand_id: carousel.brandId,
    title: carousel.title,
    source_type: carousel.sourceType,
    status: carousel.status,
    style_preset: carousel.stylePreset,
    framework_type: carousel.frameworkType,
    hook_type: carousel.hookType,
    platform_spec: carousel.platformSpec,
    caption_text: carousel.caption.text,
    caption_hashtags: carousel.caption.hashtags,
    caption_cta: carousel.caption.cta,
    performance_score: carousel.performanceScore,
    scheduled_at: carousel.scheduledAt,
    published_at: carousel.publishedAt,
  };

  const isExistingUuid = Boolean(carousel.id && carousel.id.includes('-') && !carousel.id.startsWith('car-') && !carousel.id.startsWith('carousel-') && !carousel.id.startsWith('batch-'));

  let savedCarouselId = carousel.id;

  if (isExistingUuid) {
    const { error } = await supabase
      .from('carousels')
      .update(carouselPayload)
      .eq('id', carousel.id);
    if (error) console.error('Error updating carousel:', error);
  } else {
    const { data, error } = await supabase
      .from('carousels')
      .insert(carouselPayload)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating carousel:', error);
      return null;
    }
    savedCarouselId = data.id;
  }

  // Delete existing slides for this carousel to sync updated list cleanly
  if (isExistingUuid) {
    await supabase.from('slides').delete().eq('carousel_id', savedCarouselId);
  }

  // Insert slides
  if (carousel.slides && carousel.slides.length > 0) {
    const slidesPayload = carousel.slides.map((s, idx) => ({
      carousel_id: savedCarouselId,
      order_index: idx,
      type: s.type,
      headline: s.headline,
      subtext: s.subtext,
      badge: s.badge,
      bg_gradient: s.bgGradient,
      text_color: s.textColor,
      accent_color: s.accentColor,
      word_count: s.wordCount || 0,
    }));

    const { error: slideErr } = await supabase.from('slides').insert(slidesPayload);
    if (slideErr) console.error('Error saving slides:', slideErr);
  }

  return { ...carousel, id: savedCarouselId };
}

export async function deleteCarouselFromSupabase(carouselId: string): Promise<boolean> {
  const { error } = await supabase.from('carousels').delete().eq('id', carouselId);
  return !error;
}
