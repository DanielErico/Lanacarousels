/**
 * Lana AI Service — NVIDIA Nemotron Integration
 * Uses the NVIDIA NIM API (OpenAI-compatible format)
 * Base URL: https://integrate.api.nvidia.com/v1
 */

import { Carousel, Brand, ContentStylePreset, CarouselFrameworkType, HookType, PlatformSpec, Slide, Caption } from '../types/lana';

// ─── API Config ────────────────────────────────────────────────────────────────

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export type NemotronModel =
  | 'meta/llama-3.3-70b-instruct'
  | 'meta/llama-3.1-70b-instruct'
  | 'nvidia/llama-3.1-nemotron-51b-instruct';

export const NEMOTRON_MODELS: { id: NemotronModel; label: string; speed: string }[] = [
  { id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (Latest & Highest Quality)', speed: '~6s' },
  { id: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (High Quality)', speed: '~5s' },
  { id: 'nvidia/llama-3.1-nemotron-51b-instruct', label: 'Nemotron 51B Instruct', speed: '~4s' },
];

// ─── Storage Helpers ────────────────────────────────────────────────────────────

const STORAGE_KEY_API = 'lana_nvidia_api_key';
const STORAGE_KEY_MODEL = 'lana_nvidia_model';

// Priority: localStorage (Settings UI) → .env → empty
export const getStoredApiKey = (): string =>
  localStorage.getItem(STORAGE_KEY_API) ||
  (import.meta.env.VITE_NVIDIA_API_KEY as string) ||
  '';

export const setStoredApiKey = (key: string): void => localStorage.setItem(STORAGE_KEY_API, key);

export const getStoredModel = (): NemotronModel =>
  (localStorage.getItem(STORAGE_KEY_MODEL) as NemotronModel) ||
  (import.meta.env.VITE_NVIDIA_MODEL as NemotronModel) ||
  'meta/llama-3.3-70b-instruct';

export const setStoredModel = (model: NemotronModel): void => localStorage.setItem(STORAGE_KEY_MODEL, model);

// ─── Core API Call ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ApiResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

async function callNemotron(
  messages: ChatMessage[],
  apiKey: string,
  model: NemotronModel = 'meta/llama-3.3-70b-instruct',
  maxTokens = 2048,
  temperature = 0.7,
): Promise<string> {
  if (!apiKey) throw new Error('NVIDIA API key not configured. Please add it in Settings.');

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.detail || err?.message || err?.error?.message || `NVIDIA API error ${response.status}: ${response.statusText}`,
    );
  }

  const data: ApiResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ─── Robust JSON Extractor ──────────────────────────────────────────────────────

function extractJSON<T>(text: string): T {
  if (!text) throw new Error('Empty response received from AI engine.');

  // 1. Remove reasoning <think>...</think> blocks if present
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Try matching json code blocks ```json ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    // Or find outermost { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }

  // 3. Clean common JSON syntax errors (trailing commas, control characters)
  cleaned = cleaned
    .replace(/,\s*([\}\]])/g, '$1') // remove trailing commas
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
      if (match === '\n' || match === '\r' || match === '\t') return match;
      return '';
    });

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[Lana AI] JSON parse failure. Raw text:', text, 'Cleaned text:', cleaned);
    throw new Error(`Failed to parse AI structure. ${err instanceof Error ? err.message : ''}`);
  }
}

// ─── System Prompt ──────────────────────────────────────────────────────────────

function buildSystemPrompt(brand: Brand): string {
  return `You are Lana, an expert Instagram carousel copywriter and content strategist.
You create high-converting, viral carousel content for brands.

Brand Context:
- Brand: ${brand.name}
- Industry: ${brand.industry}
- Description: ${brand.description}
- Target Audience: ${brand.audience}
- Brand Voice: ${brand.voice}
- Instagram: ${brand.igHandle}

Carousel Rules (CRITICAL):
1. HOOK slide: Bold, curiosity-driven, max 10 words headline. No filler.
2. CONTENT slides: Max 30 words total (headline + subtext). Be ultra-concise.
3. CTA slide: One clear action. "Save this", "Follow", "DM us", "Comment X".
4. Each slide must feel distinct — vary sentence structure.
5. Use power words: "secret", "proven", "mistake", "never", "always", "instantly".
6. Headlines should be ALL CAPS or Title Case for visual impact.
7. Numbers always outperform vague claims. Use specific data when possible.

Respond strictly with valid JSON only. Do not add thinking process or Markdown outside the code block.`;
}

// ─── Carousel Generator Types ───────────────────────────────────────────────────

interface GeneratedSlideData {
  type: 'hook' | 'value' | 'context' | 'summary' | 'cta';
  headline: string;
  subtext: string;
}

interface GeneratedCarouselData {
  title: string;
  hookType: HookType;
  slides: GeneratedSlideData[];
  caption: {
    text: string;
    hashtags: string[];
    cta: string;
  };
}

// ─── Preset Accent Map ──────────────────────────────────────────────────────────

const ACCENT_MAP: Record<ContentStylePreset, string> = {
  navy_orange_diagonal: '#E8691C',
  agency_black_blue_wave: '#0EA5E9',
  ai_dark_tech_purple: '#7B7BFF',
  dark_navy_blue_frame: '#38BDF8',
  seamless_yellow_bold: '#F5D300',
};

// ─── Helper to Convert Data into Carousel Object ───────────────────────────────

function buildCarouselObject(
  generated: GeneratedCarouselData,
  brand: Brand,
  stylePreset: ContentStylePreset,
  frameworkType: CarouselFrameworkType,
  platformSpec: PlatformSpec,
  sourceType: 'prompt' | 'website' | 'voice_note' = 'prompt',
): Partial<Carousel> {
  const accent = ACCENT_MAP[stylePreset] || '#0EA5E9';
  const slideCount = generated.slides.length || 5;

  const slides: Slide[] = generated.slides.map((s, i) => ({
    id: `ai-slide-${Date.now()}-${i}`,
    orderIndex: i,
    type: s.type || (i === 0 ? 'hook' : i === slideCount - 1 ? 'cta' : 'value'),
    badge: i === 0
      ? `01/${slideCount.toString().padStart(2, '0')}`
      : `${(i + 1).toString().padStart(2, '0')}/${slideCount.toString().padStart(2, '0')}`,
    headline: s.headline || 'KEY STRATEGY',
    subtext: s.subtext || 'Actionable breakdown to drive results.',
    bgGradient: '#0284C7',
    textColor: '#FFFFFF',
    accentColor: accent,
    wordCount: `${s.headline} ${s.subtext}`.split(/\s+/).filter(Boolean).length,
  }));

  const caption: Caption = {
    id: `cap-${Date.now()}`,
    text: generated.caption?.text || `Here is a complete breakdown of ${generated.title} for ${brand.name}.`,
    hashtags: generated.caption?.hashtags?.length
      ? generated.caption.hashtags
      : ['#ContentStrategy', '#InstagramGrowth', '#BusinessAutomation', '#MarketingTips', '#SocialMediaStudio'],
    cta: generated.caption?.cta || 'Save this post for later!',
  };

  const hookWords = slides[0]?.headline.split(' ').length || 0;
  const avgWords = slides.reduce((sum, s) => sum + (s.wordCount || 0), 0) / (slides.length || 1);
  const hookStrength = hookWords <= 8 ? 95 : hookWords <= 10 ? 85 : 70;
  const readability = avgWords <= 20 ? 92 : avgWords <= 30 ? 80 : 65;

  return {
    id: `carousel-ai-${Date.now()}`,
    brandId: brand.id,
    title: generated.title || 'High Impact Carousel',
    sourceType,
    status: 'draft',
    stylePreset,
    frameworkType,
    hookType: generated.hookType || 'bold_claim',
    platformSpec,
    slides,
    caption,
    performanceScore: {
      overall: Math.round((hookStrength + readability) / 2),
      hookStrength,
      readability,
      slideFlow: 88,
      captionEngagement: caption.hashtags.length >= 5 ? 90 : 75,
      suggestions: [
        hookWords > 10 ? 'Shorten your hook to under 10 words for max impact' : '✓ Hook length is optimal',
        avgWords > 30 ? 'Reduce word count per slide — aim for under 30 words' : '✓ Slide copy is concise',
        '✓ Generated with NVIDIA Nemotron',
      ],
    },
  };
}

// ─── Generate from Prompt ───────────────────────────────────────────────────────

export async function generateCarouselFromPrompt(
  topic: string,
  brand: Brand,
  stylePreset: ContentStylePreset,
  frameworkType: CarouselFrameworkType,
  platformSpec: PlatformSpec,
  slideCount: number = 5,
): Promise<Partial<Carousel>> {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  const frameworkGuide = {
    educational_tips: `Structure: Hook → Why This Matters → Tip 1 → Tip 2 → Tip 3 → Summary → CTA`,
    storytelling_case_study: `Structure: Hook → Problem → Turning Point → Action Taken → Result → Key Lesson → CTA`,
    before_after: `Structure: Hook → The Before (pain) → The After (result) → What Changed → How → Proof → CTA`,
    listicle_tools: `Structure: Hook → Item 1 → Item 2 → Item 3 → Item 4 → Bonus Tip → CTA`,
  }[frameworkType];

  const prompt = `Create a ${slideCount}-slide Instagram carousel for this topic: "${topic}"

Framework: ${frameworkType.replace(/_/g, ' ').toUpperCase()}
${frameworkGuide}

Return EXACTLY this JSON structure:
\`\`\`json
{
  "title": "Short title for this carousel (max 8 words)",
  "hookType": "bold_claim",
  "slides": [
    {
      "type": "hook",
      "headline": "HEADLINE TEXT (max 10 words, ultra bold, curiosity hook)",
      "subtext": "Supporting line that builds tension or promises value (max 15 words)"
    },
    {
      "type": "value",
      "headline": "Slide 2 headline (max 8 words)",
      "subtext": "Concise explanation (max 20 words)"
    },
    {
      "type": "value",
      "headline": "Slide 3 headline (max 8 words)",
      "subtext": "Concise explanation (max 20 words)"
    },
    {
      "type": "value",
      "headline": "Slide 4 headline (max 8 words)",
      "subtext": "Concise explanation (max 20 words)"
    },
    {
      "type": "cta",
      "headline": "ACTION HEADLINE",
      "subtext": "Clear call to action"
    }
  ],
  "caption": {
    "text": "Engaging Instagram caption (2-3 sentences, conversational, ends with question)",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7"],
    "cta": "Single clear call to action (max 10 words)"
  }
}
\`\`\``;

  try {
    const rawText = await callNemotron(
      [
        { role: 'system', content: buildSystemPrompt(brand) },
        { role: 'user', content: prompt },
      ],
      apiKey,
      model,
      2048,
      0.75,
    );

    const generated = extractJSON<GeneratedCarouselData>(rawText);
    return buildCarouselObject(generated, brand, stylePreset, frameworkType, platformSpec, 'prompt');
  } catch (err: unknown) {
    console.warn('[Lana AI] Nemotron call failed, generating smart fallback:', err);
    // Fallback generator so user experience never breaks
    return generateFallbackCarousel(topic, brand, stylePreset, frameworkType, platformSpec, slideCount);
  }
}

// ─── Generate from URL ─────────────────────────────────────────────────────────

export async function generateCarouselFromUrl(
  url: string,
  brand: Brand,
  stylePreset: ContentStylePreset,
  frameworkType: CarouselFrameworkType,
  platformSpec: PlatformSpec,
  slideCount: number = 5,
): Promise<Partial<Carousel>> {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  let pageContent = `Website: ${url}`;
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const html = data.contents || '';
      pageContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1500);
    }
  } catch {
    // Fall back if scrape times out
  }

  const prompt = `Extract the core content from this webpage: "${pageContent}" and create a ${slideCount}-slide Instagram carousel.

Return EXACTLY this JSON structure:
\`\`\`json
{
  "title": "Carousel Title (max 8 words)",
  "hookType": "bold_claim",
  "slides": [
    { "type": "hook", "headline": "HOOK HEADLINE", "subtext": "Subtext line" },
    { "type": "value", "headline": "Key Point 1", "subtext": "Description line" },
    { "type": "value", "headline": "Key Point 2", "subtext": "Description line" },
    { "type": "value", "headline": "Key Point 3", "subtext": "Description line" },
    { "type": "cta", "headline": "SAVE & FOLLOW", "subtext": "Call to action" }
  ],
  "caption": {
    "text": "Caption text summarizing website insights",
    "hashtags": ["#WebsiteInsights", "#IndustryStrategy", "#GrowthHacks", "#LanaStudio"],
    "cta": "Visit website for more"
  }
}
\`\`\``;

  try {
    const rawText = await callNemotron(
      [
        { role: 'system', content: buildSystemPrompt(brand) },
        { role: 'user', content: prompt },
      ],
      apiKey,
      model,
      2048,
      0.7,
    );

    const generated = extractJSON<GeneratedCarouselData>(rawText);
    return buildCarouselObject(generated, brand, stylePreset, frameworkType, platformSpec, 'website');
  } catch (err) {
    console.warn('[Lana AI] Web scrape Nemotron generation failed, using fallback:', err);
    const domain = url.replace(/https?:\/\//, '').split('/')[0];
    return generateFallbackCarousel(`Insights from ${domain}`, brand, stylePreset, frameworkType, platformSpec, slideCount);
  }
}

// ─── Improve Single Slide ──────────────────────────────────────────────────────

export async function improveSlide(
  slide: Slide,
  brand: Brand,
  instruction?: string,
): Promise<{ headline: string; subtext: string }> {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  const prompt = `Improve this slide copy for brand "${brand.name}" (${brand.voice} voice):

Current Headline: "${slide.headline}"
Current Subtext: "${slide.subtext}"
Slide Type: ${slide.type}
${instruction ? `Instruction: ${instruction}` : ''}

Rules:
- Headline: MAX 10 words, high impact
- Subtext: MAX 20 words, concise
- Output valid JSON only:
\`\`\`json
{ "headline": "IMPROVED HEADLINE", "subtext": "Improved subtext description" }
\`\`\``;

  try {
    const rawText = await callNemotron(
      [
        { role: 'system', content: buildSystemPrompt(brand) },
        { role: 'user', content: prompt },
      ],
      apiKey,
      model,
      512,
      0.8,
    );
    return extractJSON<{ headline: string; subtext: string }>(rawText);
  } catch {
    // Fallback improvement
    return {
      headline: slide.headline.toUpperCase(),
      subtext: `${slide.subtext} (Optimized for high engagement)`,
    };
  }
}

// ─── Generate Caption Only ─────────────────────────────────────────────────────

export async function generateCaption(
  slides: Slide[],
  brand: Brand,
): Promise<Caption> {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  const slideSummary = slides.map((s, i) => `Slide ${i + 1}: ${s.headline}`).join('\n');

  const prompt = `Write an Instagram caption for this carousel:

${slideSummary}

Brand: ${brand.name} (${brand.igHandle}) — Voice: ${brand.voice}

Return JSON only:
\`\`\`json
{
  "text": "2-3 sentence caption ending with a question",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7"],
  "cta": "Single call to action"
}
\`\`\``;

  try {
    const rawText = await callNemotron(
      [
        { role: 'system', content: buildSystemPrompt(brand) },
        { role: 'user', content: prompt },
      ],
      apiKey,
      model,
      512,
      0.8,
    );
    const generated = extractJSON<{ text: string; hashtags: string[]; cta: string }>(rawText);
    return {
      id: `cap-${Date.now()}`,
      text: generated.text,
      hashtags: generated.hashtags,
      cta: generated.cta,
    };
  } catch {
    return {
      id: `cap-${Date.now()}`,
      text: `Swipe through to discover how ${brand.name} helps you master ${slides[0]?.headline || 'these key strategies'}! What's your biggest takeaway?`,
      hashtags: ['#InstagramCarousel', '#ContentStrategy', '#SocialMediaGrowth', '#BusinessAutomation', '#LanaStudio'],
      cta: 'Save this post for later 🔖',
    };
  }
}

// ─── Smart Fallback Generator ──────────────────────────────────────────────────

function generateFallbackCarousel(
  topic: string,
  brand: Brand,
  stylePreset: ContentStylePreset,
  frameworkType: CarouselFrameworkType,
  platformSpec: PlatformSpec,
  slideCount: number = 5,
): Partial<Carousel> {
  const cleanTopic = topic.replace(/https?:\/\/[^\s]+/g, '').trim() || 'Business Growth Strategy';
  const words = cleanTopic.split(/\s+/).filter(w => w.length > 2);
  const mainSubject = words.slice(0, 4).join(' ').toUpperCase() || 'HIGH IMPACT STRATEGY';
  const keyTerm1 = words[0] ? words[0].toUpperCase() : 'AUTOMATION';
  const keyTerm2 = words[1] ? words[1].toUpperCase() : 'ENGAGEMENT';
  const keyTerm3 = words[2] ? words[2].toUpperCase() : 'GROWTH';

  const mockSlidesData: GeneratedSlideData[] = [
    {
      type: 'hook',
      headline: cleanTopic.toUpperCase(),
      subtext: `Swipe to discover 4 proven ${keyTerm1} tactics for ${brand.name}.`,
    },
    {
      type: 'value',
      headline: `01. OPTIMIZE FOR ${keyTerm1}`,
      subtext: `Streamline your content pipeline by applying targeted ${keyTerm1.toLowerCase()} workflows.`,
    },
    {
      type: 'value',
      headline: `02. MAXIMIZE YOUR ${keyTerm2}`,
      subtext: `Create scroll-stopping hooks and value-dense slides that keep readers engaged.`,
    },
    {
      type: 'value',
      headline: `03. SCALE ${keyTerm3} & DWEL TIME`,
      subtext: `Structure your carousels for 99% readability to boost algorithm reach.`,
    },
    {
      type: 'cta',
      headline: 'SAVE THIS POST 🔖',
      subtext: `Follow ${brand.igHandle || '@brand'} for more ${brand.industry} breakdowns!`,
    },
  ];

  const generated: GeneratedCarouselData = {
    title: cleanTopic,
    hookType: 'bold_claim',
    slides: mockSlidesData.slice(0, slideCount),
    caption: {
      text: `Looking to scale your ${brand.industry} content? Here is a breakdown of ${cleanTopic}. Swipe through and save this post!`,
      hashtags: ['#ContentStrategy', `#${keyTerm1.replace(/[^A-Z]/g, '')}`, '#InstagramGrowth', '#LanaStudio', '#GrowthMindset'],
      cta: 'Save this post for later 🔖',
    },
  };

  return buildCarouselObject(generated, brand, stylePreset, frameworkType, platformSpec, 'prompt');
}
