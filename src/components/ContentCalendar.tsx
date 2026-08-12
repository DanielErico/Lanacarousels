import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Instagram } from 'lucide-react';
import { Carousel } from '../types/lana';

interface ContentCalendarProps {
  carousels: Carousel[];
  onSelectCarousel: (car: Carousel) => void;
  onOpenCreate: () => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  carousels,
  onSelectCarousel,
  onOpenCreate,
}) => {
  const [currentMonth, setCurrentMonth] = useState('August 2026');
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const carouselDayMap: Record<number, Carousel[]> = {
    4: [carousels[0]],
    1: [carousels[2]],
    8: [carousels[1]],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header Bar */}
      <div className="navy-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white">
            <CalendarDays className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-slate-900">Publishing Calendar</h2>
            <p className="text-xs text-slate-500">Automated Instagram Graph API queue for August 2026</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
            <button className="p-1 hover:text-blue-600"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-bold">{currentMonth}</span>
            <button className="p-1 hover:text-blue-600"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="navy-card rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {daysInMonth.map((day) => {
            const scheduled = carouselDayMap[day] || [];
            const isToday = day === 3;

            return (
              <div
                key={day}
                className={`min-h-[100px] sm:min-h-[120px] rounded-2xl p-2 sm:p-2.5 border transition-all flex flex-col justify-between ${
                  isToday 
                    ? 'bg-blue-50/80 border-blue-300 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${isToday ? 'text-blue-700' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-blue-100 text-blue-800">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-auto">
                  {scheduled.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectCarousel(item)}
                      className={`p-1.5 sm:p-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer transition-all border truncate ${
                        item.status === 'scheduled'
                          ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                          : item.status === 'published'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-1 truncate">
                        <Instagram className="w-3 h-3 shrink-0 text-slate-700" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[9px] opacity-80">
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 10:00 AM</span>
                        <span className="uppercase font-bold">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-mono">+ Add Slot</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
