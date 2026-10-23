import React, { useState } from "react";
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Library
} from "lucide-react";

export const CLASSES_LIST = [
  {
    num: 1,
    tamil: "1-ஆம் வகுப்பு",
    english: "Class 1",
    paper: "paper1",
    paperLabel: "TET தாள் 1",
    description: "அடிப்படை தமிழ், கணிதம், ஆங்கிலம் & சூழ்நிலையியல்",
    gradient: "from-blue-600 via-indigo-600 to-blue-700",
    bgSoft: "bg-blue-50/80",
    border: "border-blue-200 hover:border-blue-500",
    badge: "bg-blue-100 text-blue-900 border-blue-300",
    iconColor: "text-blue-600"
  },
  {
    num: 2,
    tamil: "2-ஆம் வகுப்பு",
    english: "Class 2",
    paper: "paper1",
    paperLabel: "TET தாள் 1",
    description: "தமிழ் வாசிப்பு, எளிய கணிதம் & பொது அறிவு",
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
    bgSoft: "bg-sky-50/80",
    border: "border-sky-200 hover:border-sky-500",
    badge: "bg-sky-100 text-sky-900 border-sky-300",
    iconColor: "text-sky-600"
  },
  {
    num: 3,
    tamil: "3-ஆம் வகுப்பு",
    english: "Class 3",
    paper: "paper1",
    paperLabel: "TET தாள் 1",
    description: "தமிழ், ஆங்கிலம், கணிதம் & அறிவியல் அறிமுகம்",
    gradient: "from-cyan-600 via-teal-600 to-blue-600",
    bgSoft: "bg-cyan-50/80",
    border: "border-cyan-200 hover:border-cyan-500",
    badge: "bg-cyan-100 text-cyan-900 border-cyan-300",
    iconColor: "text-cyan-600"
  },
  {
    num: 4,
    tamil: "4-ஆம் வகுப்பு",
    english: "Class 4",
    paper: "paper1",
    paperLabel: "TET தாள் 1",
    description: "அறிவியல், சமூக அறிவியல், தமிழ் & கணிதம்",
    gradient: "from-teal-600 via-emerald-600 to-teal-700",
    bgSoft: "bg-teal-50/80",
    border: "border-teal-200 hover:border-teal-500",
    badge: "bg-teal-100 text-teal-900 border-teal-300",
    iconColor: "text-teal-600"
  },
  {
    num: 5,
    tamil: "5-ஆம் வகுப்பு",
    english: "Class 5",
    paper: "paper1",
    paperLabel: "TET தாள் 1",
    description: "தொடக்கப் பள்ளி நிறைவுத் தேர்வு & அனைத்துப் பாடங்கள்",
    gradient: "from-indigo-600 via-blue-600 to-indigo-700",
    bgSoft: "bg-indigo-50/80",
    border: "border-indigo-200 hover:border-indigo-500",
    badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
    iconColor: "text-indigo-600"
  },
  {
    num: 6,
    tamil: "6-ஆம் வகுப்பு",
    english: "Class 6",
    paper: "paper2",
    paperLabel: "TET தாள் 2",
    description: "நடுநிலைப் பள்ளி தொடக்கம் • பருவம் 1, 2, 3 பாடங்கள்",
    gradient: "from-purple-600 via-indigo-600 to-purple-700",
    bgSoft: "bg-purple-50/80",
    border: "border-purple-200 hover:border-purple-500",
    badge: "bg-purple-100 text-purple-900 border-purple-300",
    iconColor: "text-purple-600"
  },
  {
    num: 7,
    tamil: "7-ஆம் வகுப்பு",
    english: "Class 7",
    paper: "paper2",
    paperLabel: "TET தாள் 2",
    description: "அறிவியல், கணிதம், சமூக அறிவியல், தமிழ் & ஆங்கிலம்",
    gradient: "from-fuchsia-600 via-purple-600 to-fuchsia-700",
    bgSoft: "bg-fuchsia-50/80",
    border: "border-fuchsia-200 hover:border-fuchsia-500",
    badge: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300",
    iconColor: "text-fuchsia-600"
  },
  {
    num: 8,
    tamil: "8-ஆம் வகுப்பு",
    english: "Class 8",
    paper: "paper2",
    paperLabel: "TET தாள் 2 & NMMS",
    description: "TET தாள் 2 & NMMS உதவித்தொகைத் தேர்வுக்கான முழு பாடங்கள்",
    gradient: "from-pink-600 via-rose-600 to-purple-600",
    bgSoft: "bg-pink-50/80",
    border: "border-pink-200 hover:border-pink-500",
    badge: "bg-pink-100 text-pink-900 border-pink-300",
    iconColor: "text-pink-600"
  },
  {
    num: 9,
    tamil: "9-ஆம் வகுப்பு",
    english: "Class 9",
    paper: "paper2",
    paperLabel: "TET தாள் 2 & TRUST",
    description: "உயர்நிலைப் பள்ளி • TRUST ஊரகத் தேர்வு & TET பாடங்கள்",
    gradient: "from-rose-600 via-orange-600 to-rose-700",
    bgSoft: "bg-rose-50/80",
    border: "border-rose-200 hover:border-rose-500",
    badge: "bg-rose-100 text-rose-900 border-rose-300",
    iconColor: "text-rose-600"
  },
  {
    num: 10,
    tamil: "10-ஆம் வகுப்பு",
    english: "Class 10",
    paper: "paper2",
    paperLabel: "TET தாள் 2 (SSLC)",
    description: "பத்தாம் வகுப்பு அரசுப் பொதுத்தேர்வு & TET முக்கிய பாடங்கள்",
    gradient: "from-amber-600 via-orange-600 to-amber-700",
    bgSoft: "bg-amber-50/80",
    border: "border-amber-200 hover:border-amber-500",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    iconColor: "text-amber-600"
  },
  {
    num: 11,
    tamil: "11-ஆம் வகுப்பு",
    english: "Class 11",
    paper: "paper2",
    paperLabel: "TET தாள் 2 (+1)",
    description: "மேல்நிலைப் பள்ளி முதலாம் ஆண்டு • இயற்பியல், வேதியியல், வரலாறு",
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    bgSoft: "bg-emerald-50/80",
    border: "border-emerald-200 hover:border-emerald-500",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    iconColor: "text-emerald-600"
  },
  {
    num: 12,
    tamil: "12-ஆம் வகுப்பு",
    english: "Class 12",
    paper: "paper2",
    paperLabel: "TET தாள் 2 (+2)",
    description: "மேல்நிலைப் பள்ளி இரண்டாம் ஆண்டு • விரிவான TET & போட்டித் தேர்வு பாடங்கள்",
    gradient: "from-teal-600 via-cyan-600 to-blue-700",
    bgSoft: "bg-teal-50/80",
    border: "border-teal-200 hover:border-teal-500",
    badge: "bg-teal-100 text-teal-900 border-teal-300",
    iconColor: "text-teal-600"
  }
];

export default function MobileClassesModal({ isOpen, onClose, onNavigate, lang = "ta" }) {
  const [filterPaper, setFilterPaper] = useState("all"); // "all", "paper1", "paper2"
  const [activeMode, setActiveMode] = useState("learning"); // "learning" or "materials"

  if (!isOpen) return null;

  const isTa = lang === "ta";

  const filteredClasses = CLASSES_LIST.filter(c => {
    if (filterPaper === "paper1") return c.paper === "paper1";
    if (filterPaper === "paper2") return c.paper === "paper2";
    return true;
  });

  const handleSelectClass = (cls, forceMode = null) => {
    const mode = forceMode || activeMode;
    onClose();

    if (mode === "materials") {
      onNavigate(`/materials?class=${cls.num}`, "materials");
    } else {
      // Direct jump to TET Learning / Practice for this class
      if (cls.paper === "paper1") {
        onNavigate(`/course/tet-1?class=${cls.num}`, "learning");
      } else {
        onNavigate(`/course/tet-2?class=${cls.num}`, "learning");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#061b36] via-[#082852] to-[#061b36] text-white p-4 sm:p-5 relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center space-x-2">
                  <span>{isTa ? "வகுப்புகள் (1 முதல் 12)" : "Classes (1 to 12)"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-2xs">
                    {isTa ? "நேரடி அணுகல்" : "Direct Access"}
                  </span>
                </h2>
                <p className="text-xs text-sky-200 font-medium mt-0.5">
                  {isTa ? "படிக்க அல்லது பயிற்சி செய்ய விரும்பும் வகுப்பைத் தேர்ந்தெடுக்கவும்" : "Select any class to jump directly to learning & tests"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paper Filter Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setFilterPaper("all")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                filterPaper === "all"
                  ? "bg-white text-[#061b36] shadow-sm"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {isTa ? "அனைத்தும் (1-12)" : "All (1-12)"}
            </button>
            <button
              onClick={() => setFilterPaper("paper1")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                filterPaper === "paper1"
                  ? "bg-blue-500 text-white shadow-sm ring-1 ring-blue-300"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {isTa ? "தாள் 1 (1–5)" : "Paper 1 (1–5)"}
            </button>
            <button
              onClick={() => setFilterPaper("paper2")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                filterPaper === "paper2"
                  ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-300"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {isTa ? "தாள் 2 (6–12)" : "Paper 2 (6–12)"}
            </button>
          </div>
        </div>

        {/* Mode Selector Strip */}
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200/80 text-xs">
          <span className="font-bold text-slate-600">
            {isTa ? "இலக்கு முறை:" : "Target Mode:"}
          </span>
          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveMode("learning")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                activeMode === "learning"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isTa ? "பாடங்கள் & தேர்வு" : "Lessons & Quiz"}</span>
            </button>
            <button
              onClick={() => setActiveMode("materials")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                activeMode === "materials"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>{isTa ? "பாடநூல் PDF" : "Textbooks PDF"}</span>
            </button>
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredClasses.map((cls) => (
              <div
                key={cls.num}
                onClick={() => handleSelectClass(cls)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${cls.bgSoft} ${cls.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {/* Class Number Badge */}
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cls.gradient} text-white font-black text-base flex items-center justify-center shadow-sm`}>
                      {cls.num}
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${cls.badge}`}>
                      {cls.paperLabel}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-[#0055ff] transition-colors">
                    {isTa ? cls.tamil : cls.english}
                  </h3>

                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {cls.description}
                  </p>
                </div>

                {/* Direct Action Link */}
                <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-black text-[#0055ff]">
                  <span className="flex items-center space-x-1">
                    {activeMode === "materials" ? (
                      <>
                        <Library className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">{isTa ? "பாடநூல்" : "Book"}</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isTa ? "பயிற்சி" : "Practice"}</span>
                      </>
                    )}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access to TN Textbooks Archive & News */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate("/materials", "materials");
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-2">
                <Library className="w-4 h-4" />
                <span>{isTa ? "அனைத்து அரசுப் பாடநூல்கள் (Archive)" : "TN Textbooks Archive"}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate("/news", "news");
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{isTa ? "மின்னல் கல்விச் செய்திகள்" : "Minnal Education News"}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
          {isTa 
            ? "வகுப்பைத் தொட்டவுடன் அப்பிரிவிற்கான தேர்வு மற்றும் பாடங்கள் நேரடியாகத் திறக்கப்படும்."
            : "Tap any class to launch direct syllabus lessons and interactive benchmark quizzes."}
        </div>
      </div>
    </div>
  );
}
