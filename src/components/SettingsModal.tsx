import React, { useState } from 'react';
import { Settings, Instagram, ShieldCheck, CheckCircle2, AlertCircle, Key, ExternalLink, RefreshCw, Loader2, Eye, EyeOff, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Brand } from '../types/lana';
import {
  initiateInstagramOAuthLogin,
  getStoredInstagramCredentials,
  saveInstagramCredentials,
  fetchLinkedInstagramAccountInfo,
  verifyInstagramCredentials,
  clearInstagramCredentials,
  DetectedInstagramAccount,
} from '../services/instagramService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  whiteLabelMode: boolean;
  onToggleWhiteLabel: () => void;
  onUpdateBrand?: (brand: Brand) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, brand, whiteLabelMode, onToggleWhiteLabel, onUpdateBrand
}) => {
  const creds = getStoredInstagramCredentials();
  const [manualToken, setManualToken] = useState(creds.accessToken || '');
  const [manualAccountId, setManualAccountId] = useState(creds.accountId || '');
  const [handleInput, setHandleInput] = useState(brand.igHandle || '@lana.carousel');
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [savedHandle, setSavedHandle] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(false);

  const [detecting, setDetecting] = useState(false);
  const [detectResult, setDetectResult] = useState<{ id?: string; username?: string; accounts?: DetectedInstagramAccount[]; error?: string } | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; profile?: { username?: string; name?: string }; error?: string } | null>(null);

  const [storedUsername] = useState<string>(() => {
    return localStorage.getItem('lana_ig_detected_username') || '';
  });

  if (!isOpen) return null;

  const hasToken = Boolean(manualToken.trim() || creds.accessToken);
  const hasAccountId = Boolean(manualAccountId.trim() || creds.accountId);

  const handleSaveHandle = () => {
    const formatted = handleInput.startsWith('@') ? handleInput.trim() : `@${handleInput.trim()}`;
    localStorage.setItem('lana_ig_custom_handle', formatted);
    if (onUpdateBrand) {
      onUpdateBrand({
        ...brand,
        igHandle: formatted,
      });
    }
    setSavedHandle(true);
    setTimeout(() => setSavedHandle(false), 2000);
  };

  const handleSaveCredentials = () => {
    saveInstagramCredentials({
      accessToken: manualToken.trim(),
      accountId: manualAccountId.trim(),
    });

    if (onUpdateBrand) {
      onUpdateBrand({
        ...brand,
        igConnected: Boolean(manualToken.trim() && manualAccountId.trim()),
        igToken: manualToken.trim(),
        igAccountId: manualAccountId.trim(),
      });
    }

    setSavedCredentials(true);
    setTimeout(() => setSavedCredentials(false), 2500);
  };

  const handleAutoDetect = async () => {
    const tokenToUse = manualToken.trim() || creds.accessToken;
    if (!tokenToUse) {
      setDetectResult({ error: 'Please connect with Meta first or paste an Access Token below.' });
      return;
    }

    setDetecting(true);
    setDetectResult(null);
    setVerifyResult(null);

    try {
      const info = await fetchLinkedInstagramAccountInfo(tokenToUse);
      if (info.accountId) {
        setDetectResult({
          id: info.accountId,
          username: info.username,
          accounts: info.accounts,
        });
        setManualAccountId(info.accountId);
        if (info.username && !brand.igHandle) {
          setHandleInput(`@${info.username.replace('@', '')}`);
        }

        saveInstagramCredentials({ accountId: info.accountId });
        if (info.username) {
          localStorage.setItem('lana_ig_detected_username', info.username);
        }
        setSavedCredentials(true);
        setTimeout(() => setSavedCredentials(false), 3000);
      } else {
        setDetectResult({
          error: info.error || 'No Instagram Business Account linked to your Meta login was found.',
          accounts: info.accounts,
        });
      }
    } catch {
      setDetectResult({ error: 'Network error during account detection.' });
    } finally {
      setDetecting(false);
    }
  };

  const handleSelectAccount = (acc: DetectedInstagramAccount) => {
    setManualAccountId(acc.id);
    setHandleInput(`@${acc.username.replace('@', '')}`);
    saveInstagramCredentials({ accountId: acc.id });
    localStorage.setItem('lana_ig_detected_username', acc.username);

    if (onUpdateBrand) {
      onUpdateBrand({
        ...brand,
        igHandle: `@${acc.username.replace('@', '')}`,
        igAccountName: acc.name || acc.username,
        igConnected: true,
        igAccountId: acc.id,
      });
    }

    setSavedCredentials(true);
    setTimeout(() => setSavedCredentials(false), 2500);
  };

  const handleTestVerify = async () => {
    const tokenToUse = manualToken.trim() || creds.accessToken;
    const idToUse = manualAccountId.trim() || creds.accountId;

    if (!tokenToUse || !idToUse) {
      setVerifyResult({ success: false, error: 'Both Access Token and Instagram Account ID are required to verify.' });
      return;
    }

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await verifyInstagramCredentials(tokenToUse, idToUse);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ success: false, error: 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = () => {
    clearInstagramCredentials();
    setManualToken('');
    setManualAccountId('');
    setDetectResult(null);
    setVerifyResult(null);
    if (onUpdateBrand) {
      onUpdateBrand({
        ...brand,
        igConnected: false,
        igToken: '',
        igAccountId: '',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">Instagram &amp; App Settings</h3>
              <p className="text-xs text-slate-500">Live posting connection &amp; agency branding</p>
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
                  {hasToken && hasAccountId
                    ? `Connected to ${storedUsername ? `@${storedUsername}` : brand.igHandle || 'Instagram'}`
                    : 'Connect your Instagram Business account'}
                </p>
              </div>
            </div>
            {/* Status pill */}
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

          {/* 1-Click Meta Login Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => initiateInstagramOAuthLogin()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>{hasToken ? 'Reconnect Meta Account' : '1-Click Connect Meta Account'}</span>
            </button>
            {hasToken && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all"
                title="Disconnect Instagram"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Auto-detect button & Multi-account selector */}
          {hasToken && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Account Detection</span>
                {savedCredentials && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Credentials Saved!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={detecting}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {detecting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting from Meta API...</>
                ) : (
                  <><RefreshCw className="w-3.5 h-3.5" /> Auto-Detect Instagram Business Account</>
                )}
              </button>

              {/* Detected accounts list */}
              {detectResult?.accounts && detectResult.accounts.length > 0 && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">Select Detected Instagram Account:</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {detectResult.accounts.map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectAccount(acc)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all text-xs ${
                          manualAccountId === acc.id
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                            IG
                          </div>
                          <div>
                            <p className="text-xs font-semibold">@{acc.username}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {acc.id}</p>
                          </div>
                        </div>
                        {manualAccountId === acc.id ? (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-sky-600 font-bold">Use This</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error message during detection */}
              {detectResult?.error && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">{detectResult.error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuide(prev => !prev)}
                    className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to fix: Connect Instagram to a Facebook Page (3 Steps)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Meta Setup Guide */}
          {showGuide && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs space-y-2.5 text-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-sky-950 text-xs">
                <span>3 Quick Steps to Link Instagram to Meta</span>
                <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
                <li><strong>Instagram App:</strong> Go to Settings → Account type and tools → Switch to <strong>Professional / Creator Account</strong>.</li>
                <li><strong>Facebook:</strong> Go to your Facebook Page → <strong>Settings → Linked Accounts → Instagram</strong> → Click <strong>Connect Account</strong>.</li>
                <li><strong>Back in Lana:</strong> Click <strong>"1-Click Connect Meta Account"</strong> or <strong>"Auto-Detect"</strong> above.</li>
              </ol>
            </div>
          )}

          {/* Manual Input Fields (Token + Account ID + Handle) */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60">
            {/* Instagram Handle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Instagram Handle
                </label>
                {savedHandle && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Handle Saved!
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value)}
                  placeholder="@lana.carousel"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveHandle}
                  disabled={!handleInput.trim() || handleInput === brand.igHandle}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Instagram Business Account ID */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Instagram Business Account ID
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={manualAccountId}
                  onChange={e => setManualAccountId(e.target.value)}
                  placeholder="e.g. 17841400008460056 (17-digit numeric ID)"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white font-mono"
                />
              </div>
            </div>

            {/* Instagram Access Token */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                User / Page Access Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  placeholder="EAA... (filled automatically via OAuth or paste custom token)"
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Save & Test Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={!manualToken && !manualAccountId}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all disabled:opacity-40"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={handleTestVerify}
                disabled={verifying || (!manualToken && !creds.accessToken)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Test Live Connection</span>
              </button>
            </div>

            {/* Verify result banner */}
            {verifyResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                verifyResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}>
                {verifyResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Live Meta Connection Verified!</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Ready to publish carousels directly to Instagram feed.
                        {verifyResult.profile?.username && ` Profile: @${verifyResult.profile.username}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Connection Verification Failed</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">{verifyResult.error}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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
