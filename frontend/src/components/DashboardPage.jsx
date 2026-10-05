import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Award, 
  Zap, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Bell, 
  Calendar,
  Globe,
  ExternalLink
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";

export default function DashboardPage({ user, onNavigateToLearning, lang = "en" }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [tetCards, setTetCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadDashboard();
    loadTetCards();
  }, [user]);

  const loadTetCards = async () => {
    try {
      const cards = await fetchApi("/tet-cards");
      if (Array.isArray(cards) && cards.length > 0) {
        setTetCards(cards);
      }
    } catch (err) {
      console.error("TET Cards error:", err);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const email = user ? user.email : "student@tet.com";
      const data = await fetchApi(`/dashboard?email=${encodeURIComponent(email)}`);
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#0284C7] text-xs font-bold">Loading Dashboard...</p>
      </div>
    );
  }

  const u = dashboardData?.user || user || {};
  const quote = dashboardData?.quote || "Success is built on small daily study steps.";
  const badges = dashboardData?.badges || [];
  const announcements = dashboardData?.announcements || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in text-[#071c38]">
      
      {/* PROFILE CARD */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-[#0055ff] rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-[#061b36] via-[#092d62] to-[#0055ff] shadow-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="TN Teacher Emblem"
                className="w-full h-full object-cover rounded-full border-2 border-white"
              />
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#061b36] tracking-tight">
                  {t.welcomeBack}, {u.name}!
                </h1>
                
                {/* Highest Unlocked Badge Logo Displayed Right Next to Name */}
                {badges.filter(b => b.unlocked).length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-800 text-xs font-black flex items-center space-x-1.5 shadow-xs animate-bounce">
                    <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>{badges.filter(b => b.unlocked).slice(-1)[0]?.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-lg bg-slate-50 text-[#061b36] border border-slate-200 flex items-center space-x-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#0055ff]" />
                  <span>{t.academicYear}</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TN Teacher Active Account</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToLearning("paper1", 1)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#061b36] to-[#0055ff] hover:from-[#05152a] hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.continueLearningBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATUS BAR & DAILY STREAK */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0055ff]" />
                <span className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider">
                  {t.dailyTaskTitle}
                </span>
              </div>
              <span className="text-xs font-black text-[#0055ff]">
                {u.daily_tasks_done} / {u.daily_tasks_total} {t.tasksDone} ({u.progress_percent || 0}%)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full p-0.5 border border-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, u.progress_percent || 0))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.dailyTaskDesc}
            </p>
          </div>

          <div className="md:w-72 bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/60 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0055ff] block mb-0.5">
                {t.dailyStreakTitle}
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#061b36]">{u.streak_count || 0}</span>
                <span className="text-xs font-bold text-[#0055ff]">{t.streakDays}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">
                {u.streak_count > 0 ? t.streakActiveDesc : t.streakInactiveDesc}
              </span>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#061b36] to-[#0055ff] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= TET COURSE CARDS (TET-1 & TET-2 - NORMAL STANDARD CARD SIZE) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#061b36] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#0055ff]" />
            <span>TET Course Packages (தேர்வு பாடப்பிரிவுகள்)</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Select course to begin sequential learning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {tetCards.length > 0 ? (
            tetCards.map((card) => (
              <div
                key={card.card_id || card.id}
                className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#061b36] tracking-tight">
                      {card.title}
                    </h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200/70">
                      {card.class_range}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">{card.class_range}</span>
                    <span className="text-slate-400">{card.lesson_count_label || "25 Lessons"}</span>
                  </div>

                  <button
                    onClick={() => onNavigateToLearning(card.paper_type, card.start_class)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group"
                  >
                    <span>{card.button_text || `OPEN ${card.title} →`}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Default Normal Standard Cards */
            <>
              <div className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#061b36] tracking-tight">TET-1</h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200/70">
                      Classes 1–8
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">Classes 1–8</span>
                    <span className="text-slate-400">25 Lessons</span>
                  </div>
                  <button
                    onClick={() => onNavigateToLearning("paper1", 1)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group"
                  >
                    <span>OPEN TET-1 →</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#061b36] tracking-tight">TET-2</h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200/70">
                      Classes 6–12
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    6 முதல் 12 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">Classes 6–12</span>
                    <span className="text-slate-400">25 Lessons</span>
                  </div>
                  <button
                    onClick={() => onNavigateToLearning("paper2", 6)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group"
                  >
                    <span>OPEN TET-2 →</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MOTIVATION QUOTE BOX & STREAK BADGES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-50 to-blue-50/60 border border-sky-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-white text-[#0284C7] text-xs font-bold uppercase flex items-center space-x-1.5 border border-[#0284C7]/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{t.dailyMotivationTitle}</span>
              </span>
            </div>

            <blockquote className="text-base sm:text-lg font-extrabold text-[#1E3A8A] italic leading-relaxed my-2">
              "{quote}"
            </blockquote>
          </div>

          <div className="pt-4 border-t border-sky-200/80 flex items-center justify-between text-xs text-[#0284C7] font-semibold">
            <span>TET Portal</span>
            <span className="font-bold text-[#1E3A8A]">Daily Learning Focus</span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.streakBadgesTitle}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.badgesDesc}
                </p>
              </div>
              <span className="text-xs font-bold text-[#0284C7] bg-sky-50 px-3 py-1 rounded-full border border-[#0284C7]/30">
                {badges.filter(b => b.unlocked).length} / {badges.length} {t.unlockedText}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b) => {
                const isUnlocked = b.unlocked;
                return (
                  <div
                    key={b.id}
                    className={`relative p-3.5 rounded-2xl border text-center transition-all ${
                      isUnlocked
                        ? "bg-sky-50/70 border-[#0284C7]/40 shadow-xs"
                        : "bg-slate-50 border-slate-200 opacity-60 grayscale"
                    }`}
                  >
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✓
                      </div>
                    )}

                    <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0284C7] p-0.5 shadow-xs flex items-center justify-center mb-2">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                        {b.id === "day15" && <Zap className="w-5 h-5 text-yellow-500 fill-yellow-400" />}
                        {b.id === "day30" && <Award className="w-5 h-5 text-orange-500" />}
                        {b.id === "day90" && <ShieldCheck className="w-5 h-5 text-indigo-600" />}
                        {b.id === "day180" && <Sparkles className="w-5 h-5 text-emerald-600" />}
                        {b.id === "day365" && <Crown className="w-5 h-5 text-[#0284C7] fill-[#0284C7]" />}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-[#1E3A8A] truncate">{b.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                      {b.required_streak} {t.streakDays}
                    </span>

                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                        isUnlocked
                          ? "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isUnlocked ? t.unlockedText : `${t.needStreakText} ${b.required_streak}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* GOOGLE EDUCATION NEWS FEED */}
      {dashboardData?.news_feed?.length > 0 && (
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#0284C7] animate-pulse" />
                <span>{t.educationNewsTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t.educationNewsSubtitle}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{t.liveNewsBadge}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.news_feed.map((news) => (
              <a
                key={news.id}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 hover:border-[#0284C7]/40 hover:bg-sky-50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0284C7] border border-[#0284C7]/30 text-[10px] font-bold">
                      {news.category || "Education"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {news.date}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1E3A8A] group-hover:text-[#0284C7] transition-colors leading-snug line-clamp-2">
                    {news.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2.5 border-t border-sky-100 flex items-center justify-between text-[11px] font-bold text-[#0284C7]">
                  <span className="text-slate-500 font-medium truncate text-[10px]">
                    {news.source}
                  </span>
                  <span className="flex items-center space-x-1 group-hover:underline">
                    <span>{t.readFullNews}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SECTION */}
      {announcements.length > 0 && (
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-[#0284C7] animate-bounce" />
            <span>{t.announcementsTitle}</span>
          </h3>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        ann.priority === "urgent"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <h4 className="text-xs font-bold text-[#1E3A8A]">{ann.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">{ann.content}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                  {ann.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
