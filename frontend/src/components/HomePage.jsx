import React from "react";
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
  UserCheck
} from "lucide-react";

export default function HomePage({ onOpenLogin, onOpenRegister, lang = "en" }) {
  const isTa = lang === "ta";

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in text-[#061b36]">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#061b36] via-[#092d62] to-[#0055ff] text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl">
        {/* Subtle background glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-14 relative z-10">
          
          {/* Left Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            
            {/* Official Badge Pill */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-sky-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {isTa ? "தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு (TNTET) பிரத்யேக தளம்" : "TN Teacher Eligibility Test (TNTET) Official Learning Portal"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {isTa ? (
                <>
                  ஆசிரியர் கனவை நனவாக்கும் <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-200 to-white">
                    முழுமையான கற்றல் களம்
                  </span>
                </>
              ) : (
                <>
                  Empowering Future <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-200 to-white">
                    Educators of Tamil Nadu
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-sky-100 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
              {isTa ? (
                "வகுப்பு 1 முதல் 12 வரையிலான தமிழ்நாடு SCERT பாடப்புத்தகக் குறிப்புகள், 4 படிநிலை பாடத் திட்டங்கள், 80% தேர்ச்சி தினசரி மாதிரித் தேர்வுகள் மற்றும் நேரடி ஆசிரியர் பயிற்சி வகுப்புகள்."
              ) : (
                "Comprehensive Class 1–12 SCERT textbook curriculum, 4-stage mastery modules, timed daily practice exams with 80% passing criteria, and live Google Meet faculty sessions."
              )}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-[#0055ff] hover:bg-sky-50 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer group"
              >
                <LogIn className="w-5 h-5 text-[#0055ff] group-hover:translate-x-0.5 transition-transform" />
                <span>{isTa ? "மாணவர் / ஆசிரியர் உள்நுழைவு" : "Enter Candidate Portal"}</span>
                <ArrowRight className="w-4 h-4 text-[#0055ff]" />
              </button>

              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold text-sm sm:text-base transition-all hover:scale-102 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserCheck className="w-5 h-5 text-sky-300" />
                <span>{isTa ? "புதிய பதிவு (Register Free)" : "Register New Account"}</span>
              </button>
            </div>

            {/* Trust Counters Strip */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 border-t border-white/15 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                <div className="text-[11px] text-sky-200 font-medium">{isTa ? "இலவசப் பாடத்திட்டம்" : "Free Syllabus"}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">Class 1–12</div>
                <div className="text-[11px] text-sky-200 font-medium">{isTa ? "SCERT நூல்கள்" : "SCERT Materials"}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300">80% Pass</div>
                <div className="text-[11px] text-sky-200 font-medium">{isTa ? "தேர்ச்சி அளவுகோல்" : "Standard Benchmark"}</div>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Card */}
          <div className="w-full max-w-md lg:max-w-md shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5">
              
              <div className="flex items-center space-x-3.5 border-b border-white/15 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
                  <img
                    src="/logo.jpg"
                    alt="TN Teacher Emblem"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {isTa ? "தமிழ்நாடு ஆசிரியர் கல்வி" : "Tamil Nadu TET Portal"}
                  </h3>
                  <p className="text-xs text-sky-200 font-semibold">
                    {isTa ? "தாள் 1 & தாள் 2 பிரத்யேக பயிற்சி" : "Paper 1 & Paper 2 Specialized Track"}
                  </p>
                </div>
              </div>

              {/* Quick Feature Bullets */}
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/10">
                  <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{isTa ? "பாடவாரியான SCERT குறிப்புகள் & PDF பதிவிறக்கம்" : "Subject-wise SCERT Notes & Free PDF Download"}</span>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                  <span>{isTa ? "தினசரி மாதிரிப் பயிற்சி & நேரக் கட்டுப்பாடு தேர்வுகள்" : "Daily Practice Tests with Timed Exam Submissions"}</span>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/10">
                  <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{isTa ? "நேரடி கூகுள் மீட் ஆசிரியர் வழிகாட்டுதல் வகுப்புகள்" : "Live Google Meet Interactive Faculty Guidance"}</span>
                </div>
              </div>

              {/* Login Button on Card */}
              <button
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isTa ? "உடனடி நுழைவு →" : "Candidate Sign In →"}</span>
              </button>

            </div>
          </div>

        </div>
      </section>


      {/* ================= 4 CORE PILLARS SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#0055ff] block">
            {isTa ? "சிறப்பு அம்சங்கள்" : "Key Highlights"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0055ff] flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isTa ? "4 படிநிலைப் பாடம்" : "4-Stage Learning"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "பாடக் குறிப்பு, வீடியோ வகுப்பு, பயிற்சி வினாக்கள் மற்றும் 80% தேர்ச்சி கட்டாயத் தேர்வு கொண்ட தொடர் படிநிலைகள்."
                : "Sequential progression: Stage 1 Study Notes, Stage 2 Video Class, Stage 3 Practice, and Stage 4 Timed Exam."}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-orange-500/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isTa ? "தினசரி மாதிரித் தேர்வுகள்" : "Daily Practice Tests"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "பாடவாரியான முக்கிய வினாக்களுடன் AI இயக்கும் மாதிரித் தேர்வுகள், உடனடி மதிப்பீடு மற்றும் விளக்கக் குறிப்புகள்."
                : "Daily practice exams generated from curriculum topics with real-time scoring, answer keys, and pedagogical explanations."}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-purple-500/40 transition group space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-2xs">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isTa ? "நேரடி ஆசிரியர் வகுப்புகள்" : "Live Expert Sessions"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isTa 
                ? "கூகுள் மீட் நேரடி ஊடாடல் மூலம் ஆசிரியர்களிடம் நேரடியாக சந்தேகங்களைத் தீர்த்துக் கொள்ளும் வாய்ப்பு."
                : "Direct live Google Meet classroom interactions with senior faculty for question solving and subject doubt clearance."}
            </p>
          </div>

        </div>
      </section>


      {/* ================= SYLLABUS TRACKS OVERVIEW ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#0055ff] block">
            {isTa ? "தேர்வுப் பிரிவுகள்" : "Target Examination Tracks"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isTa ? "டி.என். டெட் தாள் 1 மற்றும் தாள் 2" : "Comprehensive Syllabus Tracks"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Paper 1 Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#0055ff] text-xs font-black border border-blue-200">
                PRIMARY TRACK
              </span>
              <span className="text-xs font-bold text-slate-400">Class 1 to 5 / 8</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
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
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-[#0055ff] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isTa ? "தாள் 1 பாடங்களைத் திறக்க உள்நுழைக" : "Login to Access Paper 1"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Paper 2 Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                UPPER PRIMARY & HIGH SCHOOL
              </span>
              <span className="text-xs font-bold text-slate-400">Class 6 to 8 / 12</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
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
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isTa ? "தாள் 2 பாடங்களைத் திறக்க உள்நுழைக" : "Login to Access Paper 2"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>


      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-[#061b36] via-[#0055ff] to-[#0284C7] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              {isTa ? "இப்போதே தொடங்குங்கள்" : "Start Learning Today"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {isTa 
                ? "ஆசிரியர் தகுதித் தேர்வில் சிறந்த மதிப்பெண் பெறத் தயாரா?"
                : "Ready to Achieve Your TN Teacher Eligibility Goal?"}
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-medium max-w-xl mx-auto">
              {isTa 
                ? "உங்கள் கணக்கில் உள்நுழைந்து உடனடி மாதிரிப் பயிற்சிகள் மற்றும் பாடக்குறிப்புகளைப் பெறுங்கள்."
                : "Sign in to access your customized learning dashboard, study modules, and timed examination simulations."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-[#0055ff] hover:bg-sky-50 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isTa ? "போர்ட்டலில் நுழைக (Candidate Sign In)" : "Sign In to Candidate Portal"}</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white border border-white/25 font-bold text-sm transition cursor-pointer"
            >
              <span>{isTa ? "புதிய மாணவர் பதிவு (Register)" : "Register as New Candidate"}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
