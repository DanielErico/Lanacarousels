import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  CalendarDays, 
  FolderKanban, 
  BookOpen, 
  Settings,
  Flame,
  ChevronRight
} from 'lucide-react';

export type TabType = 'dashboard' | 'studio' | 'batch' | 'calendar' | 'library' | 'brand' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  draftCount: number;
  scheduledCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  draftCount,
  scheduledCount,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'studio' as TabType, label: 'AI Carousel Studio', icon: Sparkles, badge: 'PRO' },
    { id: 'batch' as TabType, label: 'Batch Generator', icon: Layers, badge: 'NEW' },
    { id: 'calendar' as TabType, label: 'Publishing Calendar', icon: CalendarDays, badge: scheduledCount > 0 ? `${scheduledCount}` : null },
    { id: 'library' as TabType, label: 'Content Library', icon: FolderKanban, badge: draftCount > 0 ? `${draftCount}` : null },
    { id: 'brand' as TabType, label: 'Brand Knowledge Hub', icon: BookOpen, badge: null },
    { id: 'settings' as TabType, label: 'IG & App Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Group Header */}
        <div className="px-3">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Platform Menu
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-200' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                      isActive
                        ? 'bg-sky-500/30 text-sky-100'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-200" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Card: Performance Widget */}
      <div className="navy-card p-4 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">AI Publishing Loop</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono font-bold">ACTIVE</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-slate-900 h-full w-[85%]" />
        </div>
        <p className="text-[10px] text-slate-500">
          85% automation efficiency score for <span className="text-slate-900 font-semibold">Lana Executive AI</span>.
        </p>
      </div>
    </aside>
  );
};
