import { useState } from 'react';
import { devLogout } from './devAuth.js';
import {
  LayoutDashboard, Users, CalendarDays, Star,
  ClipboardList, CalendarPlus, LogOut, ChevronRight,
  Terminal, Bell, AlertTriangle,
} from 'lucide-react';

const NAV = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'mentors',       label: 'Mentors',        icon: Users           },
  { id: 'sessions',      label: 'Sessions',       icon: CalendarDays    },
  { id: 'reviews',       label: 'Reviews',        icon: Star            },
  { id: 'users',         label: 'Users',          icon: ClipboardList   },
  { id: 'schedule',      label: 'Schedule',       icon: CalendarPlus    },
  { id: 'cancellations', label: 'Cancellations',  icon: AlertTriangle   },
];

export default function DevLayout({ children, activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    devLogout();
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-white/6 bg-[#0d0d14]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_16px_rgba(249,115,22,0.3)]">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">Dev Portal</p>
            <p className="text-[9px] text-stone-500 mt-0.5">Bridge Internal</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-400">Live</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-orange-500/12 text-orange-400 border border-orange-500/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/4'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
                {active && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 border-t border-white/6 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-500 hover:text-stone-300 hover:bg-white/4 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b border-white/6 bg-[#0d0d14] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Terminal className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white">Dev Portal</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="text-stone-400 hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0a0a0f]/95 pt-14 px-4 flex flex-col gap-1">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-300 hover:bg-white/5"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-500 hover:text-stone-300 mt-auto">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
        {/* Tab bar (mobile bottom) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex bg-[#0d0d14] border-t border-white/6">
          {NAV.slice(0, 5).map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium transition-colors ${
                  active ? 'text-orange-400' : 'text-stone-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
