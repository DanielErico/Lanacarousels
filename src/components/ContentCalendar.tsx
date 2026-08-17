import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Instagram, CheckCircle2, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonthCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Group user's carousels dynamically by calendar day
  const carouselDayMap: Record<number, Carousel[]> = {};
  const scheduledList: Carousel[] = [];

  (carousels || []).forEach(car => {
    const targetDateStr = car.scheduledAt || car.publishedAt;
    if (car.status === 'scheduled') {
      scheduledList.push(car);
    }
    if (targetDateStr) {
      const d = new Date(targetDateStr);
      // Ensure it belongs to current viewing month/year or map by day
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const dayNum = d.getDate();
        if (!carouselDayMap[dayNum]) carouselDayMap[dayNum] = [];
        carouselDayMap[dayNum].push(car);
      }
    }
  });

  // Sort upcoming scheduled carousels by date
  scheduledList.sort((a, b) => {
    const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return timeA - timeB;
  });

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const today = new Date().getDate();
  const isCurrentViewingMonth = 
    new Date().getMonth() === currentDate.getMonth() && 
    new Date().getFullYear() === currentDate.getFullYear();

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header Bar */}
      <div className="navy-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-md">
            <CalendarDays className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-slate-900">Publishing Calendar</h2>
            <p className="text-xs text-slate-500">Automated Instagram publishing schedule for {monthName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
            <button onClick={handlePrevMonth} className="p-1 hover:text-sky-600 font-bold"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-bold font-mono px-2">{monthName}</span>
            <button onClick={handleNextMonth} className="p-1 hover:text-sky-600 font-bold"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-sky-400" />
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
            const isToday = isCurrentViewingMonth && day === today;

            return (
              <div
                key={day}
                onClick={() => {
                  if (scheduled.length === 0) onOpenCreate();
                }}
                className={`min-h-[110px] sm:min-h-[130px] rounded-2xl p-2 sm:p-2.5 border transition-all flex flex-col justify-between cursor-pointer ${
                  isToday 
                    ? 'bg-sky-50/80 border-sky-300 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${isToday ? 'text-sky-700' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-sky-100 text-sky-800">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-auto">
                  {scheduled.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCarousel(item);
                      }}
                      className={`p-1.5 sm:p-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all border truncate shadow-xs ${
                        item.status === 'scheduled'
                          ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100'
                          : item.status === 'published'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 truncate">
                        <Instagram className="w-3 h-3 shrink-0 text-purple-600" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[9px] opacity-90">
                        <span className="flex items-center gap-0.5 font-mono">
                          <Clock className="w-2.5 h-2.5 text-sky-600" /> 
                          {item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                        </span>
                        <span className="uppercase font-bold tracking-wider">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-mono hover:text-slate-700">+ Add Post</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Scheduled Queue List */}
      <div className="navy-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" />
            Upcoming Scheduled Queue ({scheduledList.length})
          </h3>
        </div>

        {scheduledList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
            <p className="font-bold text-sm text-slate-700 mb-1">No upcoming scheduled posts</p>
            <p>Carousels you schedule will appear here and automatically publish at their designated time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledList.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectCarousel(item)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold font-mono text-[10px] uppercase">
                      Scheduled
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-sky-600" />
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {item.caption?.text || 'Ready for publishing.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="font-mono flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                  </span>
                  <span className="flex items-center gap-1 text-sky-600 font-bold text-[11px]">
                    Open in Studio <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
