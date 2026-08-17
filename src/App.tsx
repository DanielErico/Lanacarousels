import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CarouselStudio } from './components/CarouselStudio';
import { BatchGenerator } from './components/BatchGenerator';
import { ContentCalendar } from './components/ContentCalendar';
import { ContentLibrary } from './components/ContentLibrary';
import { BrandKnowledgeHub } from './components/BrandKnowledgeHub';
import { SettingsModal } from './components/SettingsModal';
import { AuthPage } from './components/auth/AuthPage';
import { OnboardingForm } from './components/auth/OnboardingForm';
import { useAuth } from './contexts/AuthContext';
import { 
  fetchUserBrands, 
  saveBrandToSupabase, 
  fetchUserCarousels, 
  saveCarouselToSupabase, 
  deleteCarouselFromSupabase 
} from './services/supabaseService';
import { parseInstagramOAuthCallback } from './services/instagramService';
import { Brand, Carousel } from './types/lana';
import { Loader2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | undefined>(undefined);
  const [whiteLabelMode, setWhiteLabelMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load User Brands & Carousels from Supabase
  const loadUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const fetchedBrands = await fetchUserBrands(user.id);
      setBrands(fetchedBrands);

      if (fetchedBrands.length > 0) {
        let primary = fetchedBrands.find(b => b.isPrimary) || fetchedBrands[0];

        // Check if user just completed 1-Click Meta Instagram OAuth login redirect
        const oauthRes = await parseInstagramOAuthCallback();
        if (oauthRes.success) {
          const customHandle = localStorage.getItem('lana_ig_custom_handle');
          const finalHandle = customHandle || (primary.igHandle && primary.igHandle !== '@brand' && primary.igHandle !== '@connected' ? primary.igHandle : (oauthRes.username ? `@${oauthRes.username.replace('@', '')}` : '@lana.carousel'));

          primary = {
            ...primary,
            igConnected: true,
            igHandle: finalHandle,
            igAccountName: oauthRes.username || primary.igAccountName,
          };
          await saveBrandToSupabase(user.id, primary);
          setBrands(prev => prev.map(b => b.id === primary.id ? primary : b));
        }

        setActiveBrand(primary);

        const fetchedCarousels = await fetchUserCarousels(user.id, primary.id);
        setCarousels(fetchedCarousels);
        if (fetchedCarousels.length > 0 && !selectedCarousel) {
          setSelectedCarousel(fetchedCarousels[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load user data from Supabase:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Handle Saving / Updating Carousel to Supabase
  const handleSaveCarousel = async (updated: Carousel) => {
    if (!user || !activeBrand) return;
    
    const carouselWithBrand: Carousel = {
      ...updated,
      brandId: updated.brandId || activeBrand.id,
    };

    // Optimistic UI update
    setCarousels(prev => {
      const exists = prev.some(c => c.id === updated.id);
      if (exists) {
        return prev.map(c => c.id === updated.id ? carouselWithBrand : c);
      }
      return [carouselWithBrand, ...prev];
    });

    // Save to Supabase DB
    const saved = await saveCarouselToSupabase(user.id, carouselWithBrand);
    if (saved) {
      setCarousels(prev => prev.map(c => c.id === updated.id || c.id === carouselWithBrand.id ? saved : c));
      setSelectedCarousel(saved);
    }
  };

  // Handle Scheduling Carousel
  const handleScheduleCarousel = async (updated: Carousel) => {
    const scheduledItem: Carousel = {
      ...updated,
      status: 'scheduled',
      scheduledAt: updated.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
    };
    await handleSaveCarousel(scheduledItem);
    setActiveTab('calendar');
  };

  // Handle Delete Carousel
  const handleDeleteCarousel = async (id: string) => {
    setCarousels(prev => prev.filter(c => c.id !== id));
    await deleteCarouselFromSupabase(id);
  };

  // Handle Brand Update to Supabase
  const handleUpdateBrand = async (updated: Brand) => {
    if (!user) return;
    setActiveBrand(updated);
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
    await saveBrandToSupabase(user.id, updated);
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30 text-white animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          <span>Authenticating Lana AI Studio...</span>
        </div>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return <AuthPage />;
  }

  // First-time Onboarding Screen (if profile not completed or no brands exist)
  if (!profile?.onboarding_completed || (brands.length === 0 && !dataLoading)) {
    return (
      <OnboardingForm
        onComplete={async () => {
          await refreshProfile();
          await loadUserData();
        }}
      />
    );
  }

  // Fallback default brand if array has items
  const currentBrand: Brand = activeBrand || brands[0] || {
    id: 'brand-fallback',
    name: 'My Workspace',
    websiteUrl: 'https://myworkspace.com',
    industry: 'Marketing & Content',
    description: 'Instagram Carousel Content Suite',
    audience: 'Target Audience',
    voice: 'High Impact Marketing',
    primaryColor: '#0284C7',
    secondaryColor: '#C85A1A',
    accentColor: '#E8691C',
    igHandle: '@myworkspace',
    igConnected: false,
    postingFrequency: '3x / week',
  };

  const activeBrandCarousels = carousels.filter(c => c.brandId === currentBrand.id || !c.brandId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Sticky Header */}
      <Header
        brands={brands.length > 0 ? brands : [currentBrand]}
        activeBrand={currentBrand}
        onSelectBrand={(b) => {
          setActiveBrand(b);
          if (user) fetchUserCarousels(user.id, b.id).then(setCarousels);
        }}
        onOpenCreate={() => {
          setSelectedCarousel(undefined);
          setActiveTab('studio');
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        whiteLabelMode={whiteLabelMode}
        onToggleWhiteLabel={() => setWhiteLabelMode(!whiteLabelMode)}
        onSignOut={signOut}
        userEmail={user.email}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          draftCount={activeBrandCarousels.filter(c => c.status === 'draft').length}
          scheduledCount={activeBrandCarousels.filter(c => c.status === 'scheduled').length}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              activeBrand={currentBrand}
              carousels={activeBrandCarousels}
              analytics={[]}
              onNavigate={setActiveTab}
              onSelectCarousel={(car) => {
                setSelectedCarousel(car);
                setActiveTab('studio');
              }}
            />
          )}

          {activeTab === 'studio' && (
            <CarouselStudio
              carousel={selectedCarousel}
              brand={currentBrand}
              onSaveCarousel={handleSaveCarousel}
              onScheduleCarousel={handleScheduleCarousel}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          {activeTab === 'batch' && (
            <BatchGenerator
              onSelectConcept={(concept) => {
                setSelectedCarousel(concept);
                setActiveTab('studio');
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <ContentCalendar
              carousels={activeBrandCarousels}
              onSelectCarousel={(car) => {
                setSelectedCarousel(car);
                setActiveTab('studio');
              }}
              onOpenCreate={() => {
                setSelectedCarousel(undefined);
                setActiveTab('studio');
              }}
            />
          )}

          {activeTab === 'library' && (
            <ContentLibrary
              carousels={activeBrandCarousels}
              onSelectCarousel={(car) => {
                setSelectedCarousel(car);
                setActiveTab('studio');
              }}
              onDeleteCarousel={handleDeleteCarousel}
            />
          )}

          {activeTab === 'brand' && (
            <BrandKnowledgeHub
              brand={currentBrand}
              onUpdateBrand={handleUpdateBrand}
            />
          )}

          {activeTab === 'settings' && (
            <div className="navy-card rounded-3xl p-8 border border-slate-200 space-y-6 max-w-2xl mx-auto">
              <h2 className="font-headline text-2xl font-extrabold text-slate-900">Application & Instagram Settings</h2>
              <p className="text-xs text-slate-500">Manage account access, security tokens, Meta Graph API keys, and agency white-label options.</p>
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
              >
                Open Full Settings Modal
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        brand={currentBrand}
        whiteLabelMode={whiteLabelMode}
        onToggleWhiteLabel={() => setWhiteLabelMode(!whiteLabelMode)}
        onUpdateBrand={handleUpdateBrand}
      />
    </div>
  );
};

export default App;
