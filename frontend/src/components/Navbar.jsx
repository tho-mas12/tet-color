import React from "react";
import { BookOpen, Layers, GraduationCap, ShieldCheck, Flame, LogIn, LogOut, Globe, Search } from "lucide-react";
import { translations } from "../translations";

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout, lang, setLang }) {
  const isAdmin = user && user.role === "admin";
  const t = translations[lang] || translations.en;

  const toggleLanguage = () => {
    setLang(lang === "en" ? "ta" : "en");
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061b36] via-[#082852] to-[#061b36] text-white shadow-lg border-b border-[#05152a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Title with Emblem Logo */}
        <div 
          onClick={() => setActiveTab(isAdmin ? "admin" : "dashboard")} 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-full p-0.5 bg-white/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden shadow-inner">
            <img 
              src="/logo.jpg" 
              alt="TN Teacher Logo" 
              className="w-full h-full object-cover rounded-full border border-white"
            />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight block leading-tight">
              {lang === "ta" ? "பாடப்புத்தகங்கள்" : t.brandTitle}
            </span>
            <span className="block text-[10px] text-sky-200 uppercase tracking-wider font-medium -mt-0.5">
              {lang === "ta" ? "அனைத்து வகுப்புகளுக்கும்" : t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1 bg-black/25 p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === "dashboard"
                  ? "bg-[#0055ff] text-white shadow-sm"
                  : "text-sky-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === "materials"
                  ? "bg-[#0055ff] text-white shadow-sm"
                  : "text-sky-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.materials}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === "admin"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.admin}</span>
              </button>
            )}
          </nav>
        )}

        {/* User Info & Top Right Circle Language Switcher */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* CIRCLE SHAPE LANGUAGE SWITCHER BUTTON IN TOP RIGHT CORNER */}
          <button
            onClick={toggleLanguage}
            title={t.switchLangTooltip}
            className="w-9 h-9 rounded-full bg-white/20 text-white font-black text-xs sm:text-sm shadow-md border border-white/30 flex items-center justify-center space-x-0.5 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 opacity-90" />
            <span className="font-extrabold">{lang === "ta" ? "த" : "EN"}</span>
          </button>

          {user ? (
            <>
              {/* Streak Pill */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-bold shadow-xs">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>{user.streak_count || 0} {t.streakDays}</span>
              </div>

              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-white/20">
                <div className="w-8 h-8 rounded-full bg-white text-[#061b36] flex items-center justify-center font-black text-xs shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-bold text-white leading-none">
                    {user.name}
                  </span>
                  <span className="block text-xs text-sky-200 font-semibold uppercase mt-0.5">
                    {lang === "ta" ? "மாணவர்" : user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title={t.logout}
                className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer min-h-[40px]"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar for Perfect Mobile Usability */}
      {user && (
        <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#061b36]/95 backdrop-blur-md border-t border-white/15 px-3 py-1.5 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[48px] justify-center cursor-pointer ${
              activeTab === "dashboard"
                ? "text-white bg-[#0055ff] shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>{t.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab("materials")}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[48px] justify-center cursor-pointer ${
              activeTab === "materials"
                ? "text-white bg-[#0055ff] shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>{t.materials}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[48px] justify-center cursor-pointer ${
                activeTab === "admin"
                  ? "text-white bg-amber-600 shadow-xs"
                  : "text-amber-200 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span>{t.admin}</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

