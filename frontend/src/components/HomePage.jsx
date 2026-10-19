import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Video, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  LogIn, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Layers,
  HelpCircle,
  Calendar,
  Flame,
  UserCheck,
  Check,
  Compass,
  MapPin,
  Activity
} from "lucide-react";
import { fetchApi } from "../api";

export default function HomePage({ onOpenLogin, onOpenRegister, lang = "en" }) {
  const isTa = lang === "ta";

  // Real-time Active Students Statistics
  const [stats, setStats] = useState({
    active_students: 0,
    live_count: 0,
    total_lessons: 2450,
    pass_rate: "80%",
    districts_count: 38
  });

  useEffect(() => {
    let isMounted = true;
    fetchApi("/public-stats")
      .then((data) => {
        if (isMounted && data && typeof data.active_students !== "undefined") {
          setStats(data);
        }
      })
      .catch((err) => {
        console.warn("Public stats load note:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in text-[#061b36] font-sans">
      
      {/* ================= LIGHT ACADEMIC HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6ff]/90 via-white to-[#f8fafc] border-b border-slate-200/80 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Academic Blueprint Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0055ff08_1px,transparent_1px),linear-gradient(to_bottom,#0055ff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-14 relative z-10">
          
          {/* Left Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            
            {/* Top Live Active Students Pill */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 px-4 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-xs text-xs font-semibold">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {stats.active_students} {isTa ? "மாணவர்கள் நேரலையில்" : "Live Students Enrolled"}
              </span>

              <span className="text-slate-300 hidden sm:inline">•</span>

              <span className="text-[#061b36] font-bold">
                {isTa ? "தாள் 1 & தாள் 2 பாடநெறி" : "Paper 1 & Paper 2 Comprehensive Track"}
              </span>
            </div>

            {/* Main Academic Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black tracking-tight text-[#061b36] leading-[1.15]">
              {isTa ? (
                <>
                  தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055ff] via-[#0284c7] to-[#061b36]">
                    அதிகாரப்பூர்வ கற்றல் மற்றும் பயிற்சி தளம்
                  </span>
                </>
              ) : (
                <>
                  Tamil Nadu Teacher Eligibility Test <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055ff] via-[#0284c7] to-[#061b36]">
                    Official Academic Learning & Exam Portal
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
              {isTa ? (
                "வகுப்பு 1 முதல் 12 வரையிலான தமிழ்நாடு SCERT பாடப்புத்தகக் குறிப்புகள், 4 படிநிலை பாடத் திட்டங்கள், 80% தேர்ச்சி தினசரி மாதிரித் தேர்வுகள் மற்றும் நேரடி ஆசிரியர் பயிற்சி வகுப்புகள்."
              ) : (
                "Official Class 1–12 SCERT textbook curriculum, 4-stage mastery modules, timed daily practice exams with 80% passing criteria, and live Google Meet faculty guidance."
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0055ff] hover:bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2.5 cursor-pointer group"
              >
                <LogIn className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                <span>{isTa ? "மாணவர் / ஆசிரியர் உள்நுழைவு" : "Enter Candidate Portal"}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#061b36] border border-slate-300/90 font-bold text-sm sm:text-base shadow-xs hover:border-slate-400 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <UserCheck className="w-5 h-5 text-[#0055ff]" />
                <span>{isTa ? "இலவச பதிவு (Register Free)" : "Register Free Account"}</span>
              </button>
            </div>

            {/* Academic Credential Bar */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isTa ? "100% இலவச பாடத்திட்டம்" : "100% Free Syllabus"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#0055ff]" />
                {isTa ? "38 மாவட்ட தேர்வர்கள்" : "38 Districts Covered"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                {isTa ? "80% தேர்ச்சி அளவுகோல்" : "80% Pass Benchmark"}
              </span>
            </div>

          </div>

          {/* Right Hero Visual Card — Academic Live Center */}
          <div className="w-full max-w-md lg:max-w-md shrink-0">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 space-y-5 relative">
              
              {/* Card Header */}
              <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#061b36] to-[#0055ff] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                  <img
                    src="/logo.jpg"
                    alt="TN Teacher Logo"
                    className="w-full h-full object-cover rounded-2xl border-2 border-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0055ff] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      ACADEMIC PORTAL
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#061b36] leading-tight mt-0.5">
                    {isTa ? "தமிழ்நாடு ஆசிரியர் கல்வி தளம்" : "TN Teacher Candidate Portal"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isTa ? "தாள் 1 & தாள் 2 பிரத்யேகப் பயிற்சி" : "Paper 1 & Paper 2 Specialized Track"}
                  </p>
                </div>
              </div>

              {/* LIVE ACTIVE STUDENTS COUNTER BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-100/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-[#061b36]">
                    <Users className="w-4 h-4 text-[#0055ff]" />
                    {isTa ? "நேரலை மாணவர்கள்" : "Live Active Students"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {isTa ? "நேரடி" : "LIVE NOW"}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-3xl font-black text-[#061b36] tracking-tight">
                    {stats.active_students}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {stats.active_students} {isTa ? "மாணவர்கள் இணைக்கப்பட்டுள்ளனர்" : "Students Online"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  {isTa 
                    ? "டி.என். டெட் போர்ட்டலில் தற்போது பதிவுசெய்து பயிலும் நேரடி மாணவர்கள்."
                    : "Real-time count of registered students preparing on TN Teacher Portal."}
                </p>
              </div>

              {/* Academic Highlights */}
              <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <BookOpen className="w-4 h-4 text-[#0055ff] shrink-0" />
                  <span>{isTa ? "வகுப்பு 1 முதல் 12 SCERT குறிப்புகள் & PDF" : "Class 1–12 SCERT Textbook Notes & PDF"}</span>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isTa ? "80% தேர்ச்சி அளவுகோல் கொண்ட மாதிரித் தேர்வு" : "Timed Daily Practice with 80% Pass Criterion"}</span>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Video className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{isTa ? "நேரடி கூகுள் மீட் ஆசிரியர் பயிற்சி வகுப்புகள்" : "Live Google Meet Faculty Interactive Sessions"}</span>
                </div>
              </div>

              {/* Enter Button */}
              <button
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-[#061b36] hover:bg-[#0055ff] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-101 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isTa ? "போர்ட்டலில் உடனடியாக நுழைக →" : "Sign In & Access Study Materials →"}</span>
              </button>

            </div>
          </div>

        </div>
      </section>


      {/* ================= 4 COLUMN INSTITUTIONAL METRICS STRIP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Stat 1: Active Students */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-[#0055ff]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {isTa ? "நேரடி மாணவர்கள்" : "Live Students"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0055ff] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#061b36] tracking-tight">
              {stats.active_students}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isTa ? "தளத்தில் இணைந்துள்ள நேரடி மாணவர்கள்" : "Enrolled candidates on portal"}
            </p>
          </div>

          {/* Stat 2: Syllabus Tracks */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {isTa ? "தேர்வுப் பாடத்திட்டம்" : "Syllabus Tracks"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              Paper 1 & 2
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isTa ? "தொடக்க & பட்டதாரி ஆசிரியர் பிரிவுகள்" : "Primary & Graduate Teacher Tracks"}
            </p>
          </div>

          {/* Stat 3: Curriculum Depth */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {isTa ? "பாடப் புத்தகங்கள்" : "SCERT Curriculum"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#061b36] tracking-tight">
              Class 1–12
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isTa ? "தமிழ் மற்றும் ஆங்கில வழி" : "Tamil & English Medium Notes"}
            </p>
          </div>

          {/* Stat 4: Benchmark Criteria */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {isTa ? "தேர்ச்சி அளவுகோல்" : "Passing Benchmark"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
              80% Standard
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isTa ? "கட்டாய தேர்ச்சி நெறிமுறை" : "Stage 4 rigorous pass criteria"}
            </p>
          </div>

        </div>
      </section>


      {/* ================= 4 CORE PEDAGOGICAL PILLARS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#0055ff] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
            {isTa ? "கற்றல் கட்டமைப்பு" : "Pedagogical Architecture"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#061b36] tracking-tight">
            {isTa ? "வெற்றிக்கான 4 படிநிலைக் கற்றல் முறை" : "Engineered for TNTET Examination Success"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isTa 
              ? "பாடப்புத்தகக் குறிப்புகள் முதல் மாதிரித் தேர்வுகள் வரை அனைத்தும் ஒரே தளத்தில்." 
              : "Structured syllabus progression combining textbook materials, video lessons, and timed exams."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-[#0055ff]/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0055ff] flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase text-[#0055ff] tracking-wider block">Stage 1</span>
            <h3 className="text-base font-black text-[#061b36]">
              {isTa ? "SCERT பாடக் குறிப்புகள்" : "SCERT E-Materials"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "1 முதல் 12-ஆம் வகுப்பு வரையிலான தமிழ் மற்றும் ஆங்கில வழி அரசுப் பாடப்புத்தகக் குறிப்புகள் மற்றும் PDF தொகுப்புகள்."
                : "Official Class 1–12 textbook study notes for Tamil Medium & English Medium with instant printable PDF downloads."}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase text-emerald-600 tracking-wider block">Stage 2</span>
            <h3 className="text-base font-black text-[#061b36]">
              {isTa ? "கருத்து விளக்க வகுப்புகள்" : "Faculty Video Lectures"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "முக்கிய கருத்துக்களுக்கான நிபுணர் விரிவுரைகள் மற்றும் கடினமான தலைப்புகளுக்கான எளிய வீடியோ விளக்கங்கள்."
                : "Curated video lectures breaking down complex pedagogical and scientific concepts with bilingual Tamil explanations."}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-orange-500/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase text-orange-600 tracking-wider block">Stage 3</span>
            <h3 className="text-base font-black text-[#061b36]">
              {isTa ? "பயிற்சி வினா வங்கி" : "Practice Question Bank"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "பாடவாரியான முக்கிய வினாக்களுடன் நேரக் கட்டுப்பாடற்ற சுய மதிப்பீட்டு மாதிரிப் பயிற்சி வினாக்கள்."
                : "Untimed diagnostic questions with instant answer explanations, pedagogical notes, and reference page links."}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-purple-500/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-2xs">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase text-purple-600 tracking-wider block">Stage 4</span>
            <h3 className="text-base font-black text-[#061b36]">
              {isTa ? "80% இறுதி மாதிரித் தேர்வு" : "80% Benchmark Exam"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "கட்டாய 80% தேர்ச்சி மதிப்பெண் கொண்ட நேரக் கட்டுப்பாடு தினசரி தேர்வு மற்றும் தொடர் கற்றல் அங்கீகாரம்."
                : "Timed simulation requiring 80% pass mark to unlock next lessons, building real examination endurance and habits."}
            </p>
          </div>

        </div>
      </section>


      {/* ================= SYLLABUS TRACKS OVERVIEW ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#0055ff] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
            {isTa ? "தேர்வுப் பிரிவுகள்" : "Target Examination Tracks"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#061b36] tracking-tight">
            {isTa ? "டி.என். டெட் தாள் 1 மற்றும் தாள் 2" : "Comprehensive Syllabus Tracks"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Paper 1 Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#0055ff] text-xs font-black border border-blue-200">
                PRIMARY TRACK (வகுப்பு 1 - 5)
              </span>
              <span className="text-xs font-bold text-slate-400">Class 1 to 5 / 8</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#061b36]">
                TN TET Paper 1 (தாள் 1)
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                {isTa
                  ? "தொடக்கப் பள்ளி ஆசிரியர் பணிக்குத் தகுதி பெறும் தேர்வர்களுக்கான முழுமையான வழிகாட்டல்."
                  : "Curriculum tailored for Primary Teachers covering Child Development, Language I & II, Mathematics, and Environmental Studies."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {["தமிழ் (Tamil)", "English", "Mathematics (கணிதம்)", "EVS (சூழ்நிலையியல்)", "Child Pedagogy"].map((sub, sIdx) => (
                <span key={sIdx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {sub}
                </span>
              ))}
            </div>

            <button
              onClick={onOpenLogin}
              className="w-full py-3 rounded-2xl bg-[#061b36] hover:bg-[#0055ff] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isTa ? "தாள் 1 பாடங்களைத் திறக்க உள்நுழைக" : "Login to Access Paper 1"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Paper 2 Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                GRADUATE TEACHER TRACK (வகுப்பு 6 - 12)
              </span>
              <span className="text-xs font-bold text-slate-400">Class 6 to 8 / 12</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#061b36]">
                TN TET Paper 2 (தாள் 2)
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                {isTa
                  ? "பட்டதாரி ஆசிரியர் (Graduate Teacher) பணிக்கான கணிதம், அறிவியல் மற்றும் சமூக அறிவியல் பாடங்கள்."
                  : "Specialized tracks for Mathematics & Science teachers and Social Science teachers with advanced Class 6–12 syllabus depth."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {["தமிழ் (Tamil)", "English", "Science (அறிவியல்)", "Social Science (சமூக அறிவியல்)", "Mathematics"].map((sub, sIdx) => (
                <span key={sIdx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {sub}
                </span>
              ))}
            </div>

            <button
              onClick={onOpenLogin}
              className="w-full py-3 rounded-2xl bg-[#061b36] hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isTa ? "தாள் 2 பாடங்களைத் திறக்க உள்நுழைக" : "Login to Access Paper 2"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
