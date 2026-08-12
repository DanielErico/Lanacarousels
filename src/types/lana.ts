export type ContentStylePreset = 
  | 'navy_orange_diagonal'
  | 'agency_black_blue_wave'
  | 'ai_dark_tech_purple'
  | 'dark_navy_blue_frame'
  | 'seamless_yellow_bold';

export type CarouselFrameworkType = 
  | 'educational_tips'
  | 'storytelling_case_study'
  | 'before_after'
  | 'listicle_tools';

export type HookType = 
  | 'bold_claim' 
  | 'curiosity_question' 
  | 'number_promise' 
  | 'contrarian' 
  | 'before_after';

export type PlatformSpec = 'ig_4_5' | 'ig_1_1' | 'linkedin_4_5' | 'twitter_16_9';

export type CarouselStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Slide {
  id: string;
  orderIndex: number;
  type: 'hook' | 'context' | 'value' | 'summary' | 'cta';
  headline: string;
  subtext: string;
  badge?: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  imageUrl?: string;
  graphicStyle?: string;
  wordCount?: number;
}

export interface Caption {
  id: string;
  text: string;
  hashtags: string[];
  cta: string;
}

export interface PerformanceScore {
  overall: number;
  hookStrength: number;
  readability: number;
  slideFlow: number;
  captionEngagement: number;
  suggestions: string[];
}

export interface Carousel {
  id: string;
  brandId: string;
  title: string;
  sourceType: 'website' | 'prompt' | 'voice_note' | 'batch';
  status: CarouselStatus;
  stylePreset: ContentStylePreset;
  frameworkType: CarouselFrameworkType;
  hookType: HookType;
  platformSpec: PlatformSpec;
  slides: Slide[];
  caption: Caption;
  scheduledAt?: string;
  publishedAt?: string;
  performanceScore: PerformanceScore;
  igAccountId?: string;
}

export interface Brand {
  id: string;
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  audience: string;
  voice: 'Playful & Bold' | 'Creative & Edgy' | 'High Impact Marketing' | 'Professional & Executive';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  postingFrequency: '1x / day' | '3x / week' | '5x / week';
  igHandle: string;
  igConnected: boolean;
  igAccountName?: string;
  isPrimary?: boolean;
}

export interface AnalyticsSnapshot {
  carouselId: string;
  title: string;
  publishedAt: string;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagementRate: number;
}
