import React, { useState, useEffect } from "react";
import { 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Bell, 
  Calendar,
  Globe,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import DailyPracticeModal from "./DailyPracticeModal";
import NewsSection from "./NewsSection";

export default function DashboardPage({ user, onNavigateToLearning, onNavigateToMaterials, lang = "en" }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [tetCards, setTetCards] = useState([]);
  const [dailyPractices, setDailyPractices] = useState([]);
  const [selectedDailyPracticeId, setSelectedDailyPracticeId] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadDashboard();
    loadTetCards();
    loadDailyPractices();
  }, [user]);

  const loadDailyPractices = async () => {
    try {
      const data = await fetchApi("/daily-practice/active");
      if (Array.isArray(data)) {
        setDailyPractices(data);
      }
    } catch (err) {
      console.error("Daily practices error:", err);
    }
  };

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
      const email = user ? user.email : "candidate@tet.com";
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
  const announcements = dashboardData?.announcements || [];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6 animate-fade-in text-[#071c38]">
      
      {/* PROFILE CARD */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-[#0055ff] rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-[#061b36] via-[#092d62] to-[#0055ff] shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="TN Teacher Emblem"
                className="w-full h-full object-cover rounded-full border-2 border-white"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#061b36] tracking-tight">
                  {t.welcomeBack}, {u.name}!
                </h1>
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
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#061b36] to-[#0055ff] hover:from-[#05152a] hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer min-h-[44px]"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.continueLearningBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= PLATFORM ANNOUNCEMENTS & NOTICES (MARQUEE TICKER) ================= */}
      {announcements && announcements.length > 0 && (
        <div className="bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] border border-[#0055ff]/40 rounded-2xl p-2 sm:p-2.5 shadow-sm text-white overflow-hidden relative flex items-center gap-3">
          {/* Static Pinned Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs shrink-0 z-10 backdrop-blur-md shadow-2xs">
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="uppercase tracking-wider">
              {lang === "ta" ? "முக்கிய அறிவிப்பு:" : "Notice:"}
            </span>
          </div>

          {/* Scrolling Marquee Container */}
          <div className="overflow-hidden flex-1 relative cursor-pointer group">
            <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
              {/* Duplicate array for seamless infinite scroll */}
              {[...announcements, ...announcements].map((ann, idx) => (
                <div
                  key={`${ann.id}-${idx}`}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="flex items-center space-x-2 text-xs font-semibold hover:text-amber-200 transition-colors cursor-pointer"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ann.priority === "urgent"
                        ? "bg-rose-500 text-white shadow-2xs"
                        : "bg-blue-500/40 text-blue-200 border border-blue-400/30"
                    }`}
                  >
                    {ann.priority || "INFO"}
                  </span>
                  <span className="font-bold text-white group-hover:text-amber-100">{ann.title}:</span>
                  <span className="text-slate-200/90 max-w-md truncate">{ann.content}</span>
                  <span className="text-[10px] text-blue-300/80">({ann.date})</span>
                  <span className="text-amber-400/70 ml-4 font-bold">⚡</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Modal Trigger */}
          <button
            onClick={() => setSelectedAnnouncement(announcements[0])}
            className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-blue-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all shrink-0 cursor-pointer"
            title="Read Full Notice"
          >
            <span>{lang === "ta" ? "பார்வை" : "View"}</span>
            <span>↗</span>
          </button>
        </div>
      )}

      {/* STATUS BAR & DAILY STREAK */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6">
          
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0055ff]" />
                <span className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider">
                  {t.dailyTaskTitle}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-[#0055ff]">
                {u.daily_tasks_done} / {u.daily_tasks_total} {t.tasksDone} ({u.progress_percent || 0}%)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full p-0.5 border border-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, u.progress_percent || 0))}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.dailyTaskDesc}
            </p>
          </div>

          <div className="md:w-72 bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/60 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0055ff] block mb-0.5">
                {t.dailyStreakTitle}
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#061b36]">{u.streak_count || 0}</span>
                <span className="text-xs sm:text-sm font-bold text-[#0055ff]">{t.streakDays}</span>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">
                {u.streak_count > 0 ? t.streakActiveDesc : t.streakInactiveDesc}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#061b36] to-[#0055ff] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= DAILY PRACTICE TESTS (CONFIGURABLE STAGE CARDS) ================= */}
      {dailyPractices && dailyPractices.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#061b36] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#ff7a00]" />
              <span>⚡ Today's Daily Practice Tests (இன்றைய மாதிரிப் பயிற்சித் தேர்வுகள்)</span>
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 font-semibold">Class-wise tests with custom stages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dailyPractices.map((dp) => (
              <div
                key={dp.id}
                className="bg-white border-2 border-orange-200/80 hover:border-orange-400 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-[#ff7a00] border border-orange-200">
                      Class {dp.class_num} • {dp.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                      {dp.term}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#061b36] tracking-tight leading-snug">
                      {dp.title}
                    </h3>
                    {dp.description && (
                      <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">
                        {dp.description}
                      </p>
                    )}
                  </div>

                  {/* Active stages pill badges */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Included Stages:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(dp.active_stages) ? dp.active_stages : (typeof dp.active_stages === "string" ? dp.active_stages.split(",").map(Number).filter(n => !isNaN(n)) : [1, 3, 4])).map((stg) => {
                        const labels = {
                          1: "Stage 1: Notes",
                          2: "Stage 2: Video",
                          3: "Stage 3: Practice",
                          4: "Stage 4: Quiz (80%)"
                        };
                        return (
                          <span
                            key={stg}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0055ff] border border-blue-200/80 text-[11px] font-bold"
                          >
                            ✓ {labels[stg] || `Stage ${stg}`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-semibold">
                    <span>{dp.quiz_questions_count || dp.test_questions_count || 20} Qs</span>
                    <span className="mx-1.5">•</span>
                    <span>{dp.time_limit_mins || 20} Mins</span>
                  </div>

                  <button
                    onClick={() => setSelectedDailyPracticeId(dp.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white font-black text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer min-h-[40px]"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TET COURSE CARDS & MATERIALS EXPLORER (3-COLUMN RESPONSIVE GRID) ================= */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#061b36] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#0055ff]" />
            <span>TET Course Packages & Learning Materials</span>
          </h3>
          <span className="text-xs sm:text-sm text-slate-500 font-semibold">Select course to begin sequential learning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {tetCards.length > 0 ? (
            tetCards.map((card) => (
              <div
                key={card.card_id || card.id}
                className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-5 sm:p-6 shadow-xs card-interactive flex flex-col justify-between space-y-4 sm:space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-[#061b36] tracking-tight">
                      {card.title}
                    </h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200">
                      {card.class_range}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">{card.class_range}</span>
                    <span className="text-slate-400">{card.lesson_count_label || "25 Lessons"}</span>
                  </div>

                  <button
                    onClick={() => onNavigateToLearning(card.paper_type, card.start_class)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group min-h-[44px]"
                  >
                    <span>{card.button_text || `OPEN ${card.title} →`}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Default Standard Cards */
            <>
              <div className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-5 sm:p-6 shadow-xs card-interactive flex flex-col justify-between space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-[#061b36] tracking-tight">TET-1</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200">
                      Classes 1–8
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">Classes 1–8</span>
                    <span className="text-slate-400">25 Lessons</span>
                  </div>
                  <button
                    onClick={() => onNavigateToLearning("paper1", 1)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group min-h-[44px]"
                  >
                    <span>OPEN TET-1 →</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-5 sm:p-6 shadow-xs card-interactive flex flex-col justify-between space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-[#061b36] tracking-tight">TET-2</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200">
                      Classes 6–12
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    6 முதல் 12 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
                    <span className="text-[#061b36] font-bold">Classes 6–12</span>
                    <span className="text-slate-400">25 Lessons</span>
                  </div>
                  <button
                    onClick={() => onNavigateToLearning("paper2", 6)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group min-h-[44px]"
                  >
                    <span>OPEN TET-2 →</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 3RD CARD: MATERIALS EXPLORER (OFFICIAL TN TEXTBOOKS & NOTES) */}
          <div className="bg-white border border-slate-200/90 hover:border-[#0055ff]/40 rounded-2xl p-5 sm:p-6 shadow-xs card-interactive flex flex-col justify-between space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-[#061b36] tracking-tight">Materials Explorer</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Classes 1–12
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                1 முதல் 12 ஆம் வகுப்பு வரை அனைத்துப் பாடங்களின் அதிகாரப்பூர்வ PDF மற்றும் வீடியோ வழிகாட்டிகள்
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
                <span className="text-[#061b36] font-bold">Classes 1–12</span>
                <span className="text-slate-400">PDFs & Notes</span>
              </div>

              <button
                onClick={() => onNavigateToMaterials && onNavigateToMaterials()}
                className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer group min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 mr-1 text-[#0055ff] group-hover:text-white" />
                <span>OPEN MATERIALS EXPLORER →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIGHTNING EDUCATION NEWS (INSHORTS-STYLE AI LIVE FEED) ================= */}
      <NewsSection lang={lang} />

      {/* ANNOUNCEMENT DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                    selectedAnnouncement.priority === "urgent"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-blue-100 text-[#0055ff] border border-blue-200"
                  }`}
                >
                  {selectedAnnouncement.priority || "ANNOUNCEMENT"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{selectedAnnouncement.date}</span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#061b36] mb-2">{selectedAnnouncement.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {selectedAnnouncement.content}
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAILY PRACTICE MODAL RUNNER */}
      {selectedDailyPracticeId && (
        <DailyPracticeModal
          practiceId={selectedDailyPracticeId}
          onClose={() => setSelectedDailyPracticeId(null)}
          user={user}
          lang={lang}
        />
      )}

    </div>
  );
}
