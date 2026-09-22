import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  ChevronRight, 
  Languages
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import LessonStudyView from "./LessonStudyView";

export default function LearningPage({ user, lang = "en" }) {
  const [selectedClass, setSelectedClass] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState("Tamil");
  const [selectedMedium, setSelectedMedium] = useState("Tamil Medium");
  const [learningStructure, setLearningStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);

  const t = translations[lang] || translations.en;

  const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const baseSubjects = ["Tamil", "English", "Mathematics", "Science", "Social Science"];
  const higherSubjects = [
    "Physics", "Chemistry", "Botany", "Zoology", 
    "Computer Science", "Commerce", "Economics", "Accountancy"
  ];
  
  const subjects = selectedClass <= 10 
    ? baseSubjects 
    : ["Tamil", "English", ...higherSubjects];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in text-[#1E3A8A]">
      
      {/* Header Banner */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center space-x-2 text-[#0284C7] mb-1.5 font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Sequential Study Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
          {t.learningTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
          {t.learningSubtitle}
        </p>
      </div>

      {/* SELECTORS: CLASS, SUBJECT & MEDIUM */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Class Selection */}
        <div>
          <label className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wider block mb-2.5">
            {t.matStep1Title}
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedClass(c);
                  if (c > 10 && !higherSubjects.includes(selectedSubject) && selectedSubject !== "Tamil" && selectedSubject !== "English") {
                    setSelectedSubject("Physics");
                  }
                }}
                className={`py-2 rounded-xl font-bold text-xs transition-all duration-150 border ${
                  selectedClass === c
                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                    : "bg-slate-50 text-[#1E3A8A] border-slate-200 hover:bg-sky-50"
                }`}
              >
                Class {c}
              </button>
            ))}
          </div>
        </div>

        {/* Subject & Medium Selection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-sky-100">
          <div className="md:col-span-8 space-y-2">
            <label className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wider block">
              {t.matStep2Title}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border truncate ${
                    selectedSubject === s
                      ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                      : "bg-slate-50 text-[#1E3A8A] border-slate-200 hover:bg-sky-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {selectedSubject !== "Tamil" && (
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wider block flex items-center space-x-1">
                <Languages className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Medium</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMedium("Tamil Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                    selectedMedium === "Tamil Medium"
                      ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                      : "bg-slate-50 text-[#1E3A8A] border-slate-200 hover:bg-sky-50"
                  }`}
                >
                  {t.mediumTamil}
                </button>
                <button
                  onClick={() => setSelectedMedium("English Medium")}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                    selectedMedium === "English Medium"
                      ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                      : "bg-slate-50 text-[#1E3A8A] border-slate-200 hover:bg-sky-50"
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
        <div className="py-16 text-center text-[#0284C7] text-xs font-semibold">
          Loading Class {selectedClass} {selectedSubject} ({selectedMedium}) curriculum structure...
        </div>
      ) : !learningStructure ? null : (
        <div className="space-y-6">
          {learningStructure.terms.map((termObj, tIdx) => {
            const isTermLocked = termObj.is_locked;
            const displayTermName = lang === "ta" ? termObj.term.replace("Term-", "பருவம்-") : termObj.term;
            return (
              <div
                key={termObj.term}
                className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-xs transition-all ${
                  isTermLocked
                    ? "border-sky-100 opacity-60 bg-slate-50/40"
                    : "border-sky-100"
                }`}
              >
                <div className="flex items-center justify-between border-b border-sky-100 pb-3.5 mb-5">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs ${
                        isTermLocked
                          ? "bg-slate-200 text-slate-500"
                          : termObj.is_completed
                          ? "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                          : "bg-[#0284C7] text-white"
                      }`}
                    >
                      {isTermLocked ? <Lock className="w-4 h-4" /> : tIdx + 1}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-[#1E3A8A]">{displayTermName} Lessons</h3>
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
                        ? "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                        : "bg-sky-50 text-[#0284C7] border border-[#0284C7]/30"
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
                            ? "bg-white border-[#0284C7]/40 shadow-xs"
                            : "bg-white border-sky-100 hover:border-[#0284C7]/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#0284C7]">
                              Lesson {les.lesson_order} • {les.medium}
                            </span>

                            {isLessonLocked ? (
                              <span className="flex items-center space-x-1 text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                                <Lock className="w-3 h-3" />
                                <span>{t.lockedBadge}</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="flex items-center space-x-1 text-[10px] text-[#0284C7] font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-[#0284C7]/30">
                                <CheckCircle2 className="w-3 h-3 text-[#0284C7]" />
                                <span>{t.completedBadge} ({les.test_score}%)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#0284C7] font-bold bg-sky-50 px-2 py-0.5 rounded-md">
                                Unlocked
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-[#1E3A8A] leading-snug">{les.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{les.description}</p>
                        </div>

                        {/* 4 Stage Status Indicators */}
                        <div className="grid grid-cols-4 gap-1 py-1.5 border-y border-sky-100 text-[10px] font-bold text-center">
                          <span className={les.stage1_pdf ? "text-[#0284C7]" : "text-slate-400"}>1. PDF</span>
                          <span className={les.stage2_video ? "text-[#0284C7]" : "text-slate-400"}>2. Video</span>
                          <span className={les.stage3_questions ? "text-[#0284C7]" : "text-slate-400"}>3. AI Qs</span>
                          <span className={les.stage4_test ? "text-[#0284C7]" : "text-slate-400"}>4. Test</span>
                        </div>

                        <button
                          onClick={() => !isLessonLocked && setActiveLessonId(les.id)}
                          disabled={isLessonLocked}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                            isLessonLocked
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              : isCompleted
                              ? "bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                              : "bg-[#0284C7] hover:bg-[#0369a1] text-white shadow-xs shadow-[#0284C7]/20"
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
