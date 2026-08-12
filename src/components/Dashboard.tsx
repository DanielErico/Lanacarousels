
import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  CalendarDays, 
  CheckCircle2, 
  Globe, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2,
  Zap
} from 'lucide-react';
import { Carousel, AnalyticsSnapshot, Brand } from '../types/lana';
import { TabType } from './Sidebar';

interface DashboardProps {
  activeBrand: Brand;
  carousels: Carousel[];
  analytics: AnalyticsSnapshot[];
  onNavigate: (tab: TabType) => void;
  onSelectCarousel: (car: Carousel) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeBrand,
  carousels,
  analytics,
  onNavigate,
  onSelectCarousel,
}) => {
  const scheduledCarousels = carousels.filter(c => c.status === 'scheduled');
  const publishedCount = carousels.filter(c => c.status === 'published').length;
  const draftCount = carousels.filter(c => c.status === 'draft').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="navy-card rounded-3xl p-6 sm:p-8 overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-sky-500" />
              <span>AI Content Engine Ready</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back to <span className="text-sky-600">{activeBrand.name}</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Lana is automatically managing your Instagram carousel workflow. You have <span className="text-slate-900 font-bold">{scheduledCarousels.length} posts scheduled</span> for auto-publishing this week.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('studio')}
              className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4 text-sky-100" />
              <span>Create Carousel</span>
            </button>
            <button
              onClick={() => onNavigate('batch')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-all"
            >
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Batch Concepts</span>
            </button>
            <button
              onClick={() => onNavigate('brand')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-all"
            >
              <Globe className="w-4 h-4 text-slate-600" />
              <span>Sync Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="navy-card navy-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Carousels</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{carousels.length}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">+4 this week</span> • {draftCount} in drafts
            </p>
          </div>
        </div>

        <div className="navy-card navy-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Organic Reach</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">54,750</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">+18.4%</span> vs last month
            </p>
          </div>
        </div>

        <div className="navy-card navy-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Publish Success Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">99.4%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {publishedCount} posts published smoothly
            </p>
          </div>
        </div>

        <div className="navy-card navy-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Next Scheduled Post</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 truncate">Tomorrow @ 10:00 AM</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Auto-publishing via Graph API
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Queue + Performance Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduled & Draft Carousels */}
        <div className="lg:col-span-2 navy-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-lg font-extrabold text-slate-900">Active Content Queue</h3>
              <p className="text-xs text-slate-500">Carousels scheduled or ready for review</p>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              View Calendar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {carousels.length === 0 && (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">No Carousels Created Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click "Create New Carousel" or "Generate Batch" to create your first Instagram Carousel!
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('studio')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Create New Carousel
                </button>
              </div>
            )}
            {carousels.map((car) => (
              <div 
                key={car.id}
                onClick={() => {
                  onSelectCarousel(car);
                  onNavigate('studio');
                }}
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-12 h-14 rounded-lg bg-sky-600 text-white border border-sky-500 flex items-center justify-center shrink-0 font-bold text-xs">
                    4:5
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {car.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                      <span>{car.slides.length} slides</span>
                      <span>•</span>
                      <span className="uppercase">{car.sourceType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      car.status === 'scheduled' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                        : car.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {car.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {car.scheduledAt ? 'Aug 4, 10:00 AM' : 'Draft Mode'}
                    </p>
                  </div>

                  {/* Performance Score pill */}
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-900 font-mono">{car.performanceScore.overall}</div>
                    <div className="text-[9px] text-slate-500 font-bold">SCORE</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Performance Predictor Insights */}
        <div className="navy-card rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Performance Predictor
            </h3>
            <p className="text-xs text-slate-500">AI analysis of current carousel portfolio</p>
          </div>

          <div className="p-4 rounded-xl bg-sky-950 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-200">Average Hook Score</span>
              <span className="text-sm font-bold text-sky-300 font-mono">96 / 100</span>
            </div>
            <div className="w-full bg-sky-900 rounded-full h-2">
              <div className="bg-sky-400 h-full rounded-full w-[96%]" />
            </div>
            <div className="space-y-1.5 pt-1 text-[11px] text-sky-100">
              <p>✓ Curiosity hooks increase swipe rate by +42%.</p>
              <p>✓ High contrast sky blue canvas improves dwell time.</p>
            </div>
          </div>

          {/* Recent Analytics Snapshot Card */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Performing Posts
            </h4>

            {analytics.map((item) => (
              <div key={item.carouselId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-600">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <Eye className="w-3 h-3 text-slate-700 mx-auto mb-0.5" />
                    <span className="font-bold text-slate-900">{item.reach}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <Heart className="w-3 h-3 text-slate-700 mx-auto mb-0.5" />
                    <span className="font-bold text-slate-900">{item.likes}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <Bookmark className="w-3 h-3 text-slate-700 mx-auto mb-0.5" />
                    <span className="font-bold text-slate-900">{item.saves}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <Share2 className="w-3 h-3 text-slate-700 mx-auto mb-0.5" />
                    <span className="font-bold text-slate-900">{item.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
