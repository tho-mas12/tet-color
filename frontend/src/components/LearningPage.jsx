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
  UserCheck
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import LessonStudyView from "./LessonStudyView";

export default function LearningPage({ user, lang = "en" }) {
  const [tetPaper, setTetPaper] = useState(() => {
    return localStorage.getItem("tet_paper_choice") || "paper1";
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    const initialPaper = localStorage.getItem("tet_paper_choice") || "paper1";
    return initialPaper === "paper1" ? 1 : 6;
  });

  const [selectedSubject, setSelectedSubject] = useState("Tamil");
  const [selectedMedium, setSelectedMedium] = useState("Tamil Medium");
  const [learningStructure, setLearningStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);

  const t = translations[lang] || translations.en;

  // Filter classes based on candidate's TET Paper selection
  const classes = tetPaper === "paper1" 
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [6, 7, 8, 9, 10, 11, 12];
  
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
    if (selectedSubject === "Tamil") {
      setSelectedMedium("Tamil Medium");
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
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-7 animate-fade-in text-[#093c85]">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-[#0055ff] font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Sequential Study Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#093c85] tracking-tight">
          {t.learningTitle}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl font-medium">
          {t.learningSubtitle}
        </p>
      </div>

      {/* SELECTORS: CLASS, SUBJECT & MEDIUM */}

      {/* SELECTORS: CLASS, SUBJECT & MEDIUM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Class Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider block">
              {t.matStep1Title} ({tetPaper === "paper1" ? "Classes 1 to 8" : "Classes 6 to 12"})
            </label>
            <span className="text-[11px] font-extrabold text-[#0055ff]">
              {classes.length} Classes Available for {tetPaper === "paper1" ? "Paper 1" : "Paper 2"}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5">
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
                  className={`py-3 px-1 rounded-2xl font-black text-xs transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? `${styleMap.active} shadow-md scale-105 ring-2 ring-offset-1`
                      : `${styleMap.inactive}`
                  }`}
                >
                  <span className="block text-[10px] opacity-90 font-bold uppercase tracking-wider">வகுப்பு</span>
                  <span className="text-base font-black">{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject & Medium Selection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
          <div className="md:col-span-8 space-y-2">
            <label className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider block">
              {t.matStep2Title}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border truncate cursor-pointer ${
                    selectedSubject === s
                      ? "bg-[#0055ff] text-white border-[#0055ff] shadow-xs"
                      : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-blue-50/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {selectedSubject !== "Tamil" && (
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider block flex items-center space-x-1">
                <Languages className="w-3.5 h-3.5 text-[#0055ff]" />
                <span>Medium</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMedium("Tamil Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    selectedMedium === "Tamil Medium"
                      ? "bg-[#093c85] text-white border-[#093c85] shadow-xs"
                      : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t.mediumTamil}
                </button>
                <button
                  onClick={() => setSelectedMedium("English Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    selectedMedium === "English Medium"
                      ? "bg-[#093c85] text-white border-[#093c85] shadow-xs"
                      : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-slate-100"
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

                            {isLessonLocked ? (
                              <span className="flex items-center space-x-1 text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                                <Lock className="w-3 h-3" />
                                <span>{t.lockedBadge}</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="flex items-center space-x-1 text-xs text-[#0055ff] font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-[#0055ff]/30">
                                <CheckCircle2 className="w-3 h-3 text-[#0055ff]" />
                                <span>{t.completedBadge} ({les.test_score}%)</span>
                              </span>
                            ) : (
                              <span className="text-xs text-[#0055ff] font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                                Unlocked
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-[#093c85] leading-snug">{les.title}</h4>
                          <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-2">{les.description}</p>
                        </div>

                        {/* 4 Stage Action Status Badges in Blue, Green, Orange, Purple */}
                        <div className="grid grid-cols-4 gap-1 py-1.5 border-y border-slate-100 text-[10px] font-black text-center">
                          <span className={les.stage1_pdf ? "text-[#0055ff]" : "text-slate-300"}>📘 BOOK</span>
                          <span className={les.stage2_video ? "text-[#00a651]" : "text-slate-300"}>▶️ VIDEO</span>
                          <span className={les.stage3_questions ? "text-[#ff7a00]" : "text-slate-300"}>❓ Qs</span>
                          <span className={les.stage4_test ? "text-[#8a00e6]" : "text-slate-300"}>📝 QUIZ</span>
                        </div>

                        <button
                          onClick={() => !isLessonLocked && setActiveLessonId(les.id)}
                          disabled={isLessonLocked}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                            isLessonLocked
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              : isCompleted
                              ? "bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-[#0055ff]/30"
                              : "bg-[#0055ff] hover:bg-blue-700 text-white shadow-xs"
                          }`}
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{isLessonLocked ? t.lockedBadge : isCompleted ? "Review Stages" : "Continue Lesson"}</span>
                          {!isLessonLocked && <ChevronRight className="w-3.5 h-3.5" />}
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

