import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Account";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const navLinkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-amber-600" : "text-stone-600 hover:text-stone-900"}`;

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 text-amber-600 font-bold text-xl tracking-tight">
          <span className="text-2xl">🌉</span> Bridge
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <NavLink to="/mentors" className={navLinkCls}>Browse Mentors</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkCls}>Dashboard</NavLink>}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-stone-600 font-medium bg-stone-100 px-3 py-1.5 rounded-full">
                👋 {displayName}
              </span>
              <button onClick={handleLogout}
                className="text-sm font-semibold text-stone-600 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors">
                Log in
              </Link>
              <Link to="/register"
                className="text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 px-4 py-1.5 rounded-xl transition-colors shadow-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="sm:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-3">
          <NavLink to="/mentors" className={navLinkCls} onClick={() => setMenuOpen(false)}>Browse Mentors</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkCls} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            {user ? (
              <>
                <p className="text-sm text-stone-500 font-medium">Signed in as {displayName}</p>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-sm font-semibold text-stone-700" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="block text-sm font-semibold text-amber-600" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
