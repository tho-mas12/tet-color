import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Video, 
  HelpCircle, 
  CheckCircle2, 
  Lock, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  Award,
  ChevronRight,
  Maximize2,
  X,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { fetchApi, getEmbedYoutubeUrl } from "../api";
import { translations } from "../translations";

export default function LessonStudyView({ lessonId, user, onBack, lang = "en" }) {
  const [lessonData, setLessonData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(1);

  const [isVideoModal, setIsVideoModal] = useState(false);

  const [questionsData, setQuestionsData] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [userPracticeAnswers, setUserPracticeAnswers] = useState({});

  const [testData, setTestData] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadLessonDetails();
  }, [lessonId]);

  useEffect(() => {
    let timer = null;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testActive, timeLeft]);

  const loadLessonDetails = async () => {
    setLoading(true);
    try {
      const email = user ? user.email : "student@tet.com";
      const res = await fetchApi(`/learning/lesson/${lessonId}?user_email=${encodeURIComponent(email)}`);
      setLessonData(res.lesson);
      setProgress(res.progress);

      if (!res.progress.stage1_pdf) setActiveStage(1);
      else if (!res.progress.stage2_video) setActiveStage(2);
      else if (!res.progress.stage3_questions) setActiveStage(3);
      else setActiveStage(4);
    } catch (err) {
      console.error("Lesson details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markStageComplete = async (stageNum) => {
    try {
      const email = user ? user.email : "student@tet.com";
      await fetchApi(`/learning/lesson/${lessonId}/stage/${stageNum}/complete?user_email=${encodeURIComponent(email)}`, {
        method: "POST"
      });
      
      const updatedProg = { ...progress };
      if (stageNum === 1) updatedProg.stage1_pdf = true;
      if (stageNum === 2) updatedProg.stage2_video = true;
      if (stageNum === 3) updatedProg.stage3_questions = true;
      setProgress(updatedProg);

      if (stageNum < 4) {
        setActiveStage(stageNum + 1);
      }
    } catch (err) {
      alert(err.message || "Failed to mark stage complete.");
    }
  };

  const handleLoadPracticeQuestions = async () => {
    if (questionsData.length > 0) return;
    setQuestionsLoading(true);
    try {
      const data = await fetchApi(`/learning/lesson/${lessonId}/questions?count=200`);
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestionsData(data.questions);
      } else {
        alert("Could not load practice questions. Please check server connection.");
      }
    } catch (err) {
      console.error("Practice questions error:", err);
      alert(err.message || "Failed to load practice questions.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleStartTest = async () => {
    setTestLoading(true);
    try {
      const res = await fetchApi(`/learning/lesson/${lessonId}/generate-test`, {
        method: "POST"
      });
      if (!res || !Array.isArray(res.questions) || res.questions.length === 0) {
        throw new Error("Generated test returned no questions. Please try again.");
      }
      setTestData(res);
      setTimeLeft((res.time_limit_mins || 60) * 60);
      setTestAnswers({});
      setTestResult(null);
      setShowDetailedReview(false);
      setTestActive(true);
    } catch (err) {
      console.error("Test start error:", err);
      alert(err.message || "Could not generate test. Please try again.");
      setTestActive(false);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestAnswerSelect = (questionId, optionIdx) => {
    setTestAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionIdx
    }));
  };

  const handleAutoSubmitTest = () => {
    submitTestPayload();
  };

  const submitTestPayload = async () => {
    setTestActive(false);
    setTestLoading(true);
    try {
      const email = user ? user.email : "student@tet.com";
      const res = await fetchApi(`/learning/lesson/${lessonId}/submit-test?user_email=${encodeURIComponent(email)}`, {
        method: "POST",
        body: JSON.stringify({ user_answers: testAnswers })
      });
      const isPassed = res.passed ?? (res.score_percent >= 60);
      setTestResult(res);
      const updatedProg = { ...progress, stage4_test: isPassed, test_score: res.score_percent };
      setProgress(updatedProg);

      if (isPassed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert(err.message || "Failed to submit test.");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading || !lessonData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#0284C7] text-xs font-semibold">Loading Lesson Study Stages...</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pdfDone = progress?.stage1_pdf;
  const videoDone = progress?.stage2_video;
  const questionsDone = progress?.stage3_questions;
  const testDone = progress?.stage4_test;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-4 sm:space-y-6 animate-fade-in text-[#071c38]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 sm:p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#0055ff] transition border border-sky-200 cursor-pointer"
            aria-label="Back to curriculum"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-[#0055ff] text-xs font-bold uppercase tracking-wider">
              <span>Class {lessonData.class_num}</span>
              <span>•</span>
              <span>{lessonData.subject}</span>
              <span>•</span>
              <span>{lessonData.medium}</span>
              <span>•</span>
              <span>{lessonData.term}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[#061b36] mt-0.5 tracking-tight">
              {lessonData.title}
            </h1>
          </div>
        </div>

        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold flex items-center space-x-2 shrink-0">
          <Sparkles className="w-4 h-4 text-[#0055ff]" />
          <span className="text-slate-500">Lesson Status:</span>
          <span className={testDone ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
            {testDone ? `${t.completedBadge} (Passed ≥60%)` : "IN PROGRESS"}
          </span>
        </div>
      </div>

      {/* ================= 4 STAGES STEPPER CONTROL ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* STAGE 1: BOOK / PDF */}
        <button
          onClick={() => setActiveStage(1)}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive cursor-pointer min-h-[92px] ${
            activeStage === 1
              ? "bg-[#0055ff] text-white border-[#0055ff] shadow-md scale-[1.01]"
              : pdfDone
              ? "bg-blue-50/80 text-[#0055ff] border-[#0055ff]/40"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#0055ff]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 1 • BOOK</span>
            {pdfDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <FileText className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage1Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage1Desc}</span>
        </button>

        {/* STAGE 2: VIDEO */}
        <button
          onClick={() => pdfDone && setActiveStage(2)}
          disabled={!pdfDone}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !pdfDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 2
              ? "bg-[#00a651] text-white border-[#00a651] shadow-md scale-[1.01]"
              : videoDone
              ? "bg-emerald-50/80 text-[#00a651] border-[#00a651]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#00a651]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 2 • VIDEO</span>
            {!pdfDone ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : videoDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Video className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage2Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage2Desc}</span>
        </button>

        {/* STAGE 3: QUESTIONS */}
        <button
          onClick={() => videoDone && setActiveStage(3)}
          disabled={!videoDone}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !videoDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 3
              ? "bg-[#ff7a00] text-white border-[#ff7a00] shadow-md scale-[1.01]"
              : questionsDone
              ? "bg-orange-50/80 text-[#ff7a00] border-[#ff7a00]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#ff7a00]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 3 • PRACTICE</span>
            {!videoDone ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : questionsDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <HelpCircle className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage3Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage3Desc}</span>
        </button>

        {/* STAGE 4: QUIZ / TEST */}
        <button
          onClick={() => questionsDone && setActiveStage(4)}
          disabled={!questionsDone}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !questionsDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 4
              ? "bg-[#8a00e6] text-white border-[#8a00e6] shadow-md scale-[1.01]"
              : testDone
              ? "bg-purple-50/80 text-[#8a00e6] border-[#8a00e6]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#8a00e6]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 4 • QUIZ (≥60%)</span>
            {!questionsDone ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : testDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Award className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage4Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage4Desc}</span>
        </button>
      </div>

      {/* ================= ACTIVE STAGE CONTENT VIEWER ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-xs min-h-[500px]">
        
        {/* --- STAGE 1: PDF MATERIAL --- */}
        {activeStage === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0055ff]" />
                  <span>{t.stage1Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage1Desc}
                </p>
              </div>

              <button
                onClick={() => markStageComplete(1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[42px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{pdfDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
              </button>
            </div>

            <div className="w-full h-[520px] sm:h-[650px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <iframe
                src={lessonData.pdf_url.startsWith("/") ? `http://localhost:8000${lessonData.pdf_url}` : lessonData.pdf_url}
                className="w-full h-full border-none"
                title="Lesson PDF Material"
              />
            </div>
          </div>
        )}

        {/* --- STAGE 2: VIDEO LESSON --- */}
        {activeStage === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <Video className="w-5 h-5 text-[#00a651]" />
                  <span>{t.stage2Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage2Desc}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsVideoModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#061b36] text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer min-h-[42px]"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen</span>
                </button>

                <button
                  onClick={() => markStageComplete(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#00a651] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[42px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{videoDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-slate-200 shadow-md flex items-center justify-center">
              <iframe
                src={getEmbedYoutubeUrl(lessonData?.video_url)}
                className="w-full h-full border-none"
                title="Lesson Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* --- STAGE 3: AI PRACTICE QUESTIONS (200 MCQS) --- */}
        {activeStage === 3 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#ff7a00]" />
                  <span>{t.stage3Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage3Desc}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                {questionsData.length === 0 && (
                  <button
                    onClick={handleLoadPracticeQuestions}
                    disabled={questionsLoading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[42px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{questionsLoading ? "Generating Questions..." : t.startPractice}</span>
                  </button>
                )}

                <button
                  onClick={() => markStageComplete(3)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[42px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{questionsDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
                </button>
              </div>
            </div>

            {questionsLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-[#061b36]">
                  Gemini AI is crafting practice questions for {lessonData.title}...
                </p>
              </div>
            ) : questionsData.length === 0 ? (
              <div className="text-center py-14 sm:py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
                <HelpCircle className="w-12 h-12 text-[#ff7a00] mx-auto animate-float" />
                <h4 className="text-base sm:text-lg font-black text-[#061b36]">{t.stage3Title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-medium">
                  {t.stage3Desc}
                </p>
                <button
                  onClick={handleLoadPracticeQuestions}
                  className="px-6 py-3 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white text-sm font-bold shadow-xs cursor-pointer min-h-[44px]"
                >
                  {t.startPractice}
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1 sm:pr-2">
                {questionsData.map((q, idx) => {
                  const hasAnswered = userPracticeAnswers[q.id] !== undefined;
                  return (
                    <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#ff7a00] uppercase tracking-wider block">
                          {t.questionCountLabel} {idx + 1} {t.ofLabel} {questionsData.length}
                        </span>
                        {q.question_type && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-orange-900 border border-orange-200/80 shadow-2xs">
                            {q.question_type}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line">
                        {q.question}
                      </h4>

                      {/* Options in 2 columns: A & B on line 1, C & D on line 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userPracticeAnswers[q.id] === optIdx;
                          const isCorrect = q.answer_index === optIdx;
                          let btnClass = "bg-white border-slate-200 text-[#061b36] hover:bg-orange-50/50 hover:border-orange-300";
                          let badgeClass = "bg-slate-100 text-slate-700";

                          if (hasAnswered) {
                            if (isCorrect) {
                              btnClass = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black shadow-xs";
                              badgeClass = "bg-emerald-600 text-white font-black";
                            } else if (isSelected) {
                              btnClass = "bg-rose-50 border-2 border-rose-500 text-rose-950 font-semibold";
                              badgeClass = "bg-rose-600 text-white font-black";
                            } else {
                              btnClass = "bg-white/80 border-slate-200 text-slate-500 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setUserPracticeAnswers({ ...userPracticeAnswers, [q.id]: optIdx })}
                              className={`p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-base transition-all cursor-pointer min-h-[48px] flex items-center ${btnClass}`}
                            >
                              <span className={`font-black mr-2.5 px-2.5 py-1 rounded-md text-xs shrink-0 ${badgeClass}`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className={`flex-1 leading-snug ${hasAnswered && isCorrect ? "font-black text-emerald-950" : ""}`}>
                                {opt}
                              </span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-2 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="p-4 rounded-xl bg-blue-50/90 border border-[#0055ff]/30 text-xs sm:text-sm text-[#061b36] font-medium leading-relaxed mt-2 animate-fade-in">
                          <div className="flex items-center space-x-1.5 font-black text-[#0055ff] mb-1">
                            <Sparkles className="w-4 h-4" />
                            <span>{t.explanationTitle} (விரிவான விளக்கம்):</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-normal">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 4: AI TIMED TEST (100 MCQS) --- */}
        {activeStage === 4 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{t.stage4Title} (Pass Mark: 60%)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage4Desc} • Score at least 60% to complete this lesson.
                </p>
              </div>

              {testActive && (
                <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-black text-xs sm:text-sm">
                  <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  <span>{t.timeRemaining}: {formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {testResult ? (
              <div className={`rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-slide-up border-2 ${
                testResult.passed
                  ? "bg-emerald-50/90 border-emerald-400 text-emerald-950"
                  : "bg-amber-50/90 border-amber-400 text-amber-950"
              }`}>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm ${
                  testResult.passed
                    ? "bg-emerald-100 border-2 border-emerald-500 text-emerald-700"
                    : "bg-amber-100 border-2 border-amber-500 text-amber-700"
                }`}>
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {testResult.passed ? "🎉 Lesson Completed Successfully!" : "⚠️ Quiz Score Below 60%"}
                  </h3>
                  
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border text-sm font-extrabold shadow-2xs">
                    <span>{t.yourScore}:</span>
                    <span className={`text-lg font-black ${testResult.passed ? "text-emerald-600" : "text-amber-700"}`}>
                      {testResult.score_percent}%
                    </span>
                    <span className="text-slate-500">
                      ({testResult.correct_count} / {testResult.total_questions} Correct)
                    </span>
                  </div>

                  <p className="text-sm font-medium max-w-md mx-auto leading-relaxed">
                    {testResult.passed
                      ? "Great job! You achieved the required 60% pass mark. This lesson is officially marked as complete and your daily streak is recorded!"
                      : "To successfully complete this lesson and unlock subsequent modules, you must achieve at least 60%. Please review the lesson notes and retake the quiz."}
                  </p>

                  {testResult.passed && (
                    <div className="pt-1">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-[#0055ff] border border-[#0055ff]/30 text-xs sm:text-sm font-bold">
                        🔥 Daily Study Streak: {testResult.new_streak} Days Active!
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setShowDetailedReview(!showDetailedReview)}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[42px]"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{showDetailedReview ? "Hide Solution Review" : "🔍 View Solutions & Review Questions (விடைகள் & விளக்கங்கள்)"}</span>
                  </button>

                  <button
                    onClick={handleStartTest}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#061b36] text-xs sm:text-sm font-bold border border-slate-300 shadow-xs cursor-pointer min-h-[42px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{testResult.passed ? "Retake for Higher Score" : "🔄 Retake Final Quiz"}</span>
                  </button>

                  {!testResult.passed && (
                    <button
                      onClick={() => setActiveStage(1)}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] text-xs sm:text-sm font-bold border border-blue-200 shadow-xs cursor-pointer min-h-[42px]"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Review Stage 1 Book</span>
                    </button>
                  )}

                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[42px]"
                  >
                    <span>{t.backToLearningBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* DETAILED QUESTION-BY-QUESTION SOLUTION REVIEW */}
                {showDetailedReview && testResult.detailed_results && (
                  <div className="space-y-4 pt-6 border-t border-slate-200 text-left animate-slide-up">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <h4 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-[#0055ff]" />
                        <span>Question-by-Question Solution Review ({testResult.detailed_results.length} Questions)</span>
                      </h4>
                      <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                        🟢 Green = Correct • 🔴 Red = Selected Wrong
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                      {testResult.detailed_results.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 shadow-2xs ${
                            item.is_correct ? "bg-emerald-50/40 border-emerald-300" : "bg-rose-50/40 border-rose-300"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider block ${
                              item.is_correct ? "text-emerald-800" : "text-rose-800"
                            }`}>
                              Question {idx + 1} {item.is_correct ? "• ✅ Correct (+1)" : "• ❌ Incorrect (0)"}
                            </span>
                            {item.question_type && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                                {item.question_type}
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line">
                            {item.question}
                          </h5>

                          {item.options && item.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                              {item.options.map((opt, optIdx) => {
                                const isUserPick = item.user_answer === optIdx;
                                const isKey = item.correct_answer === optIdx;
                                let optClass = "bg-white border-slate-200 text-slate-600";
                                let badgeClass = "bg-slate-100 text-slate-600";

                                if (isKey) {
                                  optClass = "bg-emerald-100 border-2 border-emerald-600 text-emerald-950 font-black shadow-xs";
                                  badgeClass = "bg-emerald-600 text-white font-black";
                                } else if (isUserPick) {
                                  optClass = "bg-rose-100 border-2 border-rose-500 text-rose-950 font-bold";
                                  badgeClass = "bg-rose-600 text-white font-black";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm flex items-center min-h-[44px] ${optClass}`}
                                  >
                                    <span className={`font-black mr-2 px-2 py-0.5 rounded-md text-xs shrink-0 ${badgeClass}`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className={`flex-1 leading-snug ${isKey ? "font-black text-emerald-950" : ""}`}>
                                      {opt}
                                    </span>
                                    {isKey && <CheckCircle2 className="w-4 h-4 text-emerald-700 ml-1.5 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#061b36] leading-relaxed">
                            <span className="font-extrabold text-[#0055ff] block mb-1">Pedagogical Theory & Solution Rationale:</span>
                            <p className="text-slate-800 leading-relaxed font-normal">{item.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !testActive ? (
              <div className="text-center py-12 sm:py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
                <Award className="w-14 h-14 text-[#0055ff] mx-auto animate-float" />
                <h4 className="text-lg sm:text-xl font-black text-[#061b36]">{t.stage4Title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
                  {t.stage4Desc} • You must score at least <strong>60%</strong> to complete this lesson and unlock subsequent lessons.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleStartTest}
                    disabled={testLoading}
                    className="px-8 py-3.5 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
                  >
                    {testLoading ? "Generating Test Questions..." : t.startTimedExam}
                  </button>
                </div>
              </div>
            ) : testLoading || !testData?.questions ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#0055ff] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#061b36]">
                  Preparing official TN TET Paper 2 exam questions...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile-friendly Sticky Action Bar */}
                <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-sky-200 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-600">
                      {Object.keys(testAnswers).length} / {testData?.questions?.length || 0} answered
                    </span>
                  </div>

                  <button
                    onClick={submitTestPayload}
                    className="px-5 py-2 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[40px]"
                  >
                    {t.submitExamBtn}
                  </button>
                </div>

                <div className="max-h-[620px] overflow-y-auto space-y-4 pr-1 sm:pr-2">
                  {(testData?.questions || []).map((q, idx) => (
                    <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#0055ff] uppercase tracking-wider block">
                          {t.questionCountLabel} {idx + 1} {t.ofLabel} {testData?.questions?.length || 0}
                        </span>
                        {q.question_type && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                            {q.question_type}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line">
                        {q.question}
                      </h4>

                      {/* Options in 2 columns: A & B on line 1, C & D on line 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                        {(q.options || []).map((opt, optIdx) => {
                          const isSelected = testAnswers[String(q.id)] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleTestAnswerSelect(q.id, optIdx)}
                              className={`p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-base transition-all cursor-pointer min-h-[48px] flex items-center ${
                                isSelected
                                  ? "bg-[#0055ff] border-[#0055ff] text-white font-black shadow-md scale-[1.005]"
                                  : "bg-white border-slate-200 text-[#061b36] hover:bg-blue-50/60 font-medium hover:border-blue-300"
                              }`}
                            >
                              <span className={`font-black mr-2.5 px-2.5 py-1 rounded-md text-xs shrink-0 ${
                                isSelected ? "bg-white/20 text-white font-black" : "bg-slate-100 text-slate-700"
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={submitTestPayload}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-black text-sm shadow-xs cursor-pointer min-h-[44px]"
                  >
                    {t.submitExamBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FULLSCREEN VIDEO MODAL */}
      {isVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={getEmbedYoutubeUrl(lessonData?.video_url)}
              className="w-full h-full border-none"
              title="Fullscreen Video Lesson"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
}
