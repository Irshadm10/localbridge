import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const ROLES = [
  { value: "mentee", label: "I'm looking for a mentor", icon: "🎯" },
  { value: "mentor", label: "I want to be a mentor",    icon: "🌱" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [role, setRole]               = useState("mentee");
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

  function validate() {
    const next = {};
    if (!fullName.trim())        next.fullName        = "Full name is required.";
    if (!email.trim())           next.email           = "Email is required.";
    else if (!isValidEmail(email)) next.email         = "Enter a valid email address.";
    if (!password)               next.password        = "Password is required.";
    else if (password.length < 6) next.password       = "Password must be at least 6 characters.";
    if (!confirmPassword)        next.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, { full_name: fullName.trim(), role });
      navigate("/mentors");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function field(setter, key) {
    return (v) => {
      setter(v);
      if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    };
  }

  function inputCls(hasError) {
    return `w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 focus:ring-red-200"
        : "border-stone-200 focus:ring-amber-200 focus:border-amber-400"
    }`;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-600 font-bold text-2xl tracking-tight">
            <span className="text-3xl">🌉</span> Bridge
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Create your account</h1>
          <p className="mt-1 text-sm text-stone-500">Join the Bridge mentorship community</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Role toggle */}
            <div>
              <p className="block text-sm font-semibold text-stone-700 mb-2">I want to…</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      role === r.value
                        ? "border-amber-400 bg-amber-50"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className={`text-xs font-semibold leading-snug ${role === r.value ? "text-amber-700" : "text-stone-600"}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-stone-700 mb-1.5">Full name</label>
              <input
                id="fullName" type="text" autoComplete="name"
                value={fullName} onChange={(e) => field(setFullName, "fullName")(e.target.value)}
                placeholder="Jane Smith" className={inputCls(!!errors.fullName)}
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={(e) => field(setEmail, "email")(e.target.value)}
                placeholder="you@example.com" className={inputCls(!!errors.email)}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <input
                id="password" type="password" autoComplete="new-password"
                value={password} onChange={(e) => field(setPassword, "password")(e.target.value)}
                placeholder="At least 6 characters" className={inputCls(!!errors.password)}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-stone-700 mb-1.5">Confirm password</label>
              <input
                id="confirmPassword" type="password" autoComplete="new-password"
                value={confirmPassword} onChange={(e) => field(setConfirm, "confirmPassword")(e.target.value)}
                placeholder="••••••••" className={inputCls(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm rounded-xl transition-colors duration-150 shadow-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
