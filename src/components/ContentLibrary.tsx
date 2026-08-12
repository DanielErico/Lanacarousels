import React, { useState } from 'react';
import { FolderKanban, Search, Grid, List, Trash2 } from 'lucide-react';
import { Carousel, CarouselStatus } from '../types/lana';

interface ContentLibraryProps {
  carousels: Carousel[];
  onSelectCarousel: (car: Carousel) => void;
  onDeleteCarousel: (id: string) => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  carousels,
  onSelectCarousel,
  onDeleteCarousel,
}) => {
  const [activeFilter, setActiveFilter] = useState<CarouselStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCarousels = carousels.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Bar */}
      <div className="navy-card rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-sky-600 text-white">
              <FolderKanban className="w-6 h-6 text-sky-100" />
            </div>
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-slate-900">Content Library</h2>
              <p className="text-xs text-slate-500">All generated carousel assets, drafts, and archives</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border text-xs transition-all ${
                viewMode === 'grid' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl border text-xs transition-all ${
                viewMode === 'list' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'draft', 'scheduled', 'published', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status as CarouselStatus | 'all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === status
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search carousels..."
              className="w-full navy-input pl-9 pr-3 py-1.5 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCarousels.map((car) => (
            <div
              key={car.id}
              className="navy-card navy-card-hover rounded-3xl p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                    car.status === 'scheduled'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : car.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {car.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-900">
                    Score: {car.performanceScore.overall}
                  </span>
                </div>

                {/* 4:5 Cover Preview */}
                <div 
                  onClick={() => onSelectCarousel(car)}
                  className={`carousel-aspect-ratio w-full rounded-2xl p-5 bg-gradient-to-b ${car.slides[0].bgGradient} border border-slate-800 flex flex-col justify-between text-white shadow-md cursor-pointer relative overflow-hidden group-hover:scale-[1.01] transition-transform`}
                >
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase self-start"
                    style={{ backgroundColor: car.slides[0].accentColor, color: '#0F172A' }}
                  >
                    {car.slides[0].badge || 'HOOK'}
                  </span>
                  <h4 className="font-display text-lg font-bold leading-tight my-auto">
                    {car.slides[0].headline}
                  </h4>
                  <p className="text-[11px] opacity-80 truncate">{car.slides[0].subtext}</p>
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate">{car.title}</h3>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onSelectCarousel(car)}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all"
                >
                  Open in Studio
                </button>
                <button
                  onClick={() => onDeleteCarousel(car.id)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="navy-card rounded-3xl p-4 space-y-2">
          {filteredCarousels.map((car) => (
            <div
              key={car.id}
              onClick={() => onSelectCarousel(car)}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-4 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  4:5
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{car.title}</h4>
                  <p className="text-[10px] text-slate-500">{car.slides.length} slides • Style: {car.stylePreset}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-900">
                  Score: {car.performanceScore.overall}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCarousel(car.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
