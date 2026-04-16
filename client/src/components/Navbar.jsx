import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="border-b border-stone-200 bg-amber-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-stone-900 tracking-tight">
          Bridge
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/mentors" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Browse Mentors
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-1.5 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
