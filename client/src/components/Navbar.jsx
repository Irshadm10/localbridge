import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { Bell, LogOut, User, Settings, Sparkles } from 'lucide-react';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/');
  }

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLink = (path, label, extraClass = '', { ai = false } = {}) => {
    const active = isActive(path);
    return (
      <Link
        to={path}
        className={`relative rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
          active
            ? 'text-stone-950 dark:text-stone-50'
            : 'text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-50'
        } ${extraClass}`}
      >
        <span className="relative z-10 inline-flex items-center gap-1.5">
          {label}
          {ai ? (
            <span
              aria-label="AI powered"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_2px_8px_-1px_rgba(234,88,12,0.55)]"
            >
              AI
            </span>
          ) : null}
        </span>
        {active && (
          <>
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-gradient-to-b from-stone-100 to-stone-50 ring-1 ring-stone-200/80 dark:from-white/[0.08] dark:to-white/[0.02] dark:ring-white/10"
            />
            <span
              aria-hidden
              className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent dark:via-orange-400/80"
            />
          </>
        )}
        {!active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-transparent transition-colors hover:bg-stone-100 dark:hover:bg-white/[0.06]"
          />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 dark:border-white/[0.06] dark:bg-stone-950/80">
      {/* Dark-mode luminous top strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 dark:opacity-100"
      />
      <nav className="relative mx-auto grid h-[3.75rem] w-full max-w-bridge grid-cols-3 items-center px-4 sm:h-16 sm:px-6 lg:px-8 xl:px-10">
        {/* Left — logo */}
        <Link
          to="/"
          className="group relative flex items-center gap-2.5 justify-self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] rounded-xl"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-lg font-bold text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.55)] transition-all duration-300 group-hover:shadow-[0_10px_28px_-6px_rgba(234,88,12,0.7)] group-hover:brightness-110">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-60 transition group-hover:opacity-90"
            />
            <span className="relative">B</span>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 dark:text-glow-bridge">
            Bridge
          </span>
        </Link>

        {/* Center — mentors: dashboard hub; mentees: mentors + dashboard when signed in */}
        <div className="flex min-w-0 items-center justify-center gap-0.5 sm:gap-1">
          {asMentor ? (
            navLink('/dashboard', 'Dashboard')
          ) : (
            <>
              {navLink('/mentors', 'Mentors')}
              {user ? navLink('/dashboard', 'Dashboard') : null}
              {navLink('/resume', 'Resume', '', { ai: true })}
            </>
          )}
          {navLink('/about', 'About', 'hidden lg:inline-flex')}
          {navLink('/pricing', 'Pricing')}
        </div>

        {/* Right — auth */}
        <div className="flex items-center justify-end">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-stone-200/70 dark:bg-white/[0.06]" aria-hidden />
          ) : user ? (
            <div className="flex items-center gap-1">
              {/* Notification bell */}
              <button
                type="button"
                onClick={() => alert('You have no new notifications.')}
                className="relative rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span
                    aria-hidden
                    className="absolute inline-flex h-full w-full rounded-full bg-orange-400/70 opacity-75 animate-pulse-soft"
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full border-2 border-white bg-orange-500 dark:border-stone-900" />
                </span>
              </button>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-bold text-stone-800 ring-2 ring-white transition-all hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:bg-stone-700 dark:text-stone-100 dark:ring-stone-800 dark:hover:ring-orange-400/70"
                >
                  {/* Dark-mode luminous gradient ring */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-80"
                    style={{
                      background:
                        'conic-gradient(from 140deg, rgba(251,146,60,0.9), rgba(234,88,12,0.35), rgba(253,230,138,0.85), rgba(251,146,60,0.9))',
                      WebkitMask:
                        'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      padding: '1.5px',
                    }}
                  />
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="relative">
                      {getInitials(user.user_metadata?.full_name || user.email)}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(28,25,23,0.25)] animate-pop-in dark:border-white/10 dark:bg-stone-900/95 dark:shadow-[0_30px_80px_-20px_rgba(234,88,12,0.3)]"
                  >
                    {/* Header strip */}
                    <div className="relative border-b border-stone-100 px-4 py-3 dark:border-white/[0.08]">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent dark:via-orange-400/60"
                      />
                      <p
                        className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50"
                        title={user.user_metadata?.full_name ?? user.email}
                      >
                        {user.user_metadata?.full_name ?? user.email}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                        {user.email}
                      </p>
                      <p
                        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                          asMentor
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 ring-1 ring-amber-300/60 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-200 dark:ring-amber-400/30'
                            : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200 dark:bg-white/[0.06] dark:text-stone-300 dark:ring-white/10'
                        }`}
                      >
                        {asMentor ? (
                          <>
                            <Sparkles className="h-3 w-3" aria-hidden />
                            Mentor
                          </>
                        ) : (
                          'Member'
                        )}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
                      >
                        <User className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
                      >
                        <Settings className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                        Settings
                      </Link>

                      {!asMentor ? (
                        <Link
                          to="/mentors"
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-orange-50/60 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
                        >
                          <Sparkles className="h-4 w-4 text-stone-400 transition group-hover:text-orange-500 dark:text-stone-500 dark:group-hover:text-orange-400" />
                          Find a mentor
                        </Link>
                      ) : null}
                    </div>

                    <div className="border-t border-stone-100 dark:border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/[0.08]"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-sheen relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.5)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(234,88,12,0.65)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
