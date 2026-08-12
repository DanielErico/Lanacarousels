import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

type AuthMode = 'signin' | 'signup';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
      const { error: err } = await signUp(email, password, fullName);
      if (err) setError(err);
      else setSuccess('Account created! Check your email to confirm, then sign in.');
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.includes('Invalid') ? 'Incorrect email or password.' : err);
    }

    setLoading(false);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAFC]">
      {/* ── Left Panel: Branding ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-[#0369A1] relative overflow-hidden">
        {/* Background geometric elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large diagonal orange band */}
          <div style={{
            position: 'absolute', width: '200%', height: '55%',
            background: 'linear-gradient(135deg, #C85A1A 0%, #E8691C 50%, #F59E0B 100%)',
            transform: 'rotate(-35deg)', top: '-10%', right: '-60%',
            opacity: 0.12,
          }} />
          {/* Grid dots */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          {/* Glowing accent */}
          <div style={{
            position: 'absolute', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,105,28,0.15) 0%, transparent 70%)',
            bottom: '-80px', left: '-60px',
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #E8691C, #C85A1A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Lana</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>IG Carousels</div>
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10 space-y-6">
          <h1 style={{
            fontSize: '42px', fontWeight: 900, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-1px',
          }}>
            Create carousels<br />
            <span style={{ color: '#E8691C' }}>that actually</span><br />
            get saved.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '380px' }}>
            AI-powered Instagram carousel studio with your exact brand templates, Nemotron generation, and smart copy that converts.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['5 Premium Templates', 'NVIDIA Nemotron AI', '7-Slide Framework', 'Brand-Aware Copy'].map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 600,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <div className="flex -space-x-2">
              {['#E8691C', '#0EA5E9', '#7B7BFF', '#10B981'].map((c, i) => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: c, border: '2px solid #0369A1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#fff',
                }}>
                  {['D', 'J', 'A', 'R'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Trusted by creators</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Building their audience with Lana</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #E8691C, #C85A1A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#0284C7', letterSpacing: '-0.5px' }}>Lana</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-8">
            {(['signin', 'signup'] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Welcome back 👋' : 'Start creating today'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to your Lana account'
                : 'Free forever for 1 brand · No credit card needed'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Danny Smith"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourbrand.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60 shadow-md shadow-sky-500/20"
              style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)', color: '#fff' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Guest / Direct Access Fallback */}
            <div className="pt-3 text-center border-t border-slate-100 mt-4 space-y-2">
              <button
                type="button"
                onClick={continueAsGuest}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Enter Studio without Sign-In</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {mode === 'signin' && (
              <p className="text-center text-xs text-slate-500 pt-1">
                Forgot your password?{' '}
                <button
                  type="button"
                  className="text-sky-600 font-semibold hover:underline"
                  onClick={async () => {
                    if (!email) { setError('Enter your email first.'); return; }
                    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                    setSuccess('Password reset email sent!');
                  }}
                >
                  Reset it
                </button>
              </p>
            )}
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            By signing {mode === 'signup' ? 'up' : 'in'} you agree to our{' '}
            <span className="text-slate-600 font-semibold">Terms of Service</span> &{' '}
            <span className="text-slate-600 font-semibold">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
