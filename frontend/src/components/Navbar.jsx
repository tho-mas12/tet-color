import React from "react";
import { BookOpen, Layers, GraduationCap, ShieldCheck, Flame, LogIn, LogOut, Globe } from "lucide-react";
import { translations } from "../translations";

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout, lang, setLang }) {
  const isAdmin = user && user.role === "admin";
  const t = translations[lang] || translations.en;

  const toggleLanguage = () => {
    setLang(lang === "en" ? "ta" : "en");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Title with Emblem Logo */}
        <div 
          onClick={() => setActiveTab(isAdmin ? "admin" : "dashboard")} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] shadow-md shadow-[#0284C7]/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
            <img 
              src="/logo.jpg" 
              alt="TN Teacher Logo" 
              className="w-full h-full object-cover rounded-full border border-white"
            />
          </div>
          <div>
            <span className="text-xl font-black text-[#1E3A8A] tracking-tight">
              {t.brandTitle}
            </span>
            <span className="block text-[10px] text-[#0284C7] uppercase tracking-wider font-bold -mt-0.5">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === "dashboard"
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "text-[#1E3A8A] hover:text-[#0284C7] hover:bg-white/80"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === "materials"
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "text-[#1E3A8A] hover:text-[#0284C7] hover:bg-white/80"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.materials}</span>
            </button>

            <button
              onClick={() => setActiveTab("learning")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === "learning"
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "text-[#1E3A8A] hover:text-[#0284C7] hover:bg-white/80"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.learning}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                  activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-800 hover:text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.admin}</span>
              </button>
            )}
          </nav>
        )}

        {/* User Info & Right Top Circle Language Switcher */}
        <div className="flex items-center space-x-3">
          
          {/* CIRCLE SHAPE LANGUAGE SWITCHER BUTTON IN TOP RIGHT CORNER */}
          <button
            onClick={toggleLanguage}
            title={t.switchLangTooltip}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#0284C7] text-white font-black text-xs shadow-md border-2 border-sky-100 flex items-center justify-center space-x-0.5 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 opacity-80" />
            <span className="font-extrabold">{lang === "ta" ? "த" : "EN"}</span>
          </button>

          {user ? (
            <>
              {/* Streak Pill in Ice Blue & Orange */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-[#0284C7]/30 text-[#1E3A8A] text-xs font-bold shadow-xs">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>{user.streak_count || 0} {t.streakDays}</span>
              </div>

              <div className="hidden sm:flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#1E3A8A] leading-none">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-[#0284C7] font-bold uppercase mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title={t.logout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-sm shadow-[#0284C7]/20 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
