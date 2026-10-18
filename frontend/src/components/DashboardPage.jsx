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
  ExternalLink,
  Video,
  Radio,
  FileText,
  Clock
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import DailyPracticeModal from "./DailyPracticeModal";
import NewsSection from "./NewsSection";

export default function DashboardPage({ user, onNavigateToLearning, onNavigateToMaterials, lang = "en" }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [tetCards, setTetCards] = useState([]);
  const [liveMeetings, setLiveMeetings] = useState([]);
  const [dailyPractices, setDailyPractices] = useState([]);
  const [selectedDailyPracticeId, setSelectedDailyPracticeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadDashboard();
    loadTetCards();
    loadLiveMeetings();
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

  const loadLiveMeetings = async () => {
    try {
      const meetings = await fetchApi("/meetings/active");
      if (Array.isArray(meetings)) {
        setLiveMeetings(meetings);
      }
    } catch (err) {
      console.error("Live Meetings error:", err);
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
  const quote = dashboardData?.quote || "Success is built on small daily study steps.";
  const badges = dashboardData?.badges || [];
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
                
                {/* Highest Unlocked Badge Logo Displayed Right Next to Name */}
                {badges.filter(b => b.unlocked).length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-black flex items-center space-x-1.5 shadow-2xs">
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
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#061b36] to-[#0055ff] hover:from-[#05152a] hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer min-h-[44px]"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.continueLearningBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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

      {/* ================= LIVE MEETINGS BANNER (IF ACTIVE / LIVE NOW) ================= */}
      {liveMeetings && liveMeetings.length > 0 && (
        <div className="space-y-3">
          {liveMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                meeting.is_live
                  ? "bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border-rose-500/60 shadow-rose-500/10"
                  : "bg-white border-slate-200 text-[#061b36]"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2.5">
                  {meeting.is_live ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center space-x-1.5 shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                      <span>🔴 LIVE NOW</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0055ff] border border-blue-200 flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#0055ff]" />
                      <span>Live Meeting Scheduled</span>
                    </span>
                  )}
                  <span className={`text-xs font-bold ${meeting.is_live ? "text-rose-200" : "text-slate-500"}`}>
                    {meeting.start_time ? meeting.start_time.replace("T", " ") : ""} {meeting.end_time ? `– ${meeting.end_time.replace("T", " ")}` : ""}
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-black tracking-tight ${meeting.is_live ? "text-white" : "text-[#061b36]"}`}>
                  {meeting.title}
                </h3>

                {meeting.description && (
                  <p className={`text-xs sm:text-sm font-medium ${meeting.is_live ? "text-rose-100/90" : "text-slate-600"}`}>
                    {meeting.description}
                  </p>
                )}
              </div>

              <a
                href={meeting.meeting_link || meeting.meeting_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all hover:scale-105 cursor-pointer shrink-0 ${
                  meeting.is_live
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-[#0055ff] hover:bg-blue-700 text-white"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{meeting.is_live ? "Join Live Meeting Now ↗" : "Open Meeting Link ↗"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

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

                    <h4 className="text-xs font-bold text-[#061b36] truncate">{b.name}</h4>
                    <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                      {b.required_streak} {t.streakDays}
                    </span>

                    <span
                      className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-extrabold uppercase rounded-full ${
                        isUnlocked
                          ? "bg-blue-100 text-[#0055ff] border border-[#0055ff]/30"
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

      {/* ================= LIGHTNING EDUCATION NEWS (INSHORTS-STYLE AI LIVE FEED) ================= */}
      <NewsSection lang={lang} />

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
