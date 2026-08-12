import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  Instagram, 
  Check, 
  ShieldCheck,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Brand } from '../types/lana';

interface HeaderProps {
  brands: Brand[];
  activeBrand: Brand;
  onSelectBrand: (brand: Brand) => void;
  onOpenCreate: () => void;
  onOpenSettings: () => void;
  whiteLabelMode: boolean;
  onToggleWhiteLabel: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  brands,
  activeBrand,
  onSelectBrand,
  onOpenCreate,
  onOpenSettings,
  whiteLabelMode,
  onToggleWhiteLabel,
  onSignOut,
  userEmail,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left: Logo & Brand Workspace Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-sky-100" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-headline text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              {whiteLabelMode ? 'AgencyStudio' : 'Lana'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-sans font-bold">
                PRO v2.0
              </span>
            </h1>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Multi-Brand Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs font-semibold text-slate-800"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: activeBrand.primaryColor }}
            />
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="max-w-[140px] truncate">{activeBrand.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl p-2 z-50 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              <div className="space-y-1">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBrand(b);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      b.id === activeBrand.id 
                        ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.primaryColor }} />
                      <span className="truncate">{b.name}</span>
                    </div>
                    {b.id === activeBrand.id && <Check className="w-3.5 h-3.5 text-sky-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: IG Status, White-Label Mode, Notifications, CTA */}
      <div className="flex items-center space-x-3">
        {/* Instagram Account Link Status */}
        <button 
          onClick={onOpenSettings}
          className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            activeBrand.igConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-emerald-600" />
          <span>{activeBrand.igConnected ? activeBrand.igHandle : 'Connect IG'}</span>
          {activeBrand.igConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
        </button>

        {/* White-Label Toggle */}
        <button
          onClick={onToggleWhiteLabel}
          title="Toggle White-Label Agency Branding"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
            whiteLabelMode 
              ? 'bg-sky-50 border-sky-200 text-sky-700' 
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden sm:inline">{whiteLabelMode ? 'Agency Mode' : 'White-Label'}</span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl p-4 z-50 shadow-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900">Activity Notifications</span>
                <span className="text-[10px] text-sky-500 font-mono font-bold">2 NEW</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                  <p className="text-slate-900 font-semibold">Carousel Auto-Published</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">"3 Mistakes Killing..." published to IG.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-900 font-semibold">Scheduled Post Pending</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">"5 Executive AI Strategies" scheduled for Aug 4.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out Dropdown */}
        {onSignOut && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center space-x-1.5 transition-all text-xs font-bold"
              title="Account Menu"
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline max-w-[120px] truncate">{userEmail?.split('@')[0] || 'Account'}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl p-2 z-50 shadow-xl border border-slate-200 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900 truncate">{userEmail || 'Logged In User'}</p>
                  <p className="text-[10px] text-emerald-600 font-mono font-bold">● SUPABASE AUTH ACTIVE</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-medium text-slate-700 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>API Settings</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 font-bold text-rose-700 flex items-center space-x-2 transition-all mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* New Carousel Primary Action */}
        <button
          onClick={onOpenCreate}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Carousel</span>
        </button>
      </div>
    </header>
  );
};
