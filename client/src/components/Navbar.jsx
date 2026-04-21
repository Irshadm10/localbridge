import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Bell, LogOut, LayoutDashboard, User, Settings } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">

        {/* Left — logo */}
        <Link to="/" className="group flex items-center gap-2 justify-self-start">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-white shadow-md shadow-orange-500/25 transition group-hover:shadow-lg group-hover:shadow-orange-500/30">
            B
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Bridge
          </span>
        </Link>

        {/* Center — nav links */}
        <div className="flex items-center justify-center gap-1">
          <Link to="/mentors" className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm sm:px-4">
            Mentors
          </Link>
          <Link to="/about" className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm sm:px-4">
            About
          </Link>
          <Link to="/pricing" className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm sm:px-4">
            Pricing
          </Link>
        </div>

        {/* Right — auth */}
        <div className="flex items-center justify-end">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-stone-200/70" aria-hidden />
          ) : user ? (
            <div className="flex items-center gap-1">
              {/* Notification bell */}
              <button
                type="button"
                onClick={() => alert('You have no new notifications.')}
                className="relative rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-orange-500" />
              </button>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-bold text-stone-700 ring-2 ring-white shadow-sm transition-all hover:ring-orange-300 focus-visible:outline-none focus-visible:ring-orange-400"
                  aria-label="Account menu"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.user_metadata?.full_name || user.email)
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xl shadow-stone-200/60">
                    {/* User info */}
                    <div className="border-b border-stone-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-stone-900" title={user.user_metadata?.full_name ?? user.email}>
                        {user.user_metadata?.full_name ?? user.email}
                      </p>
                      <p className="truncate text-xs text-stone-400">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      <User className="h-4 w-4 text-stone-400" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      <Settings className="h-4 w-4 text-stone-400" />
                      Settings
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      <LayoutDashboard className="h-4 w-4 text-stone-400" />
                      Dashboard
                    </Link>

                    <div className="border-t border-stone-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
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
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900">
                Log in
              </Link>
              <Link to="/register" className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-lg">
                Sign up
              </Link>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
}
