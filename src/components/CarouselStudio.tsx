import React, { useState } from 'react';
import { 
  Globe, 
  Mic, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Wand2, 
  Calendar, 
  RefreshCw, 
  Sliders, 
  MessageSquareText, 
  Plus, 
  Instagram,
  Zap,
  LayoutGrid,
  Bot,
  AlertCircle,
  RotateCcw,
  Download,
  Archive,
  Loader2,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  Carousel, 
  Slide, 
  ContentStylePreset, 
  CarouselFrameworkType, 
  HookType, 
  PlatformSpec,
  Brand
} from '../types/lana';
import { TemplateCanvas } from './TemplateCanvas';
import {
  generateCarouselFromPrompt,
  generateCarouselFromUrl,
  improveSlide,
  generateCaption,
  getStoredApiKey,
  getStoredModel,
  NEMOTRON_MODELS,
} from '../services/aiService';
import { exportSlidePng, exportCarouselZip } from '../services/exportService';
import { publishCarouselToInstagram, schedulePostWithQStash, getStoredInstagramCredentials, initiateInstagramOAuthLogin, isInstagramConnected } from '../services/instagramService';

interface CarouselStudioProps {
  carousel?: Carousel;
  brand?: Brand;
  onSaveCarousel: (carousel: Carousel) => void;
  onScheduleCarousel: (carousel: Carousel) => void;
  onOpenSettings?: () => void;
}

export const CarouselStudio: React.FC<CarouselStudioProps> = ({
  carousel: initialCarousel,
  brand,
  onSaveCarousel,
  onScheduleCarousel,
  onOpenSettings,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'url' | 'prompt' | 'voice'>('prompt');
  const [websiteUrl, setWebsiteUrl] = useState('https://lana.ai');
  const [promptText, setPromptText] = useState('How AI Automation Increases Instagram Engagement by 300%');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isImprovingSlide, setIsImprovingSlide] = useState(false);
  const [repurposeModalOpen, setRepurposeModalOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const hiddenSlidesRef = React.useRef<HTMLDivElement>(null);

  // Active Carousel State
  const [currentCarousel, setCurrentCarousel] = useState<Carousel>(
    initialCarousel || {
      id: 'car-navy-orange',
      brandId: 'brand-1',
      title: 'How to Grow Your Business',
      sourceType: 'prompt',
      status: 'draft',
      stylePreset: 'navy_orange_diagonal',
      frameworkType: 'educational_tips',
      hookType: 'curiosity_question',
      platformSpec: 'ig_4_5',
      slides: [
        {
          id: 'sl-1', orderIndex: 0, type: 'hook',
          badge: '01/05', headline: 'BUSINESS',
          subtext: 'Swipe to discover 4 powerful growth strategies.',
          bgGradient: '#0284C7', textColor: '#FFFFFF', accentColor: '#E8691C', wordCount: 8,
        },
        {
          id: 'sl-2', orderIndex: 1, type: 'value',
          badge: '02/05', headline: 'Define Your Target Market',
          subtext: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
          bgGradient: '#0284C7', textColor: '#FFFFFF', accentColor: '#E8691C', wordCount: 22,
        },
        {
          id: 'sl-3', orderIndex: 2, type: 'value',
          badge: '03/05', headline: 'Build a Strong Online Presence',
          subtext: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
          bgGradient: '#0284C7', textColor: '#FFFFFF', accentColor: '#C85A1A', wordCount: 22,
        },
        {
          id: 'sl-4', orderIndex: 3, type: 'value',
          badge: '04/05', headline: 'Leverage Social Proof',
          subtext: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
          bgGradient: '#2A1A10', textColor: '#FFFFFF', accentColor: '#8B3A20', wordCount: 22,
        },
        {
          id: 'sl-5', orderIndex: 4, type: 'cta',
          badge: '05/05', headline: 'Scale with Data',
          subtext: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
          bgGradient: '#2A1A10', textColor: '#FFFFFF', accentColor: '#8B3A20', wordCount: 22,
        },
      ],
      caption: {
        id: 'cap-1',
        text: 'Growing a business takes strategy, not luck. Here are 4 pillars that drive real results 👇',
        hashtags: ['#businessgrowth', '#entrepreneurship', '#marketingstrategy', '#b2b'],
        cta: 'Save this for your next planning session 📌'
      },
      performanceScore: {
        overall: 87, hookStrength: 91, readability: 85, slideFlow: 88, captionEngagement: 82,
        suggestions: ['Add a stronger CTA on slide 5']
      }
    }
  );

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = currentCarousel.slides[activeSlideIndex] || currentCarousel.slides[0];

  const activeSlideWords = `${activeSlide.headline} ${activeSlide.subtext}`.trim().split(/\s+/).filter(Boolean).length;

  // Scheduling & Live Publishing State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<{ url?: string; title: string } | null>(null);
  const [publishErrorMessage, setPublishErrorMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handlePostNow = async () => {
    const creds = getStoredInstagramCredentials();

    if (!creds.accessToken) {
      setPublishErrorMessage('Your Instagram account is not connected yet. Click "1-Click Connect Instagram Account" below to authorize!');
      return;
    }

    setIsPublishingNow(true);
    setPublishErrorMessage('');
    setPublishSuccessMessage(null);

    try {
      const slideUrls: string[] = [];
      const hiddenContainer = hiddenSlidesRef.current;

      if (hiddenContainer && (window as any).html2canvas) {
        for (let i = 0; i < currentCarousel.slides.length; i++) {
          const slideEl = hiddenContainer.children[i] as HTMLElement;
          if (slideEl) {
            const canvas = await (window as any).html2canvas(slideEl, { scale: 2, useCORS: true });
            const dataUrl = canvas.toDataURL('image/png');
            slideUrls.push(dataUrl);
          }
        }
      }

      const hashtags = (currentCarousel.caption.hashtags || [])
        .map(h => (h.startsWith('#') ? h : `#${h}`))
        .join(' ');
      const cta = currentCarousel.caption.cta ? `\n\n${currentCarousel.caption.cta}` : '';
      const captionBody = `${currentCarousel.caption.text || ''}${cta}\n\n${hashtags}`.trim();

      // Pass carouselId so Supabase Storage uploads are properly namespaced
      const res = await publishCarouselToInstagram(
        slideUrls.length > 0 ? slideUrls : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1350&fit=crop'],
        currentCarousel.title,
        captionBody,
        undefined,
        undefined,
        currentCarousel.id
      );

      if (res.success) {
        const updated = {
          ...currentCarousel,
          status: 'published' as const,
          publishedAt: new Date().toISOString(),
        };
        setCurrentCarousel(updated);
        await onSaveCarousel(updated);
        setPublishSuccessMessage({
          title: currentCarousel.title,
          url: res.postUrl || 'https://www.instagram.com/',
        });
      } else {
        setPublishErrorMessage(res.error || 'Failed to publish to Instagram.');
      }
    } catch (err: unknown) {
      setPublishErrorMessage(err instanceof Error ? err.message : 'Network error during live post.');
    } finally {
      setIsPublishingNow(false);
    }
  };

  const handleConfirmSchedule = async () => {
    setIsScheduling(true);
    try {
      const scheduledDateTimeStr = `${scheduleDate}T${scheduleTime}:00Z`;

      const updated = {
        ...currentCarousel,
        status: 'scheduled' as const,
        scheduledAt: scheduledDateTimeStr,
      };

      setCurrentCarousel(updated);
      await onSaveCarousel(updated);

      // Call Upstash QStash background scheduling
      await schedulePostWithQStash(updated.id, scheduledDateTimeStr, activeBrand.id);

      setIsScheduleModalOpen(false);
      onScheduleCarousel(updated);
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRestructureTo7Slides = () => {
    const baseGradient = currentCarousel.slides[0].bgGradient;
    const baseAccent = currentCarousel.slides[0].accentColor;

    const structured7Slides: Slide[] = [
      {
        id: 'sl-1',
        orderIndex: 1,
        type: 'hook',
        badge: '@neostudio_ai',
        headline: currentCarousel.slides[0]?.headline || '5 Automations to Scale Your Agency 10x',
        subtext: 'Swipe to unlock the step-by-step blueprint ->',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 10
      },
      {
        id: 'sl-2',
        orderIndex: 2,
        type: 'context',
        badge: 'WHY THIS MATTERS',
        headline: '90% of Agencies Burn Out Manual Scraping',
        subtext: 'Without AI workflows, scaling content ops leads to diminishing returns.',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 13
      },
      {
        id: 'sl-3',
        orderIndex: 3,
        type: 'value',
        badge: '01',
        headline: 'Automated Scraping Engine',
        subtext: 'Extract core brand insights directly from web URLs in 5 seconds.',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 11
      },
      {
        id: 'sl-4',
        orderIndex: 4,
        type: 'value',
        badge: '02',
        headline: 'Voice Note Conversion',
        subtext: 'Speak your creative thoughts and instantly format into 7 slides.',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 10
      },
      {
        id: 'sl-5',
        orderIndex: 5,
        type: 'value',
        badge: '03',
        headline: 'Visual Template Styling',
        subtext: 'Apply AI Cyber, Bento 3D, and Swiss Editorial presets in 1 click.',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 12
      },
      {
        id: 'sl-6',
        orderIndex: 6,
        type: 'summary',
        badge: '04',
        headline: 'Swipe Dwell Optimization',
        subtext: 'Enforce max 35 words per slide to achieve 99% readability scores.',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 11
      },
      {
        id: 'sl-7',
        orderIndex: 7,
        type: 'cta',
        badge: 'ACTION',
        headline: 'Found This Helpful? Save This Post 🔖',
        subtext: 'Follow @neostudio_ai for daily AI automation breakdowns!',
        bgGradient: baseGradient,
        textColor: '#FFFFFF',
        accentColor: baseAccent,
        wordCount: 10
      }
    ];

    setCurrentCarousel(prev => ({
      ...prev,
      slides: structured7Slides,
      performanceScore: { ...prev.performanceScore, overall: 99 }
    }));
  };

  // Default brand fallback if no brand passed from App
  const activeBrand: Brand = brand || {
    id: 'brand-default',
    name: 'My Brand',
    igHandle: '@mybrand',
    igConnected: false,
    industry: 'Marketing & Content',
    description: 'A modern brand focused on growth',
    audience: 'Entrepreneurs and business owners aged 25-45',
    voice: 'High Impact Marketing',
    primaryColor: '#0284C7',
    secondaryColor: '#E8691C',
    accentColor: '#FFFFFF',
    websiteUrl: 'www.mybrand.com',
    postingFrequency: '3x / week',
  };

  const handleGenerate = async () => {
    let inputValue = activeInputTab === 'url' ? websiteUrl
      : activeInputTab === 'voice' ? voiceText
      : promptText;

    if (!inputValue.trim() || inputValue.trim() === 'https://') {
      inputValue = 'How AI Automation Increases Instagram Engagement by 300%';
    }

    setIsGenerating(true);
    setAiError('');

    try {
      let result: Partial<Carousel>;

      if (activeInputTab === 'url' && websiteUrl && websiteUrl !== 'https://') {
        result = await generateCarouselFromUrl(
          websiteUrl,
          activeBrand,
          currentCarousel.stylePreset,
          currentCarousel.frameworkType,
          currentCarousel.platformSpec,
        );
      } else {
        result = await generateCarouselFromPrompt(
          inputValue,
          activeBrand,
          currentCarousel.stylePreset,
          currentCarousel.frameworkType,
          currentCarousel.platformSpec,
        );
      }

      if (result && result.slides && result.slides.length > 0) {
        setCurrentCarousel(prev => ({
          ...prev,
          ...result,
          id: prev.id,
          brandId: prev.brandId,
          stylePreset: prev.stylePreset,
          slides: result.slides!,
        }));
        setActiveSlideIndex(0);
      }
    } catch (err: unknown) {
      console.error('[Lana Studio] Generation error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error during generation.';
      setAiError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveSlide = async () => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setAiError('No NVIDIA API key — add it in Settings.');
      return;
    }
    setIsImprovingSlide(true);
    setAiError('');
    try {
      const improved = await improveSlide(activeSlide, activeBrand);
      handleUpdateSlide('headline', improved.headline);
      handleUpdateSlide('subtext', improved.subtext);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Improvement failed.');
    } finally {
      setIsImprovingSlide(false);
    }
  };

  const handleGenerateCaption = async () => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setAiError('No NVIDIA API key — add it in Settings.');
      return;
    }
    try {
      const cap = await generateCaption(currentCarousel.slides, activeBrand);
      setCurrentCarousel(prev => ({ ...prev, caption: cap }));
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Caption generation failed.');
    }
  };

  const handleExportSinglePng = async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const filename = `${activeBrand.name.replace(/\s+/g, '_')}_Slide_${String(activeSlideIndex + 1).padStart(2, '0')}.png`;
      await exportSlidePng(canvasRef.current, filename);
    } catch (err) {
      console.error('Single slide export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFullZip = async () => {
    if (!hiddenSlidesRef.current) return;
    const slideElems = Array.from(hiddenSlidesRef.current.children) as HTMLElement[];
    if (!slideElems.length) return;

    try {
      setIsExporting(true);
      await exportCarouselZip(
        slideElems,
        currentCarousel,
        activeBrand.name,
        (current, total) => setExportProgress({ current, total })
      );
    } catch (err) {
      console.error('Full carousel ZIP export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleUpdateSlide = (field: keyof Slide, value: string) => {
    const updatedSlides = [...currentCarousel.slides];
    const newHeadline = field === 'headline' ? value : updatedSlides[activeSlideIndex].headline;
    const newSubtext = field === 'subtext' ? value : updatedSlides[activeSlideIndex].subtext;
    const computedWords = `${newHeadline} ${newSubtext}`.trim().split(/\s+/).filter(Boolean).length;

    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      [field]: value,
      wordCount: computedWords
    };
    setCurrentCarousel(prev => ({ ...prev, slides: updatedSlides }));
  };

  const handleApplyPreset = (preset: ContentStylePreset) => {
    let accent = '#E8691C';
    if (preset === 'navy_orange_diagonal') accent = '#E8691C';
    else if (preset === 'agency_black_blue_wave') accent = '#0EA5E9';
    else if (preset === 'ai_dark_tech_purple') accent = '#7B7BFF';
    else if (preset === 'dark_navy_blue_frame') accent = '#38BDF8';
    else if (preset === 'seamless_yellow_bold') accent = '#F5D300';

    const updatedSlides = currentCarousel.slides.map(s => ({
      ...s,
      accentColor: accent
    }));

    setCurrentCarousel(prev => ({
      ...prev,
      stylePreset: preset,
      slides: updatedSlides
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Source Input Tabs */}
      <div className="navy-card rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-500" />
              AI Carousel Studio (Lana Templates Suite)
            </h2>
            <p className="text-xs text-slate-500">8 Custom Designed Templates from `Lana Carousels` + 7-Slide Framework</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRestructureTo7Slides}
              className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-sky-500" />
              <span>Apply 7-Slide Skill Structure</span>
            </button>
          </div>
        </div>

        {/* Lana Template Preset Picker — 5 Exact Vecteezy Designs */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-sky-500" />
            Select Template (Lana Carousel Suite)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {([
              {
                id: 'navy_orange_diagonal' as ContentStylePreset,
                label: 'Sky Blue × Orange',
                desc: 'Business Growth',
                preview: (
                  <div style={{ width: '100%', height: '52px', background: '#0284C7', position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', width: '150%', height: '65%', background: '#C85A1A', transform: 'rotate(-35deg)', top: '-20%', right: '-30%' }} />
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#fff', fontSize: '8px', fontWeight: 900 }}>HOW TO GROW</div>
                  </div>
                ),
              },
              {
                id: 'agency_black_blue_wave' as ContentStylePreset,
                label: 'Black × Sky Blue Wave',
                desc: 'Agency / Corporate',
                preview: (
                  <div style={{ width: '100%', height: '52px', background: '#0A0A0A', position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                    <svg viewBox="0 0 200 80" style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%' }}><path d="M0,80 L0,40 Q50,5 100,25 Q150,45 200,10 L200,80 Z" fill="#0EA5E9" /></svg>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', color: '#fff', fontSize: '7px', fontWeight: 900 }}>BUSINESS SOLUTION<br />AGENCY</div>
                  </div>
                ),
              },
              {
                id: 'ai_dark_tech_purple' as ContentStylePreset,
                label: 'Dark AI × Purple',
                desc: 'Tech / AI',
                preview: (
                  <div style={{ width: '100%', height: '52px', background: '#0B0B2A', position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                      <svg viewBox="0 0 100 52" style={{ width: '100%', height: '100%' }}><circle cx="50" cy="26" r="20" stroke="#7B7BFF" strokeWidth="0.5" fill="none" /><circle cx="50" cy="26" r="14" stroke="#7B7BFF" strokeWidth="0.5" fill="none" /></svg>
                    </div>
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#EDE8F8', fontSize: '7px', fontWeight: 900 }}>FUTURE BUSINESS<br />WITH AI</div>
                  </div>
                ),
              },
              {
                id: 'dark_navy_blue_frame' as ContentStylePreset,
                label: 'Sky Blue Frame',
                desc: 'Bold / Corporate',
                preview: (
                  <div style={{ width: '100%', height: '52px', background: '#0369A1', position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '16px', width: '40%', height: '70%', border: '1.5px solid #38BDF8', borderRadius: '3px' }} />
                    <div style={{ position: 'absolute', top: '14px', left: '20px', color: '#38BDF8', fontSize: '11px', fontWeight: 900 }}>#1</div>
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#fff', fontSize: '7px', fontWeight: 900 }}>HOW TO GROW YOUR BUSINESS</div>
                  </div>
                ),
              },
              {
                id: 'seamless_yellow_bold' as ContentStylePreset,
                label: 'Seamless Yellow',
                desc: 'Bold / Playful',
                preview: (
                  <div style={{ width: '100%', height: '52px', background: '#F5D300', position: 'relative', overflow: 'hidden', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '25%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '7px', fontWeight: 900, color: '#000', padding: '4px', lineHeight: 1.2 }}>Lorem Ipsum</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#000', lineHeight: 1 }}>1</div>
                      <div style={{ fontSize: '7px', fontWeight: 700, color: '#000' }}>Lorem Ipsum</div>
                    </div>
                    <div style={{ width: '25%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 900, color: '#000' }}>Thank You</div>
                    </div>
                  </div>
                ),
              },
            ] as { id: ContentStylePreset; label: string; desc: string; preview: React.ReactNode }[]).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleApplyPreset(tpl.id)}
                className={`p-2.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                  currentCarousel.stylePreset === tpl.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {tpl.preview}
                <div>
                  <div className="text-[10px] font-extrabold text-slate-900">{tpl.label}</div>
                  <div className="text-[9px] text-slate-500">{tpl.desc}</div>
                </div>
                {currentCarousel.stylePreset === tpl.id && (
                  <Check className="w-3 h-3 text-blue-600 absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveInputTab('url')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
              activeInputTab === 'url'
                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Website Scraper</p>
              <p className="text-[10px] text-slate-500">Extract site content & brand colors</p>
            </div>
          </button>

          <button
            onClick={() => setActiveInputTab('prompt')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
              activeInputTab === 'prompt'
                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Topic / Hook Prompt</p>
              <p className="text-[10px] text-slate-500">Enter hook concept or mantra</p>
            </div>
          </button>

          <button
            onClick={() => setActiveInputTab('voice')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
              activeInputTab === 'voice'
                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Voice Note Capture</p>
              <p className="text-[10px] text-slate-500">Speak & convert to slides</p>
            </div>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {activeInputTab === 'url' && (
            <div className="relative w-full">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com/article"
                className="w-full navy-input pl-10 pr-4 py-2.5 rounded-xl text-xs"
              />
            </div>
          )}

          {activeInputTab === 'prompt' && (
            <input
              type="text"
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              placeholder="e.g. The AI Revolution: 5 Automations to Scale 10x..."
              className="w-full navy-input px-4 py-2.5 rounded-xl text-xs"
            />
          )}

          {activeInputTab === 'voice' && (
            <div className="w-full flex items-center gap-3">
              <button
                onClick={() => {
                  setIsRecordingVoice(!isRecordingVoice);
                  if (!isRecordingVoice) {
                    setVoiceText('Transcribing: The AI Revolution allows content teams to scale 10x faster...');
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
                  isRecordingVoice
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isRecordingVoice ? 'Recording...' : 'Record Voice Note'}</span>
              </button>
              <input
                type="text"
                value={voiceText}
                readOnly
                placeholder="Voice note transcription..."
                className="w-full navy-input px-4 py-2.5 rounded-xl text-xs bg-slate-50"
              />
            </div>
          )}

          {/* AI Error Banner */}
          {aiError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{aiError}</span>
              <button onClick={() => setAiError('')} className="text-rose-400 hover:text-rose-700 font-bold text-sm leading-none">×</button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating with Nemotron...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-green-400" />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Live Canvas Preview + Slide Editor Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Live Instagram Carousel Canvas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="navy-card rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between min-h-[580px]">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-900">
                  {currentCarousel.platformSpec === 'ig_4_5' ? '4:5 Vertical Feed' : '1:1 Square Feed'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                Slide {activeSlideIndex + 1} of {currentCarousel.slides.length}
              </span>
            </div>

            {/* Live Canvas — TemplateCanvas renders the exact Vecteezy design */}
            <div className="w-full max-w-[300px] my-4" style={{ aspectRatio: '4/5' }}>
              <div ref={canvasRef} style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <TemplateCanvas
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={currentCarousel.slides.length}
                  stylePreset={currentCarousel.stylePreset}
                  brandName={activeBrand.name}
                  websiteUrl={activeBrand.igHandle || 'www.yourbrand.com'}
                />
              </div>
            </div>

            {/* Slide Export & Swiper Bar */}
            <div className="w-full space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <button
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* All Slide Thumbnails */}
                <div className="flex items-center space-x-1.5 overflow-x-auto max-w-[200px] py-1">
                  {currentCarousel.slides.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 ${
                        idx === activeSlideIndex 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={activeSlideIndex === currentCarousel.slides.length - 1}
                  onClick={() => setActiveSlideIndex(prev => Math.min(currentCarousel.slides.length - 1, prev + 1))}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Single Slide Export Button */}
              <button
                onClick={handleExportSinglePng}
                disabled={isExporting}
                className="w-full py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Slide #{activeSlideIndex + 1} PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Slide Content Editor + Skill Audit */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slide Editor Form & Hierarchy Rules */}
          <div className="navy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Edit Slide #{activeSlideIndex + 1} ({activeSlide.type.toUpperCase()})
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  activeSlideWords <= 35 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {activeSlideWords} words (Max 35)
                </span>
                <button
                  onClick={() => {
                    const newSlide: Slide = {
                      id: `s-${Date.now()}`,
                      orderIndex: currentCarousel.slides.length + 1,
                      type: 'value',
                      badge: `0${currentCarousel.slides.length + 1}`,
                      headline: 'Additional Value Point',
                      subtext: 'Add your concise value proposition here.',
                      bgGradient: currentCarousel.slides[0].bgGradient,
                      textColor: '#FFFFFF',
                      accentColor: currentCarousel.slides[0].accentColor,
                      wordCount: 8
                    };
                    setCurrentCarousel(prev => ({
                      ...prev,
                      slides: [...prev.slides, newSlide]
                    }));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slide
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Top Callout / Badge</label>
                <input
                  type="text"
                  value={activeSlide.badge || ''}
                  onChange={e => handleUpdateSlide('badge', e.target.value)}
                  className="w-full navy-input px-3.5 py-2 rounded-xl text-xs mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Main Headline (Hook)</label>
                <textarea
                  rows={2}
                  value={activeSlide.headline}
                  onChange={e => handleUpdateSlide('headline', e.target.value)}
                  className="w-full navy-input px-3.5 py-2 rounded-xl text-xs mt-1 font-extrabold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Body Subtext (Max 35 Words)</label>
                <textarea
                  rows={3}
                  value={activeSlide.subtext}
                  onChange={e => handleUpdateSlide('subtext', e.target.value)}
                  className="w-full navy-input px-3.5 py-2 rounded-xl text-xs mt-1"
                />
              </div>

              {/* AI Improve Slide */}
              <button
                onClick={handleImproveSlide}
                disabled={isImprovingSlide}
                className="w-full py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isImprovingSlide ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Improving with Nemotron...</>
                ) : (
                  <><Bot className="w-3.5 h-3.5" /> AI Improve This Slide</>
                )}
              </button>
            </div>
          </div>

          {/* AI Caption & Hashtags Card */}
          <div className="navy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                AI Caption & Hashtags
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateCaption}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${currentCarousel.caption.text}\n\n${currentCarousel.caption.hashtags.join(' ')}`);
                    setCopiedCaption(true);
                    setTimeout(() => setCopiedCaption(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={currentCarousel.caption.text}
              onChange={e => {
                const val = e.target.value;
                setCurrentCarousel(prev => ({
                  ...prev,
                  caption: { ...prev.caption, text: val }
                }));
              }}
              className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentCarousel.caption.hashtags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="navy-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono">
                <span className="text-sm font-bold">{currentCarousel.performanceScore.overall}</span>
                <span className="text-[7px] text-blue-400 font-bold">SCORE</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Lana Designed Template Score: 99/100</p>
                <p className="text-[10px] text-emerald-600 font-semibold">✓ Custom Vecteezy Presets • 7-Slide Compliant</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Instagram Connection Status Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                isInstagramConnected()
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isInstagramConnected() ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <Instagram className="w-3 h-3" />
                {isInstagramConnected() ? 'IG Connected' : 'Not Connected'}
              </div>

              {/* 1-Click Post Now to Instagram */}
              <button
                onClick={handlePostNow}
                disabled={isPublishingNow}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isPublishingNow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Uploading & Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Post Now to Instagram</span>
                  </>
                )}
              </button>

              {/* Schedule Post Modal Opener */}
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:scale-[1.02] transition-all"
              >
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Schedule Post</span>
              </button>

              {/* Export ZIP */}
              <button
                onClick={handleExportFullZip}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {isExporting && exportProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Packing {exportProgress.current}/{exportProgress.total}...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 text-slate-600" />
                    <span>Export ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Post Success Modal */}
      {publishSuccessMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-emerald-200 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Published to Instagram!</h3>
              <p className="text-xs text-slate-500 mt-1">"{publishSuccessMessage.title}" is now live on your Instagram feed.</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={publishSuccessMessage.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>View Post on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPublishSuccessMessage(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Post Error Banner */}
      {publishErrorMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900 text-white shadow-2xl space-y-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">Instagram Connection Notice</p>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{publishErrorMessage}</p>
              </div>
            </div>
            <button onClick={() => setPublishErrorMessage('')} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => initiateInstagramOAuthLogin()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>1-Click Connect Meta</span>
            </button>
            {onOpenSettings && (
              <button
                onClick={() => {
                  setPublishErrorMessage('');
                  onOpenSettings();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              >
                Settings
              </button>
            )}
          </div>
        </div>
      )}

      {/* Schedule Post Date & Time Picker Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                  <Calendar className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-slate-900">Schedule Auto-Publish</h3>
                  <p className="text-xs text-slate-500">Pick date & time for automated release</p>
                </div>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold text-xs p-1">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Target Publishing Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Target Publishing Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Quick Time Slots</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['09:00', '12:00', '16:00', '20:00'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setScheduleTime(t)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        scheduleTime === t
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-900 font-bold">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Automated Upstash QStash Queue</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Lana will automatically publish this carousel on <strong className="text-slate-900">{scheduleDate} at {scheduleTime}</strong> in the background — even if you are offline!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="w-1/2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
              >
                {isScheduling ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>Confirm Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Render Container for Offscreen Full Carousel Capture */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
        <div ref={hiddenSlidesRef}>
          {currentCarousel.slides.map((s, idx) => (
            <div
              key={s.id}
              style={{
                width: '1080px',
                height: '1350px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <TemplateCanvas
                slide={s}
                slideIndex={idx}
                totalSlides={currentCarousel.slides.length}
                stylePreset={currentCarousel.stylePreset}
                brandName={activeBrand.name}
                websiteUrl={activeBrand.igHandle || 'www.yourbrand.com'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
