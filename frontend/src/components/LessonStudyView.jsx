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
      setQuestionsData(data.questions || []);
    } catch (err) {
      console.error("Practice questions error:", err);
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
      setTestData(res);
      setTimeLeft(res.time_limit_mins * 60);
      setTestAnswers({});
      setTestResult(null);
      setTestActive(true);
    } catch (err) {
      alert(err.message || "Could not generate test.");
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
      setTestResult(res);
      
      const updatedProg = { ...progress, stage4_test: true, test_score: res.score_percent };
      setProgress(updatedProg);

      if (res.passed) {
        confetti({
          particleCount: 120,
          spread: 70,
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
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-7 animate-fade-in text-[#1E3A8A]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] transition border border-sky-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2 text-[#0284C7] text-xs font-bold uppercase tracking-wider">
              <span>Class {lessonData.class_num}</span>
              <span>•</span>
              <span>{lessonData.subject}</span>
              <span>•</span>
              <span>{lessonData.medium}</span>
              <span>•</span>
              <span>{lessonData.term}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E3A8A] mt-0.5">
              {lessonData.title}
            </h1>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-bold flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#0284C7]" />
          <span className="text-slate-500">Lesson Status:</span>
          <span className={testDone ? "text-[#0284C7]" : "text-amber-600"}>
            {testDone ? t.completedBadge : "IN PROGRESS"}
          </span>
        </div>
      </div>

      {/* ================= 4 STAGES STEPPER CONTROL ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        
        {/* STAGE 1: BOOK / PDF */}
        <button
          onClick={() => setActiveStage(1)}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            activeStage === 1
              ? "bg-[#0055ff] text-white border-[#0055ff] shadow-md scale-[1.02]"
              : pdfDone
              ? "bg-blue-50 text-[#0055ff] border-[#0055ff]/40"
              : "bg-white text-[#093c85] border-slate-200 hover:border-[#0055ff]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Stage 1 • BOOK</span>
            {pdfDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5" />}
          </div>
          <h4 className="text-sm font-bold truncate">{t.stage1Title}</h4>
          <span className="text-[10px] opacity-80 font-medium block mt-1">{t.stage1Desc}</span>
        </button>

        {/* STAGE 2: VIDEO */}
        <button
          onClick={() => pdfDone && setActiveStage(2)}
          disabled={!pdfDone}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            !pdfDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 2
              ? "bg-[#00a651] text-white border-[#00a651] shadow-md scale-[1.02]"
              : videoDone
              ? "bg-emerald-50 text-[#00a651] border-[#00a651]/40"
              : "bg-white text-[#093c85] border-slate-200 hover:border-[#00a651]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Stage 2 • VIDEO</span>
            {!pdfDone ? <Lock className="w-4 h-4 text-slate-400" /> : videoDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Video className="w-5 h-5" />}
          </div>
          <h4 className="text-sm font-bold truncate">{t.stage2Title}</h4>
          <span className="text-[10px] opacity-80 font-medium block mt-1">{t.stage2Desc}</span>
        </button>

        {/* STAGE 3: QUESTIONS */}
        <button
          onClick={() => videoDone && setActiveStage(3)}
          disabled={!videoDone}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            !videoDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 3
              ? "bg-[#ff7a00] text-white border-[#ff7a00] shadow-md scale-[1.02]"
              : questionsDone
              ? "bg-orange-50 text-[#ff7a00] border-[#ff7a00]/40"
              : "bg-white text-[#093c85] border-slate-200 hover:border-[#ff7a00]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Stage 3 • QUESTIONS</span>
            {!videoDone ? <Lock className="w-4 h-4 text-slate-400" /> : questionsDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <h4 className="text-sm font-bold truncate">{t.stage3Title}</h4>
          <span className="text-[10px] opacity-80 font-medium block mt-1">{t.stage3Desc}</span>
        </button>

        {/* STAGE 4: QUIZ / TEST */}
        <button
          onClick={() => questionsDone && setActiveStage(4)}
          disabled={!questionsDone}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            !questionsDone
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 4
              ? "bg-[#8a00e6] text-white border-[#8a00e6] shadow-md scale-[1.02]"
              : testDone
              ? "bg-purple-50 text-[#8a00e6] border-[#8a00e6]/40"
              : "bg-white text-[#093c85] border-slate-200 hover:border-[#8a00e6]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Stage 4 • QUIZ</span>
            {!questionsDone ? <Lock className="w-4 h-4 text-slate-400" /> : testDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Award className="w-5 h-5" />}
          </div>
          <h4 className="text-sm font-bold truncate">{t.stage4Title}</h4>
          <span className="text-[10px] opacity-80 font-medium block mt-1">{t.stage4Desc}</span>
        </button>
      </div>

      {/* ================= ACTIVE STAGE CONTENT VIEWER ================= */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs min-h-[500px]">
        
        {/* --- STAGE 1: PDF MATERIAL --- */}
        {activeStage === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.stage1Title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t.stage1Desc}
                </p>
              </div>

              <button
                onClick={() => markStageComplete(1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{pdfDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
              </button>
            </div>

            <div className="w-full h-[550px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
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
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                  <Video className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.stage2Title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t.stage2Desc}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsVideoModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-bold border border-sky-200"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen</span>
                </button>

                <button
                  onClick={() => markStageComplete(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs"
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.stage3Title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t.stage3Desc}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {questionsData.length === 0 && (
                  <button
                    onClick={handleLoadPracticeQuestions}
                    disabled={questionsLoading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{questionsLoading ? "Generating Questions..." : t.startPractice}</span>
                  </button>
                )}

                <button
                  onClick={() => markStageComplete(3)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{questionsDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
                </button>
              </div>
            </div>

            {questionsLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#0284C7] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#1E3A8A]">
                  Gemini AI is crafting practice questions for {lessonData.title}...
                </p>
              </div>
            ) : questionsData.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-4">
                <HelpCircle className="w-12 h-12 text-[#0284C7] mx-auto" />
                <h4 className="text-base font-bold text-[#1E3A8A]">{t.stage3Title}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  {t.stage3Desc}
                </p>
                <button
                  onClick={handleLoadPracticeQuestions}
                  className="px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs"
                >
                  {t.startPractice}
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {questionsData.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-black text-[#0284C7] uppercase tracking-wider">
                      {t.questionCountLabel} {idx + 1} {t.ofLabel} {questionsData.length}
                    </span>
                    <h4 className="text-sm font-bold text-[#1E3A8A]">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userPracticeAnswers[q.id] === optIdx;
                        const isCorrect = q.answer_index === optIdx;
                        let btnClass = "bg-white border-slate-200 text-[#1E3A8A] hover:bg-sky-50";
                        if (userPracticeAnswers[q.id] !== undefined) {
                          if (isCorrect) btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800 font-bold";
                          else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-800 font-bold";
                        }
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setUserPracticeAnswers({ ...userPracticeAnswers, [q.id]: optIdx })}
                            className={`p-3 rounded-xl border text-left text-xs transition ${btnClass}`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {userPracticeAnswers[q.id] !== undefined && (
                      <div className="p-3 rounded-xl bg-sky-50 border border-[#0284C7]/30 text-xs text-[#1E3A8A] font-medium">
                        <span className="font-bold text-[#0284C7] block mb-1">{t.explanationTitle}:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 4: AI TIMED TEST (100 MCQS) --- */}
        {activeStage === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{t.stage4Title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t.stage4Desc}
                </p>
              </div>

              {testActive && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs">
                  <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  <span>{t.timeRemaining}: {formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {testResult ? (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-scale-up">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${testResult.passed ? "bg-emerald-100 border-2 border-emerald-500 text-emerald-700" : "bg-red-100 border-2 border-red-500 text-red-700"}`}>
                  <Award className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#1E3A8A]">
                    {testResult.passed ? `${t.passedBadge}! 🎉` : t.failedBadge}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 font-semibold">
                    {t.yourScore}: <span className="font-black text-[#1E3A8A]">{testResult.score_percent}%</span> ({testResult.correct_count} / {testResult.total_questions} Correct)
                  </p>
                  {testResult.passed && (
                    <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-sky-100 text-[#0284C7] border border-[#0284C7]/30 text-xs font-bold">
                      🔥 Daily Study Streak Increased to {testResult.new_streak} Days!
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-center space-x-3">
                  <button
                    onClick={handleStartTest}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-[#0284C7] text-xs font-bold border border-[#0284C7]/30 shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Test</span>
                  </button>

                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs"
                  >
                    <span>{t.backToLearningBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !testActive ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-4">
                <Award className="w-12 h-12 text-[#0284C7] mx-auto" />
                <h4 className="text-base font-black text-[#1E3A8A]">{t.stage4Title}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  {t.stage4Desc}
                </p>

                <button
                  onClick={handleStartTest}
                  disabled={testLoading}
                  className="px-8 py-3.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-black text-xs shadow-md shadow-[#0284C7]/20 transition scale-105"
                >
                  {testLoading ? "Generating Test..." : t.startTimedExam}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-h-[550px] overflow-y-auto space-y-4 pr-2">
                  {testData.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-black text-[#0284C7] uppercase tracking-wider">
                        {t.questionCountLabel} {idx + 1} {t.ofLabel} {testData.questions.length}
                      </span>
                      <h4 className="text-sm font-bold text-[#1E3A8A]">{q.question}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = testAnswers[String(q.id)] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleTestAnswerSelect(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition ${
                                isSelected
                                  ? "bg-[#0284C7] border-[#0284C7] text-white font-bold shadow-xs"
                                  : "bg-white border-slate-200 text-[#1E3A8A] hover:bg-sky-50"
                              }`}
                            >
                              <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={submitTestPayload}
                    className="px-8 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-black text-xs shadow-xs"
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
