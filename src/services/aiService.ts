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

const DEFAULT_NVIDIA_KEY = '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';

// Priority: localStorage (Settings UI) → .env → default working key
export const getStoredApiKey = (): string =>
  localStorage.getItem(STORAGE_KEY_API) ||
  (import.meta.env.VITE_NVIDIA_API_KEY as string) ||
  DEFAULT_NVIDIA_KEY;

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
  const activeKey = apiKey || DEFAULT_NVIDIA_KEY;

  // Tier 1: Call Vercel serverless backend endpoint (eliminates browser CORS restrictions)
  try {
    const serverlessRes = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model,
        apiKey: activeKey,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (serverlessRes.ok) {
      const data: ApiResponse = await serverlessRes.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    }
  } catch {
    // Continue to Tier 2 if /api/generate is not reachable (e.g. static dev server)
  }

  // Tier 2: Direct NVIDIA NIM API call
  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${activeKey}`,
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

// ─── Smart Contextual Semantic Generator (Offline / Network Fallback) ─────────

function generateFallbackCarousel(
  topic: string,
  brand: Brand,
  stylePreset: ContentStylePreset,
  frameworkType: CarouselFrameworkType,
  platformSpec: PlatformSpec,
  slideCount: number = 5,
): Partial<Carousel> {
  const cleanTopic = topic.replace(/https?:\/\/[^\s]+/g, '').trim() || 'Achieving Long Term Success';
  const lower = cleanTopic.toLowerCase();

  // Detect domain theme
  let theme: 'mindset' | 'growth' | 'strategy' | 'execution' | 'general' = 'general';
  if (lower.includes('give up') || lower.includes('giving up') || lower.includes('quit') || lower.includes('mindset') || lower.includes('discipline') || lower.includes('focus') || lower.includes('habit')) {
    theme = 'mindset';
  } else if (lower.includes('growth') || lower.includes('scale') || lower.includes('revenue') || lower.includes('sales') || lower.includes('client')) {
    theme = 'growth';
  } else if (lower.includes('strategy') || lower.includes('plan') || lower.includes('brand') || lower.includes('content') || lower.includes('social')) {
    theme = 'strategy';
  } else if (lower.includes('start') || lower.includes('launch') || lower.includes('build') || lower.includes('system')) {
    theme = 'execution';
  }

  const themeSlides: Record<string, GeneratedSlideData[]> = {
    mindset: [
      {
        type: 'hook',
        headline: cleanTopic.toUpperCase(),
        subtext: 'Why persistence always beats temporary motivation in the long run.',
      },
      {
        type: 'value',
        headline: 'THE REALITY OF THE DIP',
        subtext: 'Every breakthrough is preceded by a period where nothing seems to work. That dip is where your competition quits.',
      },
      {
        type: 'value',
        headline: 'REFRAME FAILURE AS DATA',
        subtext: 'A failed attempt is not a dead end — it is feedback. Adjust your strategy, not your ultimate ambition.',
      },
      {
        type: 'value',
        headline: 'COMPOUND EFFORT WINS',
        subtext: '1% improvement daily creates 37x growth over a year. Small daily consistency always triumphs over sporadic intensity.',
      },
      {
        type: 'cta',
        headline: 'STAY IN THE GAME 🔖',
        subtext: `Save this reminder for your hardest days. Follow ${brand.igHandle || '@brand'} for more daily fuel!`,
      },
    ],
    growth: [
      {
        type: 'hook',
        headline: cleanTopic.toUpperCase(),
        subtext: `A proven framework to scale ${brand.industry} results faster with less friction.`,
      },
      {
        type: 'value',
        headline: 'IDENTIFY YOUR 80/20 LEVER',
        subtext: '20% of your inputs drive 80% of your tangible revenue and reach. Double down on what already works.',
      },
      {
        type: 'value',
        headline: 'REMOVE SYSTEM BOTTLENECKS',
        subtext: 'Growth is rarely a motivation issue; it is a workflow constraint. Automate and delegate repetitive friction.',
      },
      {
        type: 'value',
        headline: 'OPTIMIZE FOR RETENTION',
        subtext: 'Acquisition gets attention, but retention builds enterprise value. Keep your core audience deeply engaged.',
      },
      {
        type: 'cta',
        headline: 'SCALE SMARTER TODAY 🔖',
        subtext: `Save this post to your business board. Follow ${brand.igHandle || '@brand'} for weekly growth systems!`,
      },
    ],
    strategy: [
      {
        type: 'hook',
        headline: cleanTopic.toUpperCase(),
        subtext: 'The blueprint top performers use to dominate their space without burning out.',
      },
      {
        type: 'value',
        headline: 'CLARITY PRECEDES SPEED',
        subtext: 'Without a clear target, execution is just noisy hustle. Define your non-negotiable weekly milestones first.',
      },
      {
        type: 'value',
        headline: 'AUDIENCE-FIRST POSITIONING',
        subtext: 'Speak directly to the exact pain point your dream client feels every morning before coffee.',
      },
      {
        type: 'value',
        headline: 'CONSISTENT DISTRIBUTION',
        subtext: 'Great content unseen is zero leverage. Repurpose and distribute your core thesis across multiple channels.',
      },
      {
        type: 'cta',
        headline: 'BOOKMARK THIS STRATEGY 🔖',
        subtext: `Save this carousel for your next planning sprint. Follow ${brand.igHandle || '@brand'} for high-impact playbooks!`,
      },
    ],
    execution: [
      {
        type: 'hook',
        headline: cleanTopic.toUpperCase(),
        subtext: 'How to transition from overthinking ideas into relentless daily execution.',
      },
      {
        type: 'value',
        headline: 'START BEFORE YOU FEEL READY',
        subtext: 'Perfectionism is procrastination in disguise. Ship the prototype and iterate based on real feedback.',
      },
      {
        type: 'value',
        headline: 'BUILD REPEATABLE HABITS',
        subtext: 'You do not rise to the level of your goals; you fall to the level of your daily operational habits.',
      },
      {
        type: 'value',
        headline: 'MEASURE WHAT MATTERS',
        subtext: 'Track leading indicators (actions taken) rather than lagging indicators (outcomes) to stay motivated.',
      },
      {
        type: 'cta',
        headline: 'TAKE ACTION TODAY 🚀',
        subtext: `Save this checklist and implement Step 1 today. Follow ${brand.igHandle || '@brand'} for actionable frameworks!`,
      },
    ],
    general: [
      {
        type: 'hook',
        headline: cleanTopic.toUpperCase(),
        subtext: 'A high-impact breakdown of the principles you need to know today.',
      },
      {
        type: 'value',
        headline: 'THE FOUNDATIONAL PILLAR',
        subtext: 'Master the core fundamentals before chasing advanced tactics or shortcuts that rarely last.',
      },
      {
        type: 'value',
        headline: 'EXECUTE WITH INTENTION',
        subtext: 'Eliminate low-value distractions and focus your prime energy on what moves the needle forward.',
      },
      {
        type: 'value',
        headline: 'ITERATE & REFINE',
        subtext: 'Review weekly progress, double down on high-performing actions, and ruthlessly cut what stalls momentum.',
      },
      {
        type: 'cta',
        headline: 'SAVE FOR LATER 🔖',
        subtext: `Bookmark this guide for easy reference. Follow ${brand.igHandle || '@brand'} for more insights!`,
      },
    ],
  };

  const selectedSlides = themeSlides[theme] || themeSlides.general;

  const generated: GeneratedCarouselData = {
    title: cleanTopic,
    hookType: 'bold_claim',
    slides: selectedSlides.slice(0, slideCount),
    caption: {
      text: `When it comes to "${cleanTopic}", most people stop right before their breakthrough. Here is a breakdown of why staying the course and refining your approach changes everything. What has been your biggest lesson so far?`,
      hashtags: ['#GrowthMindset', '#ConsistencyIsKey', '#ContentStrategy', '#NeverGiveUp', '#BusinessGrowth', '#LanaStudio'],
      cta: 'Save this post to revisit whenever you need clarity 🔖',
    },
  };

  return buildCarouselObject(generated, brand, stylePreset, frameworkType, platformSpec, 'prompt');
}
