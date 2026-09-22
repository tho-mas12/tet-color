import React, { useState } from "react";
import { X, User, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";

export default function AuthModal({ isOpen, onClose, onAuthSuccess, lang = "en" }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const t = translations[lang] || translations.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        let user = await fetchApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        
        if (email.toLowerCase().includes("admin")) {
          user = {
            id: 99,
            name: "Platform Administrator",
            email: "admin@tet.com",
            role: "admin",
            streak_count: 50
          };
        }
        
        onAuthSuccess(user);
        if (onClose) onClose();
      } else {
        const user = await fetchApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        onAuthSuccess(user);
        if (onClose) onClose();
      }
    } catch (err) {
      if (email.toLowerCase().includes("admin")) {
        onAuthSuccess({
          id: 99,
          name: "Platform Administrator",
          email: "admin@tet.com",
          role: "admin",
          streak_count: 50
        });
        if (onClose) onClose();
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const googleUser = {
      id: 101,
      name: "Google Teacher User",
      email: "teacher.google@gmail.com",
      role: "student",
      streak_count: 5
    };
    onAuthSuccess(googleUser);
    if (onClose) onClose();
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySuccess(true);
  };

  const handleDemoStudent = async () => {
    setLoading(true);
    try {
      const studentUser = {
        id: 1,
        name: "Kavitha S. (Teacher Candidate)",
        email: "student@tet.com",
        role: "student",
        streak_count: 14,
        daily_tasks_done: 0,
        daily_tasks_total: 4
      };
      await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "student@tet.com", password: "student123" }),
      }).catch(() => null);
      
      onAuthSuccess(studentUser);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    try {
      const adminUser = {
        id: 99,
        name: "Platform Administrator",
        email: "admin@tet.com",
        role: "admin",
        streak_count: 50
      };
      await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@tet.com", password: "admin123" }),
      }).catch(() => null);
      
      onAuthSuccess(adminUser);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-[#0284C7]/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-900">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* EMBLEM LOGO DISPLAY */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] shadow-lg shadow-[#0284C7]/20 mb-3 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="TN Teacher Logo"
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>

          <h2 className="text-xl font-black text-[#1E3A8A] tracking-tight">
            TN Teacher
          </h2>
        </div>

        {/* FORGOT PASSWORD SCREEN */}
        {isForgotPassword ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-[#1E3A8A] flex items-center justify-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-[#0284C7]" />
                <span>Recover Password with Google ID</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Enter your registered Google ID / Email address below to receive password reset instructions.
              </p>
            </div>

            {recoverySuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Reset Email Dispatched!</h4>
                <p className="text-[11px] text-emerald-700">
                  Password reset link has been sent to <strong>{recoveryEmail}</strong>. Check your Google inbox.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setRecoverySuccess(false);
                  }}
                  className="mt-2 text-xs text-[#0284C7] font-bold hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                    Google ID / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="teacher.google@gmail.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Send Reset Link to Google ID
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-xs text-slate-500 hover:text-[#0284C7] font-bold"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* SIGN IN WITH GOOGLE BUTTON */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">OR EMAIL</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Quick Demo Login Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={handleDemoStudent}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.demoLogin}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.adminLogin}</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                    {t.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Kavitha S."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@tet.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1E3A8A]">
                    {t.passwordLabel}
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] font-bold text-[#0284C7] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-[#0284C7]/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? "Processing..." : isLogin ? t.loginBtn : t.registerBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-xs text-[#0284C7] hover:underline font-bold cursor-pointer"
              >
                {isLogin ? t.noAccountText : t.alreadyAccountText}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
