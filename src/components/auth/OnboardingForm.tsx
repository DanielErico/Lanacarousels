import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, ArrowLeft, Building2, Instagram,
  Target, Megaphone, CheckCircle2, Loader2, Globe,
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingData {
  brandName: string;
  websiteUrl: string;
  industry: string;
  description: string;
  audience: string;
  voice: string;
  igHandle: string;
  postingFrequency: string;
}

const INDUSTRIES = [
  'Creative & Digital Agency', 'E-commerce & Retail', 'Coaching & Consulting',
  'B2B SaaS / Tech', 'Health & Wellness', 'Finance & Investing',
  'Real Estate', 'Fashion & Beauty', 'Food & Lifestyle', 'Education & Courses',
  'Legal & Professional Services', 'Other',
];

const VOICES = [
  { id: 'High Impact Marketing', label: 'High Impact', desc: 'Bold, direct, results-driven' },
  { id: 'Creative & Edgy', label: 'Creative & Edgy', desc: 'Unconventional, trend-aware' },
  { id: 'Professional & Executive', label: 'Professional', desc: 'Polished, authority-driven' },
  { id: 'Playful & Bold', label: 'Playful & Bold', desc: 'Fun, energetic, relatable' },
];

const FREQUENCIES = ['1x / day', '5x / week', '3x / week', '1x / week'];

const STEPS = [
  { id: 1, title: 'Your Brand', icon: Building2 },
  { id: 2, title: 'Your Audience', icon: Target },
  { id: 3, title: 'Brand Voice', icon: Megaphone },
  { id: 4, title: 'Instagram', icon: Instagram },
];

interface OnboardingFormProps {
  onComplete?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<OnboardingData>({
    brandName: '',
    websiteUrl: '',
    industry: '',
    description: '',
    audience: '',
    voice: 'High Impact Marketing',
    igHandle: '',
    postingFrequency: '3x / week',
  });

  const update = (field: keyof OnboardingData, value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 1) return data.brandName.trim().length > 0 && data.industry.length > 0;
    if (step === 2) return data.audience.trim().length > 0;
    if (step === 3) return data.voice.length > 0;
    return true;
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // 1. Create brand in DB
      const { error: brandErr } = await supabase.from('brands').insert({
        user_id: user.id,
        name: data.brandName,
        website_url: data.websiteUrl || null,
        industry: data.industry,
        description: data.description || null,
        audience: data.audience,
        voice: data.voice,
        ig_handle: data.igHandle ? `@${data.igHandle.replace('@', '')}` : null,
        posting_frequency: data.postingFrequency,
        is_primary: true,
      });
      if (brandErr) throw new Error(brandErr.message);

      // 2. Mark onboarding complete
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true, full_name: user.email?.split('@')[0] || '' })
        .eq('id', user.id);
      if (profileErr) throw new Error(profileErr.message);

      await refreshProfile();
      if (onComplete) onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[520px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div style={{
            width: '42px', height: '42px', borderRadius: '13px',
            background: 'linear-gradient(135deg, #E8691C, #C85A1A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">Lana</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">IG Carousels</div>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center justify-between mb-10 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: done ? '#10B981' : active ? '#0284C7' : '#E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: active ? '0 0 0 4px rgba(2,132,199,0.15)' : 'none',
                  }}>
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : <Icon className="w-4 h-4" style={{ color: active ? '#fff' : '#94A3B8' }} />
                    }
                  </div>
                  <span className={`text-[10px] font-bold ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: '2px', marginBottom: '18px',
                    background: done ? '#10B981' : '#E2E8F0',
                    transition: 'background 0.3s ease',
                    marginLeft: '8px', marginRight: '8px',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">

          {/* ── Step 1: Brand ──────────────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tell us about your brand</h2>
                <p className="text-sm text-slate-500 mt-1">This powers your AI-generated carousel content</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand Name *</label>
                  <input
                    type="text" value={data.brandName}
                    onChange={e => update('brandName', e.target.value)}
                    placeholder="NeoStudio Agency"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url" value={data.websiteUrl}
                      onChange={e => update('websiteUrl', e.target.value)}
                      placeholder="https://yourbrand.com"
                      className={inputClass + ' pl-10'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Industry *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind} type="button"
                        onClick={() => update('industry', ind)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          data.industry === ind
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand Description <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                  <textarea
                    rows={2} value={data.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="A 1-2 sentence description of what your brand does..."
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Audience ──────────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Who are you speaking to?</h2>
                <p className="text-sm text-slate-500 mt-1">Nemotron uses this to tailor every slide's copy</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Audience *</label>
                  <textarea
                    rows={3} value={data.audience}
                    onChange={e => update('audience', e.target.value)}
                    placeholder="e.g. Founders and CMOs at D2C brands, aged 28-45, who want to grow their Instagram presence without an agency..."
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Be specific — the more detail, the better your AI-generated content</p>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Voice ─────────────────────────────── */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">What's your brand voice?</h2>
                <p className="text-sm text-slate-500 mt-1">Sets the tone for all AI-generated copy</p>
              </div>

              <div className="space-y-3">
                {VOICES.map(v => (
                  <button
                    key={v.id} type="button"
                    onClick={() => update('voice', v.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      data.voice === v.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-sm font-bold ${data.voice === v.id ? 'text-white' : 'text-slate-900'}`}>{v.label}</div>
                    <div className={`text-xs mt-0.5 ${data.voice === v.id ? 'text-white/60' : 'text-slate-500'}`}>{v.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: Instagram ─────────────────────────── */}
          {step === 4 && (
            <>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Instagram</h2>
                <p className="text-sm text-slate-500 mt-1">Used for canvas previews and scheduling</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                    <input
                      type="text" value={data.igHandle}
                      onChange={e => update('igHandle', e.target.value.replace('@', ''))}
                      placeholder="yourbrand"
                      className={inputClass + ' pl-8'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Posting Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FREQUENCIES.map(f => (
                      <button
                        key={f} type="button"
                        onClick={() => update('postingFrequency', f)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                          data.postingFrequency === f
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Setup</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <span className="text-slate-500">Brand</span>
                    <span className="font-bold text-slate-900 truncate">{data.brandName}</span>
                    <span className="text-slate-500">Industry</span>
                    <span className="font-bold text-slate-900 truncate">{data.industry}</span>
                    <span className="text-slate-500">Voice</span>
                    <span className="font-bold text-slate-900">{data.voice}</span>
                    <span className="text-slate-500">Frequency</span>
                    <span className="font-bold text-slate-900">{data.postingFrequency}</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: '#0F1A2E', color: '#fff' }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleComplete}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)', color: '#fff' }}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up Lana...</>
                  : <><Sparkles className="w-4 h-4" /> Launch Lana</>
                }
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          You can update all of this later in Brand Settings
        </p>
      </div>
    </div>
  );
};
