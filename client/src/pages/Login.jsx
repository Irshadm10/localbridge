import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]   = useState(false);

  function validate() {
    const next = {};
    if (!email.trim())             next.email    = "Email is required.";
    else if (!isValidEmail(email)) next.email    = "Enter a valid email address.";
    if (!password)                 next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/mentors");
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(v) {
    setEmail(v);
    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
  }
  function handlePasswordChange(v) {
    setPassword(v);
    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-600 font-bold text-2xl tracking-tight">
            <span className="text-3xl">🌉</span> Bridge
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-300 focus:ring-red-200"
                    : "border-stone-200 focus:ring-amber-200 focus:border-amber-400"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-stone-200 focus:ring-amber-200 focus:border-amber-400"
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm rounded-xl transition-colors duration-150 shadow-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
