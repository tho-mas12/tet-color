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
  Trophy,
  FileText,
  FileCheck,
  HelpCircle,
  Zap,
  Crown,
  ShieldCheck,
  Flame,
  Radio,
  Video,
  ExternalLink,
  Share2,
  Search,
  Filter,
  CreditCard,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import LessonStudyView from "./LessonStudyView";
import EnrollmentModal from "./EnrollmentModal";

export default function LearningPage({ user, lang = "en", onShare, directLesson, onClearDirectLesson }) {
  const [tetPaper, setTetPaper] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("tet-2") || path.includes("tet2")) return "paper2";
    if (path.includes("tet-1") || path.includes("tet1")) return "paper1";
    return localStorage.getItem("tet_paper_choice") || "paper1";
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("class");
      if (q) {
        const parsed = parseInt(q, 10);
        if (parsed >= 1 && parsed <= 12) return parsed;
      }
    } catch (e) {}
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

  // Parse direct lesson and stage from URL or directLesson prop
  const getDirectLessonFromUrl = () => {
    try {
      const pathname = window.location.pathname || "";
      const match = pathname.match(/^(?:\/learning)?\/lesson\/(\d+)/i);
      const params = new URLSearchParams(window.location.search);
      const q = params.get("lesson");
      const id = parseInt(match ? match[1] : q, 10);
      const stageParam = params.get("stage");
      const s = stageParam ? parseInt(stageParam, 10) : 1;
      const stage = [1, 2, 3, 4, 5].includes(s) ? s : 1;
      if (!isNaN(id) && id > 0) {
        return { lessonId: id, stage };
      }
    } catch (e) {}
    return null;
  };

  const initialUrlLesson = getDirectLessonFromUrl();
  const [activeLessonId, setActiveLessonId] = useState(directLesson?.lessonId || initialUrlLesson?.lessonId || null);
  const [directStage, setDirectStage] = useState(directLesson?.stage || initialUrlLesson?.stage || 1);
  const [streakCount, setStreakCount] = useState(user?.streak_count || 0);
  const [liveMeetings, setLiveMeetings] = useState([]);

  // Auth & Enrollment verification state
  const [isEnrolled, setIsEnrolled] = useState(user?.role === "admin");
  const [checkingEnrollment, setCheckingEnrollment] = useState(!user || user?.role !== "admin");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [publicSettings, setPublicSettings] = useState({ course_price: 999, razorpay_key_id: "" });

  // Lesson Search and Status Filter states
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");
  const [lessonStatusFilter, setLessonStatusFilter] = useState("all");

  // Special Classes in TET 1 and TET 2 (Psychology, Tamil Grammar, English Grammar, PYQ)
  const specialModules = [
    { class_num: 101, title: lang === "ta" ? "குழந்தை மேம்பாடு & உளவியல் (Psychology)" : "Psychology (Tamil / English)", shortName: "Psychology", tamilLabel: "உளவியல்", icon: "🧠", subject: "Psychology", hasMedium: true },
    { class_num: 102, title: lang === "ta" ? "தமிழ் இலக்கணம் (Tamil Grammar)" : "Tamil Grammar", shortName: "Tamil Gram.", tamilLabel: "தமிழ் இலக்.", icon: "📖", subject: "Tamil Grammar", hasMedium: false },
    { class_num: 103, title: lang === "ta" ? "ஆங்கில இலக்கணம் (English Grammar)" : "English Grammar", shortName: "Eng. Gram.", tamilLabel: "ஆங்கில இலக்.", icon: "🔤", subject: "English Grammar", hasMedium: false },
    { class_num: 104, title: lang === "ta" ? "முந்தைய ஆண்டு வினாத்தாள்கள் (PYQ)" : "Previous Year Question Papers", shortName: "Old Papers", tamilLabel: "வினாத்தாள்", icon: "📜", subject: "Previous Year Papers", hasMedium: false }
  ];

  useEffect(() => {
    checkEnrollmentStatus();
  }, [user]);

  const checkEnrollmentStatus = async () => {
    if (!user) {
      setIsEnrolled(false);
      setCheckingEnrollment(false);
      return;
    }
    if (user.role === "admin") {
      setIsEnrolled(true);
      setCheckingEnrollment(false);
      return;
    }
    try {
      const res = await fetchApi(`/enrollments/my-status?email=${encodeURIComponent(user.email)}`);
      if (res && res.is_enrolled) {
        setIsEnrolled(true);
      } else {
        setIsEnrolled(false);
      }
    } catch (e) {
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
    try {
      const settings = await fetchApi("/public-settings");
      if (settings) setPublicSettings(settings);
    } catch (e) {}
  };

  useEffect(() => {
    if (directLesson && directLesson.lessonId) {
      setActiveLessonId(directLesson.lessonId);
      if (directLesson.stage) {
        setDirectStage(directLesson.stage);
      }
    }
  }, [directLesson]);

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
    101: { active: "bg-[#8a00e6] text-white border-[#8a00e6]", inactive: "bg-[#8a00e6]/10 text-[#8a00e6] border-[#8a00e6]/30 hover:bg-[#8a00e6]/20" },
    102: { active: "bg-[#00a651] text-white border-[#00a651]", inactive: "bg-[#00a651]/10 text-[#00a651] border-[#00a651]/30 hover:bg-[#00a651]/20" },
    103: { active: "bg-[#0284c7] text-white border-[#0284c7]", inactive: "bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/30 hover:bg-[#0284c7]/20" },
    104: { active: "bg-[#ff7a00] text-white border-[#ff7a00]", inactive: "bg-[#ff7a00]/10 text-[#ff7a00] border-[#ff7a00]/30 hover:bg-[#ff7a00]/20" },
  };

  const baseSubjects = ["Tamil", "English", "Mathematics", "Science", "Social Science"];
  const higherSubjects = [
    "Physics", "Chemistry", "Botany", "Zoology", 
    "Computer Science", "Commerce", "Economics", "Accountancy"
  ];
  
  const subjects = selectedClass <= 10 
    ? baseSubjects 
    : selectedClass <= 12
    ? ["Tamil", "English", ...higherSubjects]
    : [selectedSubject];

  // Store paper choice & adjust selected class to stay within valid range and sync URL
  useEffect(() => {
    if (activeLessonId) return; // CRITICAL: NEVER overwrite URL when viewing a lesson study!
    localStorage.setItem("tet_paper_choice", tetPaper);
    let validClass = selectedClass;
    if (selectedClass <= 12) {
      if (tetPaper === "paper1" && selectedClass > 8) {
        validClass = 1;
        setSelectedClass(1);
      } else if (tetPaper === "paper2" && selectedClass < 6) {
        validClass = 6;
        setSelectedClass(6);
      }
    }
    localStorage.setItem("tet_selected_class", validClass.toString());
    try {
      const paperSlug = tetPaper === "paper2" ? "tet-2" : "tet-1";
      window.history.replaceState(null, "", `/course/${paperSlug}?class=${validClass}`);
    } catch (e) {}
  }, [tetPaper, selectedClass, activeLessonId]);

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
    if (isEnrolled || user?.role === "admin") {
      loadStructure();
    }
  }, [selectedClass, selectedSubject, selectedMedium, user, isEnrolled]);

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
      try {
        localStorage.removeItem("tet_stored_meetings");
      } catch (e) {}
      const meetings = await fetchApi("/meetings/active");
      if (Array.isArray(meetings)) {
        const genuineMeetings = meetings.filter(
          m => !m.title?.includes("TN TET Paper-2 Live Science & Social Science Special Class")
        );
        setLiveMeetings(genuineMeetings);
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
      icon: "Trophy"
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

  // Enrollment check loading state
  if (checkingEnrollment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-4 animate-fade-in">
        <Loader2 className="w-10 h-10 text-[#0055ff] animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {lang === "ta" ? "பாட அணுகல் சரிபார்க்கப்படுகிறது..." : "Verifying Course Enrollment Access..."}
        </p>
      </div>
    );
  }

  if (activeLessonId) {
    if (!isEnrolled && user?.role !== "admin") {
      return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-fade-in text-center">
          <div className="flex justify-start">
            <button
              onClick={() => {
                setActiveLessonId(null);
                if (onClearDirectLesson) onClearDirectLesson();
                const paperSlug = tetPaper === "paper2" ? "tet-2" : "tet-1";
                window.history.replaceState(null, "", `/course/${paperSlug}?class=${selectedClass}`);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0055ff] hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "ta" ? "பாடத்திட்டத்திற்குத் திரும்பு" : "Back to Curriculum"}</span>
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 via-[#061b36] to-blue-950 text-white rounded-3xl p-6 sm:p-12 border border-blue-400/30 shadow-2xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-[#0055ff]/30 border border-[#0055ff] flex items-center justify-center mx-auto text-white shadow-xl">
              <Lock className="w-10 h-10 text-sky-400" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest inline-block shadow-xs">
                {lang === "ta" ? "பூட்டப்பட்ட பாடம் (Course Access Required)" : "Course Access Required"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {lang === "ta" ? "இப்பாடத்தை படிக்க பதிவு செய்யவும்" : "Enroll to Unlock Lesson & Complete TET Course"}
              </h2>
              <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
                {lang === "ta" 
                  ? "நீங்கள் அணுக முயன்ற பாடம் மற்றும் அதன் 5 நிலைகள் (PDF, முக்கியக் குறிப்புகள், காணொளி, மாதிரி வினாக்கள், தேர்வுகள்) கட்டணப் பாடத்திட்டத்தில் மட்டுமே கிடைக்கும்."
                  : "The lesson you selected (with all 5 stages: PDF, Short Notes, Video Explanation, Practice Q&A, and Timed Test) requires active course enrollment."}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowEnrollmentModal(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0055ff] to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{lang === "ta" ? `இப்போதே பதிவு செய்து அணுகலை திறக்க (₹${publicSettings.course_price || 999}) →` : `Enroll & Unlock Lesson Access (₹${publicSettings.course_price || 999}) →`}</span>
              </button>
            </div>
          </div>

          <EnrollmentModal
            isOpen={showEnrollmentModal}
            onClose={() => setShowEnrollmentModal(false)}
            user={user}
            coursePrice={publicSettings.course_price || 999}
            razorpayKey={publicSettings.razorpay_key_id}
            lang={lang}
            onEnrollmentSuccess={() => {
              setIsEnrolled(true);
              setShowEnrollmentModal(false);
            }}
          />
        </div>
      );
    }

    return (
      <LessonStudyView
        lessonId={activeLessonId}
        user={user}
        lang={lang}
        initialStage={directStage}
        onBack={() => {
          setActiveLessonId(null);
          if (onClearDirectLesson) onClearDirectLesson();
          const paperSlug = tetPaper === "paper2" ? "tet-2" : "tet-1";
          window.history.replaceState(null, "", `/course/${paperSlug}?class=${selectedClass}`);
          loadStructure();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in text-[#071c38]">
      
      {/* Header Banner & TET Track Selector */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#0055ff] font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>{tetPaper === "paper1" ? "TET-1 Candidate Portal" : "TET-2 Candidate Portal"}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-[#061b36] tracking-tight">
              {t.learningTitle}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              {t.learningSubtitle}
            </p>
          </div>

          {/* TET-1 vs TET-2 Interactive Switcher & Inline Share Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center p-1 sm:p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 flex-1 sm:w-auto shadow-2xs">
              <button
                onClick={() => {
                  setTetPaper("paper1");
                  setSelectedClass(1);
                }}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tetPaper === "paper1"
                    ? "bg-[#0055ff] text-white shadow-sm ring-1 ring-[#0055ff]"
                    : "text-[#061b36] hover:bg-slate-200/70"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">
                  <span className="inline sm:hidden">TET-1 (1–8)</span>
                  <span className="hidden sm:inline">TET-1 (Classes 1–8)</span>
                </span>
              </button>
              <button
                onClick={() => {
                  setTetPaper("paper2");
                  setSelectedClass(6);
                }}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tetPaper === "paper2"
                    ? "bg-[#0055ff] text-white shadow-sm ring-1 ring-[#0055ff]"
                    : "text-[#061b36] hover:bg-slate-200/70"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">
                  <span className="inline sm:hidden">TET-2 (6–12)</span>
                  <span className="hidden sm:inline">TET-2 (Classes 6–12)</span>
                </span>
              </button>
            </div>

            {onShare && (
              <button
                onClick={onShare}
                className="p-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-blue-200 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Share Course Link"
              >
                <Share2 className="w-4 h-4 text-[#0055ff]" />
                <span className="hidden sm:inline">{lang === "ta" ? "பகிர்க" : "Share"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= LIVE / SCHEDULED COURSE MEETINGS NOTIFICATION ================= */}
      {(isEnrolled || user?.role === "admin") && uniqueCourseMeetings && uniqueCourseMeetings.length > 0 && (
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

      {/* ================= CONDITIONAL DISPLAY: PAYWALL VS CURRICULUM ================= */}
      {!isEnrolled && user?.role !== "admin" ? (
        /* ENROLLMENT LOCK BARRIER FOR UNPAID CANDIDATES - MODULE CONTENT COMPLETELY HIDDEN */
        <div className="bg-gradient-to-br from-slate-900 via-[#061b36] to-blue-950 text-white rounded-3xl p-6 sm:p-12 border border-blue-400/30 shadow-2xl space-y-8 my-4 text-center max-w-4xl mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-[#0055ff]/30 border border-[#0055ff] flex items-center justify-center mx-auto text-white shadow-xl">
            <Lock className="w-10 h-10 text-sky-400" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest inline-block shadow-xs">
              {lang === "ta" ? "அங்கீகரிக்கப்பட்ட ஆசிரியர் தகுதிப் பாடத்திட்டம்" : "Official Education Platform Curriculum"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {lang === "ta" ? "முழு TET பயிற்சி வகுப்புகளை அணுக பதிவு செய்யவும்" : "Enroll to Unlock Complete TET Preparation Course"}
            </h2>
            <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
              {lang === "ta" 
                ? "கட்டணம் செலுத்திய பிறகு மட்டுமே பாடங்கள், தேர்வுகள் மற்றும் குறிப்புகள் திறக்கப்படும். TET 1 மற்றும் TET 2 க்கான 1 முதல் 12 ஆம் வகுப்பு பாடப்புத்தகங்கள், உளவியல், இலக்கணம் மற்றும் முந்தைய ஆண்டு வினாத்தாள்களை உடனடியாக அணுக இப்போதே பதிவு செய்யவும்."
                : "Course modules and learning materials are accessible only after successful enrollment. Complete your enrollment to unlock all Classes 1 to 12 curriculum, 5-Stage comprehensive study system, unit practice questions, psychology, grammar & timed final exams."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">Classes 1 to 12</h4>
              <p className="text-[11px] text-slate-300">Complete curriculum for Paper 1 & 2</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">5-Stage System</h4>
              <p className="text-[11px] text-slate-300">PDF, Notes, Video, Practice & Tests</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">Special Modules</h4>
              <p className="text-[11px] text-slate-300">Psychology, Grammar & Solved PYQ</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
              <h4 className="text-xs font-bold text-white">State Rank</h4>
              <p className="text-[11px] text-slate-300">Instant benchmark & performance rank</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowEnrollmentModal(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0055ff] to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{lang === "ta" ? `இப்போதே பதிவு செய்து அணுகலை திறக்க (₹${publicSettings.course_price || 999}) →` : `Enroll & Unlock Course Access Now (₹${publicSettings.course_price || 999}) →`}</span>
            </button>
            <p className="text-[11px] text-sky-300/80 font-semibold mt-3">
              {lang === "ta" ? "🔒 பாதுகாப்பான கட்டணம் • உடனடி முழு அணுகல் (TET 1 + TET 2 + நேரலை வகுப்புகள்)" : "🔒 100% Secure Checkout • Instant Full Access (TET 1 + TET 2 + Live Interactive Classes)"}
            </p>
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED & ENROLLED: FULL CURRICULUM ================= */
        <>
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
                    } else if (c <= 10 && !baseSubjects.includes(selectedSubject)) {
                      setSelectedSubject("Tamil");
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

          {/* SPECIAL TET MODULES / CLASSES (COMPACT BUTTONS LIKE CLASS BUTTONS) */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#061b36] uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#0055ff]" />
                <span>{lang === "ta" ? "சிறப்புப் பாடங்கள்" : "Special Class Modules"}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                TET 1 & TET 2
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {specialModules.map((sm) => {
                const isSelected = selectedClass === sm.class_num;
                const styleMap = classColorMap[sm.class_num] || {
                  active: "bg-[#0055ff] text-white border-[#0055ff]",
                  inactive: "bg-[#0055ff]/10 text-[#0055ff] border-[#0055ff]/30 hover:bg-[#0055ff]/20"
                };
                return (
                  <button
                    key={sm.class_num}
                    onClick={() => {
                      setSelectedClass(sm.class_num);
                      setSelectedSubject(sm.subject);
                      if (!sm.hasMedium) {
                        setSelectedMedium("Tamil Medium");
                      }
                    }}
                    className={`py-2.5 px-1 rounded-2xl font-black text-xs transition-all duration-200 border cursor-pointer min-h-[56px] flex flex-col items-center justify-center card-interactive text-center ${
                      isSelected
                        ? `${styleMap.active} shadow-md scale-105 ring-2 ring-offset-1`
                        : `${styleMap.inactive}`
                    }`}
                    title={sm.title}
                  >
                    <span className="text-base sm:text-lg leading-none">{sm.icon}</span>
                    <span className="text-[11px] sm:text-xs font-black leading-tight mt-1 truncate max-w-full px-0.5">
                      {lang === "ta" ? sm.tamilLabel : sm.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject & Medium Selection */}
        {(() => {
          const showMedium = (selectedClass <= 12 && selectedSubject !== "Tamil" && selectedSubject !== "English") || selectedClass === 101;
          return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-slate-100">
              <div className={`${showMedium ? "md:col-span-8" : "md:col-span-12"} space-y-2`}>
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

              {showMedium && (
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
          );
        })()}
      </div>

      {/* SEQUENTIAL TERMS & LESSONS LIST */}
      {loading ? (
        <div className="py-16 text-center text-[#0055ff] text-xs font-semibold">
          Loading Class {selectedClass} {selectedSubject} ({selectedMedium}) curriculum structure...
        </div>
      ) : !learningStructure ? null : (
        <div className="space-y-6">
          
          {/* SEARCH & FILTER CONTROLS FOR LESSONS (TASK 4) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lessonSearchQuery}
                onChange={(e) => setLessonSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "பாடத் தலைப்பு அல்லது அலகைத் தேடுக..." : "Search lesson title or chapter..."}
                className="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#061b36] focus:outline-none focus:border-[#0055ff] transition"
              />
              {lessonSearchQuery && (
                <button
                  onClick={() => setLessonSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 flex items-center space-x-1 shrink-0">
                <Filter className="w-3 h-3 text-[#0055ff]" />
                <span>{lang === "ta" ? "வடிகட்டு:" : "Filter:"}</span>
              </span>
              <button
                onClick={() => setLessonStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  lessonStatusFilter === "all"
                    ? "bg-[#0055ff] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lang === "ta" ? "அனைத்துப் பாடங்கள்" : "All Lessons"}
              </button>
              <button
                onClick={() => setLessonStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  lessonStatusFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lang === "ta" ? "முடிந்தவை (Completed)" : "Completed"}
              </button>
              <button
                onClick={() => setLessonStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  lessonStatusFilter === "pending"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lang === "ta" ? "நிலுவையில் (Pending)" : "Pending"}
              </button>
            </div>
          </div>

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
                {(() => {
                  const q = lessonSearchQuery.trim().toLowerCase();
                  const filteredLessons = (termObj.lessons || []).filter((les) => {
                    const matchesSearch = !q || 
                      (les.title && les.title.toLowerCase().includes(q)) ||
                      (les.description && les.description.toLowerCase().includes(q)) ||
                      String(les.lesson_order).includes(q);
                    const matchesStatus =
                      lessonStatusFilter === "all" ? true :
                      lessonStatusFilter === "completed" ? les.is_completed :
                      !les.is_completed;
                    return matchesSearch && matchesStatus;
                  });

                  if (filteredLessons.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-slate-400">
                        {lang === "ta" ? "தேடலுக்குரிய பாடங்கள் இந்த பருவத்தில் இல்லை." : "No lessons found matching your search / filter in this term."}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredLessons.map((les) => {
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

                        {/* 5 Stage Action Status Badges with Professional SVG Icons */}
                        <div className="grid grid-cols-5 gap-1 py-2 border-y border-slate-100 text-[11px] font-black text-center items-center">
                          <span className={`flex items-center justify-center space-x-1 ${les.stage1_pdf ? "text-[#0055ff]" : "text-slate-300"}`}>
                            <FileText className="w-3 h-3" />
                            <span>PDF</span>
                          </span>
                          <span className={`flex items-center justify-center space-x-1 ${les.stage2_short_notes ? "text-[#0284c7]" : "text-slate-300"}`}>
                            <FileCheck className="w-3 h-3" />
                            <span>NOTES</span>
                          </span>
                          <span className={`flex items-center justify-center space-x-1 ${les.stage2_video ? "text-[#00a651]" : "text-slate-300"}`}>
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </span>
                          <span className={`flex items-center justify-center space-x-1 ${les.stage3_questions ? "text-[#ff7a00]" : "text-slate-300"}`}>
                            <HelpCircle className="w-3 h-3" />
                            <span>TEST</span>
                          </span>
                          <span className={`flex items-center justify-center space-x-1 ${les.stage4_test ? "text-[#8a00e6]" : "text-slate-300"}`}>
                            <Award className="w-3 h-3" />
                            <span>EXAM</span>
                          </span>
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
              );
            })()}
          </div>
        );
      })}
    </div>
  )}
        </>
      )}

  {/* ENROLLMENT MODAL (TASK 2) */}
  <EnrollmentModal
    isOpen={showEnrollmentModal}
    onClose={() => setShowEnrollmentModal(false)}
    user={user}
    coursePrice={publicSettings.course_price || 999}
    razorpayKey={publicSettings.razorpay_key_id}
    lang={lang}
    onEnrollmentSuccess={() => {
      setIsEnrolled(true);
      setShowEnrollmentModal(false);
      loadStructure();
    }}
  />

</div>
  );
}

