import React, { useState } from 'react';
import { BookOpen, Globe, Palette, Instagram, RefreshCw, Check, Save } from 'lucide-react';
import { Brand } from '../types/lana';
import { initiateInstagramOAuthLogin } from '../services/instagramService';

interface BrandKnowledgeHubProps {
  brand: Brand;
  onUpdateBrand: (brand: Brand) => void;
}

export const BrandKnowledgeHub: React.FC<BrandKnowledgeHubProps> = ({ brand, onUpdateBrand }) => {
  const [formData, setFormData] = useState<Brand>(brand);
  const [isScraping, setIsScraping] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleScrapeWebsite = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      setFormData(prev => ({
        ...prev,
        description: 'Automated Instagram carousel content workflow for agencies and B2B founders.',
        voice: 'Professional & Executive'
      }));
    }, 1500);
  };

  const handleSave = () => {
    onUpdateBrand(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="navy-card rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-slate-900">Brand Knowledge Hub</h2>
              <p className="text-xs text-slate-500">Configure website analysis, brand colors, voice, and IG connection</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved Brand Config!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Website Scraper + Brand Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Website Analyzer & Voice */}
        <div className="navy-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Website Analysis & Brand Context
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Website URL</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs"
                />
                <button
                  onClick={handleScrapeWebsite}
                  disabled={isScraping}
                  className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shrink-0 flex items-center space-x-1.5 hover:bg-blue-100 transition-all"
                >
                  {isScraping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{isScraping ? 'Scraping...' : 'Sync Site'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Brand Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Brand Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Extracted Value Proposition</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full navy-input px-3.5 py-2 rounded-xl text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Tone of Voice Selector</label>
              <select
                value={formData.voice}
                onChange={e => setFormData({ ...formData, voice: e.target.value as any })}
                className="w-full navy-input px-3.5 py-2.5 rounded-xl text-xs mt-1 bg-white"
              >
                <option value="Professional & Executive">Professional & Executive</option>
                <option value="Authoritative & Data-Driven">Authoritative & Data-Driven</option>
                <option value="Clean & Minimalist">Clean & Minimalist</option>
                <option value="Conversational & Direct">Conversational & Direct</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Brand Colors & IG Integration Link */}
        <div className="space-y-6">
          {/* Brand Palette */}
          <div className="navy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                Brand Color Palette
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Primary</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{formData.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Secondary</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{formData.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Accent</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{formData.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram Account Linker Card */}
          <div className="navy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-purple-600" />
                Instagram Account
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                formData.igConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {formData.igConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Instagram Handle</label>
                <input
                  type="text"
                  value={formData.igHandle}
                  onChange={e => setFormData({ ...formData, igHandle: e.target.value })}
                  placeholder="@yourhandle"
                  className="w-full navy-input px-3.5 py-2 rounded-xl text-xs mt-1 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => initiateInstagramOAuthLogin()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/20"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>{formData.igConnected ? 'Reconnect Instagram Account' : 'Connect Instagram Account'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
