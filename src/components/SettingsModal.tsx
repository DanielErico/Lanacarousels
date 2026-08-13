import React, { useState } from 'react';
import { Settings, Instagram, ShieldCheck, CheckCircle2, AlertCircle, Key, ExternalLink } from 'lucide-react';
import { Brand } from '../types/lana';
import { initiateInstagramOAuthLogin, getStoredInstagramCredentials, saveInstagramCredentials } from '../services/instagramService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  whiteLabelMode: boolean;
  onToggleWhiteLabel: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, brand, whiteLabelMode, onToggleWhiteLabel,
}) => {
  const creds = getStoredInstagramCredentials();
  const [manualAccountId, setManualAccountId] = useState(creds.accountId || '');
  const [savedAccountId, setSavedAccountId] = useState(false);

  if (!isOpen) return null;

  const hasToken = Boolean(creds.accessToken);
  const hasAccountId = Boolean(creds.accountId || manualAccountId);

  const handleSaveAccountId = () => {
    if (manualAccountId.trim()) {
      saveInstagramCredentials({ accountId: manualAccountId.trim() });
      setSavedAccountId(true);
      setTimeout(() => setSavedAccountId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">Application Settings</h3>
              <p className="text-xs text-slate-500">Instagram connection &amp; agency white-label</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-900 text-xs font-bold p-1 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* ── Instagram Connection Card ── */}
        <div className="rounded-2xl p-5 space-y-4 border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-pink-500/20">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Instagram Account Connection</p>
                <p className="text-xs text-slate-500">
                  {brand.igConnected ? `Connected to ${brand.igHandle || '@brand'}` : 'Connect your Instagram Business account'}
                </p>
              </div>
            </div>
            {/* Status pill: full ready / token only / not connected */}
            {hasToken && hasAccountId ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready to Post
              </span>
            ) : hasToken ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Account ID Needed
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                Not Connected
              </span>
            )}
          </div>

          {/* Connect / Reconnect button */}
          <button
            type="button"
            onClick={() => initiateInstagramOAuthLogin()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Instagram className="w-4 h-4 text-white" />
            <span>{brand.igConnected ? 'Reconnect Instagram Account' : 'Connect Instagram Account'}</span>
          </button>

          {/* Manual Account ID fallback (shown when token exists but no accountId) */}
          {hasToken && !creds.accountId && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold">
                <AlertCircle className="w-3 h-3" />
                Instagram Business Account ID not auto-detected. Enter it manually:
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={manualAccountId}
                    onChange={e => setManualAccountId(e.target.value)}
                    placeholder="e.g. 17841400008460056"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white"
                  />
                </div>
                <button
                  onClick={handleSaveAccountId}
                  disabled={!manualAccountId.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  {savedAccountId ? '✓ Saved' : 'Save ID'}
                </button>
              </div>
              <a
                href="https://www.facebook.com/help/instagram/570895513091790"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                How to find your Instagram Account ID
              </a>
            </div>
          )}
        </div>

        {/* ── White-Label Mode Card ── */}
        <div className="navy-card rounded-2xl p-5 flex items-center justify-between border border-slate-200 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <p className="text-xs font-bold text-slate-900">White-Label Agency Branding</p>
            </div>
            <p className="text-[10px] text-slate-500">
              Hide Lana branding on client portals and digest emails.
            </p>
          </div>
          <button
            onClick={onToggleWhiteLabel}
            className={`w-12 h-6 rounded-full transition-all relative p-1 ${
              whiteLabelMode ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
              whiteLabelMode ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
