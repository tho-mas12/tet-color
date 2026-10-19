import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  ChevronRight, 
  Languages,
  Award,
  Info,
  UserCheck,
  Clock,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Flame,
  Radio,
  Video,
  ExternalLink
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import LessonStudyView from "./LessonStudyView";

export default function LearningPage({ user, lang = "en" }) {
  const [tetPaper, setTetPaper] = useState(() => {
    return localStorage.getItem("tet_paper_choice") || "paper1";
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    const saved = localStorage.getItem("tet_selected_class");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    const initialPaper = localStorage.getItem("tet_paper_choice") || "paper1";
    return initialPaper === "paper1" ? 1 : 6;
  });

  const [selectedSubject, setSelectedSubject] = useState("Tamil");
  const [selectedMedium, setSelectedMedium] = useState("Tamil Medium");
  const [learningStructure, setLearningStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [streakCount, setStreakCount] = useState(user?.streak_count || 0);
  const [liveMeetings, setLiveMeetings] = useState([]);

  const t = translations[lang] || translations.en;

  // Filter classes based on candidate's TET Paper selection
  const classes = tetPaper === "paper1" 
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : tetPaper === "paper2"
    ? [6, 7, 8, 9, 10, 11, 12]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const classColorMap = {
    1: { active: "bg-[#e52b50] text-white border-[#e52b50]", inactive: "bg-[#e52b50]/10 text-[#e52b50] border-[#e52b50]/30 hover:bg-[#e52b50]/20" },
    2: { active: "bg-[#0066ff] text-white border-[#0066ff]", inactive: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/30 hover:bg-[#0066ff]/20" },
    3: { active: "bg-[#00b027] text-white border-[#00b027]", inactive: "bg-[#00b027]/10 text-[#00b027] border-[#00b027]/30 hover:bg-[#00b027]/20" },
    4: { active: "bg-[#7d00e5] text-white border-[#7d00e5]", inactive: "bg-[#7d00e5]/10 text-[#7d00e5] border-[#7d00e5]/30 hover:bg-[#7d00e5]/20" },
    5: { active: "bg-[#ff7a00] text-white border-[#ff7a00]", inactive: "bg-[#ff7a00]/10 text-[#ff7a00] border-[#ff7a00]/30 hover:bg-[#ff7a00]/20" },
    6: { active: "bg-[#00a896] text-white border-[#00a896]", inactive: "bg-[#00a896]/10 text-[#00a896] border-[#00a896]/30 hover:bg-[#00a896]/20" },
    7: { active: "bg-[#ff0055] text-white border-[#ff0055]", inactive: "bg-[#ff0055]/10 text-[#ff0055] border-[#ff0055]/30 hover:bg-[#ff0055]/20" },
    8: { active: "bg-[#0033cc] text-white border-[#0033cc]", inactive: "bg-[#0033cc]/10 text-[#0033cc] border-[#0033cc]/30 hover:bg-[#0033cc]/20" },
    9: { active: "bg-[#5c00e6] text-white border-[#5c00e6]", inactive: "bg-[#5c00e6]/10 text-[#5c00e6] border-[#5c00e6]/30 hover:bg-[#5c00e6]/20" },
    10: { active: "bg-[#8d4b00] text-white border-[#8d4b00]", inactive: "bg-[#8d4b00]/10 text-[#8d4b00] border-[#8d4b00]/30 hover:bg-[#8d4b00]/20" },
    11: { active: "bg-[#0066ff] text-white border-[#0066ff]", inactive: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/30 hover:bg-[#0066ff]/20" },
    12: { active: "bg-[#ff2a00] text-white border-[#ff2a00]", inactive: "bg-[#ff2a00]/10 text-[#ff2a00] border-[#ff2a00]/30 hover:bg-[#ff2a00]/20" },
  };

  const baseSubjects = ["Tamil", "English", "Mathematics", "Science", "Social Science"];
  const higherSubjects = [
    "Physics", "Chemistry", "Botany", "Zoology", 
    "Computer Science", "Commerce", "Economics", "Accountancy"
  ];
  
  const subjects = selectedClass <= 10 
    ? baseSubjects 
    : ["Tamil", "English", ...higherSubjects];

  // Store paper choice & adjust selected class to stay within valid range
  useEffect(() => {
    localStorage.setItem("tet_paper_choice", tetPaper);
    if (tetPaper === "paper1" && selectedClass > 8) {
      setSelectedClass(1);
    } else if (tetPaper === "paper2" && selectedClass < 6) {
      setSelectedClass(6);
    }
  }, [tetPaper]);

  useEffect(() => {
    loadUserStreak();
  }, [user]);

  const loadUserStreak = async () => {
    try {
      const email = user ? user.email : "student@tet.com";
      const data = await fetchApi(`/dashboard?email=${encodeURIComponent(email)}`);
      if (data?.user?.streak_count !== undefined) {
        setStreakCount(data.user.streak_count);
      }
    } catch (err) {
      console.error("Streak load error in LearningPage:", err);
    }
  };

  useEffect(() => {
    if (selectedSubject === "Tamil") {
      setSelectedMedium("Tamil Medium");
    } else if (selectedSubject === "English") {
      setSelectedMedium("English Medium");
    }
  }, [selectedSubject]);

  useEffect(() => {
    loadStructure();
  }, [selectedClass, selectedSubject, selectedMedium, user]);

  const loadStructure = async () => {
    setLoading(true);
    try {
      const email = user ? user.email : "student@tet.com";
      const data = await fetchApi(
        `/learning/structure?class_num=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}&medium=${encodeURIComponent(selectedMedium)}&user_email=${encodeURIComponent(email)}`
      );
      setLearningStructure(data);
    } catch (err) {
      console.error("Learning structure error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveMeetings();
  }, []);

  const loadLiveMeetings = async () => {
    try {
      const meetings = await fetchApi("/meetings/active");
      if (Array.isArray(meetings)) {
        setLiveMeetings(meetings);
      }
    } catch (err) {
      console.error("Live Meetings error in LearningPage:", err);
    }
  };

  // Filter & deduplicate live meetings for the selected TET Paper
  const courseMeetings = (liveMeetings || []).filter((meeting) => {
    if (meeting.is_active === false) return false;
    const text = `${meeting.title || ""} ${meeting.description || ""}`.toLowerCase();
    const isPaper1 = text.includes("paper 1") || text.includes("paper-1") || text.includes("tet 1") || text.includes("tet-1") || text.includes("classes 1") || text.includes("class 1");
    const isPaper2 = text.includes("paper 2") || text.includes("paper-2") || text.includes("tet 2") || text.includes("tet-2") || text.includes("classes 6") || text.includes("class 6");
    
    if (tetPaper === "paper1") {
      if (isPaper2 && !isPaper1) return false;
      return true;
    }
    if (tetPaper === "paper2") {
      if (isPaper1 && !isPaper2) return false;
      return true;
    }
    return true;
  });

  const uniqueCourseMeetings = [];
  const seenMeetingKeys = new Set();
  for (const m of courseMeetings) {
    const key = `${m.title}_${m.meeting_link || m.meeting_url}`;
    if (!seenMeetingKeys.has(key)) {
      seenMeetingKeys.add(key);
      uniqueCourseMeetings.push(m);
    }
  }

  // Milestone Badges tailored to selected TET Paper
  const badges = [
    {
      id: "day15",
      name: lang === "ta" ? "15-நாள் சாதனையாளர்" : "15-Day Scholar",
      required_streak: 15,
      unlocked: streakCount >= 15,
      icon: "Zap"
    },
    {
      id: "day30",
      name: lang === "ta" ? "30-நாள் மாஸ்டர்" : "30-Day Master",
      required_streak: 30,
      unlocked: streakCount >= 30,
      icon: "Award"
    },
    {
      id: "day90",
      name: lang === "ta" ? "90-நாள் நிபுணர்" : "90-Day Veteran",
      required_streak: 90,
      unlocked: streakCount >= 90,
      icon: "ShieldCheck"
    },
    {
      id: "day180",
      name: lang === "ta" ? "180-நாள் வெற்றியாளர்" : "180-Day Titan",
      required_streak: 180,
      unlocked: streakCount >= 180,
      icon: "Sparkles"
    },
    {
      id: "day365",
      name: lang === "ta" ? "365-நாள் வைரம்" : "365-Day Diamond Legend",
      required_streak: 365,
      unlocked: streakCount >= 365,
      icon: "Crown"
    }
  ];

  const motivationQuote = tetPaper === "paper1"
    ? t.tet1MotivationQuote
    : t.tet2MotivationQuote;

  const motivationTitle = tetPaper === "paper1"
    ? t.tet1MotivationTitle
    : t.tet2MotivationTitle;

  const badgesTitle = tetPaper === "paper1"
    ? t.tet1BadgesTitle
    : t.tet2BadgesTitle;

  const badgesDesc = tetPaper === "paper1"
    ? t.tet1BadgesDesc
    : t.tet2BadgesDesc;

  if (activeLessonId) {
    return (
      <LessonStudyView
        lessonId={activeLessonId}
        user={user}
        lang={lang}
        onBack={() => {
          setActiveLessonId(null);
          loadStructure();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in text-[#071c38]">
      
      {/* Header Banner & TET Track Selector */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#0055ff] font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>{tetPaper === "paper1" ? "TET-1 Candidate Portal" : "TET-2 Candidate Portal"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#061b36] tracking-tight">
              {t.learningTitle}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              {t.learningSubtitle}
            </p>
          </div>

          {/* TET-1 vs TET-2 Interactive Switcher */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 w-full sm:w-auto shadow-2xs">
            <button
              onClick={() => {
                setTetPaper("paper1");
                setSelectedClass(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                tetPaper === "paper1"
                  ? "bg-[#0055ff] text-white shadow-sm ring-1 ring-[#0055ff]"
                  : "text-[#061b36] hover:bg-slate-200/70"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>TET-1 (Classes 1–8)</span>
            </button>
            <button
              onClick={() => {
                setTetPaper("paper2");
                setSelectedClass(6);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                tetPaper === "paper2"
                  ? "bg-[#0055ff] text-white shadow-sm ring-1 ring-[#0055ff]"
                  : "text-[#061b36] hover:bg-slate-200/70"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>TET-2 (Classes 6–12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= LIVE / SCHEDULED COURSE MEETINGS NOTIFICATION ================= */}
      {uniqueCourseMeetings && uniqueCourseMeetings.length > 0 && (
        <div className="space-y-3">
          {uniqueCourseMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                meeting.is_live
                  ? "bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border-rose-500/60 shadow-rose-500/20"
                  : "bg-white border-blue-200 text-[#061b36] shadow-xs"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {meeting.is_live ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center space-x-1.5 shadow-md animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                      <span>🔴 LIVE NOW</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0055ff] border border-blue-200 flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#0055ff]" />
                      <span>Live Meeting Scheduled</span>
                    </span>
                  )}

                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    meeting.is_live ? "bg-white/10 text-rose-200" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tetPaper === "paper1" ? "TET-1 Course" : "TET-2 Course"}
                  </span>

                  <span className={`text-xs font-bold ${meeting.is_live ? "text-rose-200" : "text-slate-500"}`}>
                    {meeting.start_time ? meeting.start_time.replace("T", " ") : ""} {meeting.end_time ? `– ${meeting.end_time.replace("T", " ")}` : ""}
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-black tracking-tight ${meeting.is_live ? "text-white" : "text-[#061b36]"}`}>
                  {meeting.title}
                </h3>

                {meeting.description && (
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed ${meeting.is_live ? "text-rose-100/90" : "text-slate-600"}`}>
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
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
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

      {/* MOTIVATION QUOTE BOX & STREAK BADGES (DYNAMICALLY ADAPTED FOR TET 1 vs TET 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Motivation Box */}
        <div className={`lg:col-span-5 border rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-all ${
          tetPaper === "paper1"
            ? "bg-gradient-to-br from-blue-50/80 via-sky-50/50 to-indigo-50/60 border-blue-200/80"
            : "bg-gradient-to-br from-indigo-50/80 via-slate-50 to-sky-50/60 border-indigo-200/80"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center space-x-1.5 shadow-2xs border ${
                tetPaper === "paper1"
                  ? "bg-white text-[#0055ff] border-blue-200"
                  : "bg-white text-indigo-700 border-indigo-200"
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{motivationTitle}</span>
              </span>

              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-white/80 border border-slate-200 text-slate-600">
                {tetPaper === "paper1" ? "Primary & Upper Primary" : "High School & Higher Sec"}
              </span>
            </div>

            <blockquote className="text-base sm:text-lg font-black text-[#061b36] italic leading-relaxed my-2.5">
              "{motivationQuote}"
            </blockquote>
          </div>

          <div className="pt-4 border-t border-blue-200/60 flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Streak: <b className="text-[#061b36]">{streakCount} {t.streakDays}</b></span>
            </span>
            <span className="text-[#0055ff] font-extrabold">
              {tetPaper === "paper1" ? "TET-1 Curriculum Focus" : "TET-2 Pedagogy Focus"}
            </span>
          </div>
        </div>

        {/* Streak Achievement Badges Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-black text-[#061b36] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#0055ff]" />
                  <span>{badgesTitle}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {badgesDesc}
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-black text-[#0055ff] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                {badges.filter(b => b.unlocked).length} / {badges.length} {t.unlockedText}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {badges.map((b) => {
                const isUnlocked = b.unlocked;
                return (
                  <div
                    key={b.id}
                    className={`relative p-3 rounded-2xl border text-center transition-all ${
                      isUnlocked
                        ? "bg-blue-50/60 border-blue-300 shadow-xs ring-1 ring-blue-200/50"
                        : "bg-slate-50 border-slate-200/90 opacity-60 grayscale"
                    }`}
                  >
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✓
                      </div>
                    )}

                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-[#061b36] to-[#0055ff] p-0.5 shadow-2xs flex items-center justify-center mb-2">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                        {b.id === "day15" && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
                        {b.id === "day30" && <Award className="w-4 h-4 text-orange-500" />}
                        {b.id === "day90" && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                        {b.id === "day180" && <Sparkles className="w-4 h-4 text-emerald-600" />}
                        {b.id === "day365" && <Crown className="w-4 h-4 text-[#0055ff] fill-[#0055ff]" />}
                      </div>
                    </div>

                    <h4 className="text-xs font-black text-[#061b36] truncate leading-tight" title={b.name}>
                      {b.name}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                      {b.required_streak} {t.streakDays}
                    </span>

                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                        isUnlocked
                          ? "bg-[#0055ff] text-white"
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

      {/* SELECTORS: CLASS, SUBJECT & MEDIUM */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Class Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider block">
              {t.matStep1Title} ({tetPaper === "paper1" ? "Classes 1 to 8" : "Classes 6 to 12"})
            </label>
            <span className="text-xs font-bold text-[#0055ff] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {classes.length} Classes ({tetPaper === "paper1" ? "Paper 1" : "Paper 2"})
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
            {classes.map((c) => {
              const isSelected = selectedClass === c;
              const styleMap = classColorMap[c] || classColorMap[1];
              return (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedClass(c);
                    if (c > 10 && !higherSubjects.includes(selectedSubject) && selectedSubject !== "Tamil" && selectedSubject !== "English") {
                      setSelectedSubject("Physics");
                    }
                  }}
                  className={`py-2.5 px-1 rounded-2xl font-black text-xs transition-all duration-200 border cursor-pointer min-h-[56px] flex flex-col items-center justify-center card-interactive ${
                    isSelected
                      ? `${styleMap.active} shadow-md scale-105 ring-2 ring-offset-1`
                      : `${styleMap.inactive}`
                  }`}
                >
                  <span className="block text-xs opacity-90 font-bold uppercase tracking-wider leading-none">வகுப்பு</span>
                  <span className="text-lg font-black leading-tight mt-0.5">{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject & Medium Selection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
          <div className={`${selectedSubject !== "Tamil" && selectedSubject !== "English" ? "md:col-span-8" : "md:col-span-12"} space-y-2`}>
            <label className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider block">
              {t.matStep2Title}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border truncate cursor-pointer ${
                    selectedSubject === s
                      ? "bg-[#0055ff] text-white border-[#0055ff] shadow-xs"
                      : "bg-slate-50 text-[#061b36] border-slate-200 hover:bg-blue-50/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {selectedSubject !== "Tamil" && selectedSubject !== "English" && (
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider block flex items-center space-x-1">
                <Languages className="w-3.5 h-3.5 text-[#0055ff]" />
                <span>Medium</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMedium("Tamil Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    selectedMedium === "Tamil Medium"
                      ? "bg-[#061b36] text-white border-[#061b36] shadow-xs"
                      : "bg-slate-50 text-[#061b36] border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t.mediumTamil}
                </button>
                <button
                  onClick={() => setSelectedMedium("English Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    selectedMedium === "English Medium"
                      ? "bg-[#061b36] text-white border-[#061b36] shadow-xs"
                      : "bg-slate-50 text-[#061b36] border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t.mediumEnglish}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SEQUENTIAL TERMS & LESSONS LIST */}
      {loading ? (
        <div className="py-16 text-center text-[#0055ff] text-xs font-semibold">
          Loading Class {selectedClass} {selectedSubject} ({selectedMedium}) curriculum structure...
        </div>
      ) : !learningStructure ? null : (
        <div className="space-y-6">
          {learningStructure.terms.map((termObj, tIdx) => {
            const isTermLocked = termObj.is_locked;
            const displayTermName = lang === "ta" ? termObj.term.replace("Term-", "பருவம் ") : termObj.term.replace("Term-", "Term ");
            return (
              <div
                key={termObj.term}
                className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-xs transition-all ${
                  isTermLocked
                    ? "border-slate-200 opacity-60 bg-slate-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        isTermLocked
                          ? "bg-slate-200 text-slate-500"
                          : termObj.is_completed
                          ? "bg-blue-50 text-[#0055ff] border border-[#0055ff]/30"
                          : "bg-[#0055ff] text-white"
                      }`}
                    >
                      {isTermLocked ? <Lock className="w-4 h-4" /> : tIdx + 1}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#093c85]">{displayTermName} Lessons</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {isTermLocked
                          ? t.termLockedMsg
                          : termObj.is_completed
                          ? "✓ 100% Term Completed!"
                          : "Strict Sequential Progression"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isTermLocked
                        ? "bg-slate-100 text-slate-500"
                        : termObj.is_completed
                        ? "bg-blue-50 text-[#0055ff] border border-[#0055ff]/30"
                        : "bg-blue-50 text-[#0055ff] border border-[#0055ff]/30"
                    }`}
                  >
                    {isTermLocked ? t.lockedBadge : termObj.is_completed ? t.completedBadge : "ACTIVE TERM"}
                  </span>
                </div>

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {termObj.lessons.map((les) => {
                    const isLessonLocked = les.is_locked || isTermLocked;
                    const isCompleted = les.is_completed;

                    return (
                      <div
                        key={les.id}
                        className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                          isLessonLocked
                            ? "bg-slate-50/60 border-slate-200 text-slate-400"
                            : isCompleted
                            ? "bg-white border-[#0055ff]/40 shadow-xs"
                            : "bg-white border-slate-200 hover:border-[#0055ff]/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#0055ff]">
                              Lesson {les.lesson_order} • {les.medium}
                            </span>

                            {les.is_disabled_by_schedule ? (
                              <span className="flex items-center space-x-1 text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Unlocks: {les.available_at ? les.available_at.replace("T", " ") : "Scheduled"}</span>
                              </span>
                            ) : isLessonLocked ? (
                              <span className="flex items-center space-x-1 text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                                <Lock className="w-3.5 h-3.5" />
                                <span>{t.lockedBadge}</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="flex items-center space-x-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t.completedBadge} ({les.test_score}%)</span>
                              </span>
                            ) : les.test_score > 0 && les.test_score < 80 ? (
                              <span className="flex items-center space-x-1 text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-300">
                                <span>Quiz: {les.test_score}% (Need ≥80%)</span>
                              </span>
                            ) : (
                              <span className="text-xs text-[#0055ff] font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                In Progress
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-[#061b36] leading-snug">{les.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 line-clamp-2 leading-relaxed">{les.description}</p>
                        </div>

                        {/* 4 Stage Action Status Badges in Blue, Green, Orange, Purple */}
                        <div className="grid grid-cols-4 gap-1 py-2 border-y border-slate-100 text-xs font-black text-center">
                          <span className={les.stage1_pdf ? "text-[#0055ff]" : "text-slate-300"}>📘 BOOK</span>
                          <span className={les.stage2_video ? "text-[#00a651]" : "text-slate-300"}>▶️ VIDEO</span>
                          <span className={les.stage3_questions ? "text-[#ff7a00]" : "text-slate-300"}>❓ Qs</span>
                          <span className={les.stage4_test ? "text-[#8a00e6]" : "text-slate-300"}>📝 QUIZ</span>
                        </div>

                        <button
                          onClick={() => {
                            if (les.is_disabled_by_schedule) {
                              alert(`This lesson is scheduled and will unlock on ${les.available_at ? les.available_at.replace('T', ' ') : 'the set time'}.`);
                              return;
                            }
                            if (!isLessonLocked) setActiveLessonId(les.id);
                          }}
                          disabled={isLessonLocked}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer min-h-[44px] ${
                            isLessonLocked
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              : isCompleted
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-[#0055ff] hover:bg-blue-700 text-white shadow-xs"
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>
                            {les.is_disabled_by_schedule
                              ? `Locked until ${les.available_at ? les.available_at.replace('T', ' ') : ''}`
                              : isLessonLocked
                              ? t.lockedBadge
                              : isCompleted
                              ? "Review Completed Stages"
                              : "Continue Lesson"}
                          </span>
                          {!isLessonLocked && <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

