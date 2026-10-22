import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Video, 
  HelpCircle, 
  CheckCircle2, 
  Lock, 
  ArrowLeft, 
  Clock, 
  Award, 
  ChevronRight, 
  Maximize2, 
  X, 
  RotateCcw,
  Download,
  BookOpen,
  FileCheck,
  GraduationCap,
  CheckSquare
} from "lucide-react";
import confetti from "canvas-confetti";
import { fetchApi, getEmbedYoutubeUrl } from "../api";
import { translations } from "../translations";
import { downloadQuizAsPdf } from "../utils/pdfExport";

export default function LessonStudyView({ lessonId, user, onBack, lang = "en", initialStage = 1 }) {
  const [lessonData, setLessonData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(Number(initialStage) || 1);

  const hasInitializedStage = useRef(false);
  const hasTriggeredUnlockRef = useRef(false);

  // Keep browser URL synchronized to the exact lesson and active stage
  useEffect(() => {
    if (!lessonId) return;
    try {
      const targetUrl = `/learning/lesson/${lessonId}?stage=${activeStage}`;
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.replaceState(null, "", targetUrl);
      }
    } catch (e) {}
  }, [lessonId, activeStage]);

  const [isVideoModal, setIsVideoModal] = useState(false);

  const [questionsData, setQuestionsData] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [quizInfo, setQuizInfo] = useState({ quiz_type: "type1", is_type2: false });
  const [userPracticeAnswers, setUserPracticeAnswers] = useState({});

  const [testData, setTestData] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [countdownStr, setCountdownStr] = useState("");
  const [canDownloadQuiz, setCanDownloadQuiz] = useState(true);

  const t = translations[lang] || translations.en;

  const activeStages = React.useMemo(() => {
    const raw = lessonData?.active_stages;
    if (!raw) return [1, 2, 3, 4, 5];
    if (Array.isArray(raw)) return raw.map(Number);
    if (typeof raw === "string") return raw.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
    return [1, 2, 3, 4, 5];
  }, [lessonData?.active_stages]);

  React.useEffect(() => {
    if (activeStages.length > 0 && !activeStages.includes(activeStage)) {
      setActiveStage(activeStages[0]);
    }
  }, [activeStages, activeStage]);

  useEffect(() => {
    fetchApi("/public-settings")
      .then((data) => {
        if (data && typeof data.enable_quiz_download === "boolean") {
          setCanDownloadQuiz(data.enable_quiz_download);
        }
      })
      .catch(() => {});
  }, []);

  const formatMathSymbols = (text) => {
    if (!text) return "";
    let s = String(text);
    // Convert caret exponent notation to proper superscripts (prevent square showing as arrow)
    s = s.replace(/\^2\b|\^2(?=[^\w]|$)/g, "²");
    s = s.replace(/\^3\b|\^3(?=[^\w]|$)/g, "³");
    s = s.replace(/\^4\b|\^4(?=[^\w]|$)/g, "⁴");
    s = s.replace(/\^0\b|\^0(?=[^\w]|$)/g, "⁰");
    s = s.replace(/\^1\b|\^1(?=[^\w]|$)/g, "¹");
    s = s.replace(/\^n\b|\^n(?=[^\w]|$)/g, "ⁿ");
    s = s.replace(/\^x\b|\^x(?=[^\w]|$)/g, "ˣ");
    s = s.replace(/\^y\b|\^y(?=[^\w]|$)/g, "ʸ");
    s = s.replace(/\^([0-9]+)/g, (_, digits) => {
      const supMap = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
      return digits.split('').map(d => supMap[d] || d).join('');
    });
    return s;
  };

  const cleanQuestionStem = (text) => {
    if (!text) return "";
    let s = String(text);
    s = formatMathSymbols(s);
    // Strip control characters (which cause tofu / empty box symbols)
    s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, "");
    // Fix rogue InDesign book file names and timestamps
    s = s.replace(/[\w\-\.]+(?:\s+[\w\-\.]+)*\.indd(?:\s*\d+)?/gi, "");
    s = s.replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)/gi, "");
    s = s.replace(/\d+\s*ஆம்\s*வகுப்பு\s*[\u0B80-\u0BFF\s]+/g, "");
    s = s.replace(/^\s*\([a-z0-9ivx]+\)\s*/i, "");
    // Fix spaces before pulli or vowel signs
    s = s.replace(/([\u0B85-\u0BB9][\u0BBE-\u0BCC]?)\s+([\u0B95-\u0BB9]\u0BCD)/g, "$1$2");
    s = s.replace(/\s+([\u0BCD\u0BBE-\u0BCC])/g, "$1");
    // Fix rogue newlines between Tamil characters
    s = s.replace(/([\u0B80-\u0BFF])\s*\n\s*([\u0B80-\u0BFF])/g, "$1$2");
    // Remove repetitive boilerplate prefixes
    s = s.replace(/^(?:கீழ்க்கண்ட|கீழ்கண்ட|பின்வரும்)\s*கூற்றுகளு(?:ள்|ளில்)\s*(?:எது|எவை)\s*(?:பாடப்புத்தகத்?|வரலாற்றுத்?|பாடப்பகுதியின்?)?\s*தகவல்களின்படி\s*(?:சரியான\s*)?(?:கொள்குறி\s*)?விடையாகும்\??\s*(?:\n*தகவல்\s*பகுதி\s*:\s*['"]?)?/i, "");
    s = s.replace(/^(?:தகவல்\s*பகுதி|தகவலின்படி)\s*:\s*['"]?/i, "");
    s = s.replace(/^(?:Which of the following (?:concepts|statements|facts|ideas)\s+(?:is|are)\s+(?:directly\s+)?(?:supported|verified|stated)\s+(?:by|in)\s+the\s+(?:uploaded\s+)?(?:lesson|textbook)?\s*material\??\s*(?:\n*Statement Context\s*:\s*['"]?)?)/i, "");
    s = s.replace(/^Statement Context\s*:\s*['"]?/i, "");
    s = s.replace(/^(?:உயர்\s*சிந்தனை\s*வினா\s*(?:\(HOTS\))?\s*[-:]\s*(?:பின்வரும்|கீழ்க்கண்ட)?\s*கருத்தை\s*(?:ஆழமாகப்\s*)?பகுப்பாய்வு\s*செய்க\s*[:\n]*)/i, "");
    s = s.replace(/^(?:Analytical\s*&\s*Higher\s*Order\s*Thinking\s*\(HOTS\)\s*[-:]\s*Analyze\s*the\s*following\s*concept\s*[:\n]*)/i, "");
    s = s.replace(/\n*பாடத்தின்\s*மையக்\s*கோட்பாட்டோடு\s*மிகவும்\s*பொருந்தும்\s*முடிவு\s*எது\??/g, "");
    s = s.replace(/\n*Which\s*analytical\s*deduction\s*is\s*most\s*accurate\??/g, "");
    s = s.replace(/^\s*[●■◆▲►★*•▪▫]\s*/, "");
    s = s.replace(/\.\.\.['"]?$/, ".");
    return s.trim();
  };

  useEffect(() => {
    loadLessonDetails();
  }, [lessonId]);

  const isTimeLocked = Boolean(lessonData?.is_stage5_locked_by_time ?? lessonData?.is_stage4_locked_by_time);
  const unlockTimeStr = lessonData?.stage5_unlock_time || lessonData?.stage4_unlock_time || "20:00";

  useEffect(() => {
    if (!isTimeLocked) return;
    hasTriggeredUnlockRef.current = false;
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      const [th, tm] = (unlockTimeStr).split(":").map(Number);
      target.setHours(th || 20, tm || 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownStr("00:00:00");
        if (!hasTriggeredUnlockRef.current) {
          hasTriggeredUnlockRef.current = true;
          loadLessonDetails(false);
        }
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownStr(
        `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isTimeLocked, unlockTimeStr]);

  const handleAdminToggleStage5 = async () => {
    try {
      await fetchApi(`/admin/lessons/${lessonId}/toggle-stage5`, { method: "POST" });
      await loadLessonDetails();
    } catch (err) {
      alert("Failed to toggle Stage 5: " + err.message);
    }
  };

  useEffect(() => {
    if (activeStage === 4 && questionsData.length === 0 && !questionsLoading) {
      handleLoadPracticeQuestions();
    }
  }, [activeStage]);

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

  const loadLessonDetails = async (showSpinner = true) => {
    if (showSpinner && !lessonData) setLoading(true);
    try {
      const email = user ? user.email : "candidate@tet.com";
      const res = await fetchApi(`/learning/lesson/${lessonId}?user_email=${encodeURIComponent(email)}`);
      setLessonData(res.lesson);
      setProgress(res.progress);

      if (!hasInitializedStage.current) {
        hasInitializedStage.current = true;
        const requestedStage = Number(initialStage);
        if (requestedStage === 5 && !res.progress?.stage3_questions) {
          // Stage 5 strictly disabled until Stage 4 is marked complete
          setActiveStage(4);
        } else if (requestedStage && [1, 2, 3, 4, 5].includes(requestedStage)) {
          setActiveStage(requestedStage);
        } else {
          if (!res.progress.stage1_pdf) setActiveStage(1);
          else if (!res.progress.stage2_short_notes) setActiveStage(2);
          else if (!res.progress.stage2_video) setActiveStage(3);
          else if (!res.progress.stage3_questions) setActiveStage(4);
          else setActiveStage(5);
        }
      }
    } catch (err) {
      console.error("Lesson details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markStageComplete = async (stageNum) => {
    try {
      const email = user ? user.email : "candidate@tet.com";
      await fetchApi(`/learning/lesson/${lessonId}/stage/${stageNum}/complete?user_email=${encodeURIComponent(email)}`, {
        method: "POST"
      });
      
      const updatedProg = { ...progress };
      if (stageNum === 1) updatedProg.stage1_pdf = true;
      if (stageNum === 2) updatedProg.stage2_short_notes = true;
      if (stageNum === 3) updatedProg.stage2_video = true;
      if (stageNum === 4) updatedProg.stage3_questions = true;
      if (stageNum === 5) updatedProg.stage4_test = true;
      setProgress(updatedProg);

      if (stageNum < 5) {
        setActiveStage(stageNum + 1);
      }
    } catch (err) {
      alert(err.message || "Failed to mark stage complete.");
    }
  };

  const handleLoadPracticeQuestions = async (forcedQuizType = null) => {
    setQuestionsLoading(true);
    try {
      const email = user ? user.email : "candidate@tet.com";
      const typeQuery = forcedQuizType ? `&quiz_type=${forcedQuizType}` : "";
      const data = await fetchApi(`/learning/lesson/${lessonId}/questions?user_email=${encodeURIComponent(email)}${typeQuery}`);
      if (data && Array.isArray(data.questions)) {
        setQuestionsData(data.questions);
        setQuizInfo({
          quiz_type: data.quiz_type || "type1",
          is_type2: Boolean(data.is_type2)
        });
      }
    } catch (err) {
      console.error("Practice questions error:", err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleDownloadQuiz = () => {
    if (!questionsData || questionsData.length === 0) return;
    const isT2 = quizInfo.is_type2;
    downloadQuizAsPdf({
      title: lessonData?.title || "Lesson Practice Quiz",
      lesson: lessonData,
      quizType: isT2 ? "type2" : "type1",
      questions: questionsData
    });
  };

  const handleStartTest = async () => {
    setTestLoading(true);
    try {
      const email = user ? user.email : "candidate@tet.com";
      const res = await fetchApi(`/learning/lesson/${lessonId}/generate-test?user_email=${encodeURIComponent(email)}`, {
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
      const isPassed = res.passed ?? (res.score_percent >= 80);
      setTestResult(res);

      const updatedProg = {
        ...progress,
        stage4_test: isPassed,
        has_failed_test: !isPassed,
        test_score: res.score_percent
      };
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
  const notesDone = progress?.stage2_short_notes;
  const videoDone = progress?.stage2_video;
  const questionsDone = progress?.stage3_questions;
  const testDone = progress?.stage4_test;


  const isDirect = Boolean(initialStage && [1, 2, 3, 4].includes(Number(initialStage)));
  const canAccessStage2 = isDirect || pdfDone;
  const canAccessStage3 = isDirect || notesDone || pdfDone;
  const canAccessStage4 = isDirect || videoDone || pdfDone;
  // Stage 5 is strictly disabled until Stage 4 is marked as complete
  const canAccessStage5 = Boolean(questionsDone);

  // Automatically enforce Stage 5 lock if Stage 4 is not yet marked complete
  useEffect(() => {
    if (activeStage === 5 && progress && !progress.stage3_questions && !loading) {
      setActiveStage(4);
    }
  }, [activeStage, progress, loading]);

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
          <GraduationCap className="w-4 h-4 text-[#0055ff]" />
          <span className="text-slate-500">Lesson Status:</span>
          <span className={testDone ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
            {testDone ? `${t.completedBadge} (Passed ≥80%)` : "IN PROGRESS"}
          </span>
        </div>
      </div>

      {/* ================= 5 STAGES STEPPER CONTROL ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* STAGE 1: BOOK / PDF */}
        {activeStages.includes(1) && (
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
        )}

        {/* STAGE 2: SHORT NOTES */}
        {activeStages.includes(2) && (
        <button
          onClick={() => canAccessStage2 && setActiveStage(2)}
          disabled={!canAccessStage2}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !canAccessStage2
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 2
              ? "bg-[#0284c7] text-white border-[#0284c7] shadow-md scale-[1.01]"
              : notesDone
              ? "bg-sky-50/80 text-[#0284c7] border-[#0284c7]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#0284c7]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 2 • NOTES</span>
            {!canAccessStage2 ? (
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            ) : notesDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <FileCheck className="w-5 h-5 shrink-0" />
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage2Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage2Desc}</span>
        </button>
        )}

        {/* STAGE 3: VIDEO */}
        {activeStages.includes(3) && (
        <button
          onClick={() => canAccessStage3 && setActiveStage(3)}
          disabled={!canAccessStage3}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !canAccessStage3
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 3
              ? "bg-[#00a651] text-white border-[#00a651] shadow-md scale-[1.01]"
              : videoDone
              ? "bg-emerald-50/80 text-[#00a651] border-[#00a651]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#00a651]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 3 • VIDEO</span>
            {!canAccessStage3 ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : videoDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Video className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage3Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage3Desc}</span>
        </button>
        )}

        {/* STAGE 4: PRACTICE QUESTIONS */}
        {activeStages.includes(4) && (
        <button
          onClick={() => canAccessStage4 && setActiveStage(4)}
          disabled={!canAccessStage4}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !canAccessStage4
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 4
              ? "bg-[#ff7a00] text-white border-[#ff7a00] shadow-md scale-[1.01]"
              : questionsDone
              ? "bg-orange-50/80 text-[#ff7a00] border-[#ff7a00]/40 cursor-pointer"
              : "bg-white text-[#061b36] border-slate-200 hover:border-[#ff7a00]/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 4 • PRACTICE</span>
            {!canAccessStage4 ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : questionsDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <HelpCircle className="w-5 h-5 shrink-0" />}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage4Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">{t.stage4Desc}</span>
        </button>
        )}

        {/* STAGE 5: QUIZ / FINAL EXAM */}
        {activeStages.includes(5) && (
        <button
          onClick={() => canAccessStage5 && setActiveStage(5)}
          disabled={!canAccessStage5}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative card-interactive min-h-[92px] ${
            !canAccessStage5
              ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
              : activeStage === 5
              ? !isTimeLocked
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-[1.01]"
                : "bg-[#8a00e6] text-white border-[#8a00e6] shadow-md scale-[1.01]"
              : testDone
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 cursor-pointer"
              : !isTimeLocked
              ? "bg-emerald-50/80 text-emerald-950 border-2 border-emerald-400 hover:bg-emerald-100/90 shadow-xs cursor-pointer ring-1 ring-emerald-300/40"
              : "bg-amber-50/50 text-amber-950 border-amber-200 hover:border-amber-400 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Stage 5 • QUIZ (≥80%)</span>
            {!canAccessStage5 ? (
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            ) : testDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : !isTimeLocked ? (
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>🔓 UNLOCKED</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                <Lock className="w-2.5 h-2.5 inline mr-0.5" /> 8:00 PM
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold truncate leading-tight">{t.stage5Title}</h4>
          <span className="text-xs opacity-80 font-medium block mt-1 line-clamp-1">
            {!isTimeLocked ? "🔓 Unlocked & Live Now • Click to Start Exam" : t.stage5Desc}
          </span>
        </button>
        )}
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

              <div className="flex items-center space-x-2.5">
                {lessonData?.pdf_url && (
                  <a
                    href={lessonData.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0055ff] text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer min-h-[42px]"
                    title="Open PDF in a new window"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open in New Tab ↗</span>
                  </a>
                )}

                <button
                  onClick={() => markStageComplete(1)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[42px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pdfDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
                </button>
              </div>
            </div>

            {lessonData?.pdf_url ? (
              <div className="w-full h-[540px] sm:h-[680px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                <iframe
                  key={lessonData.pdf_url}
                  src={lessonData.pdf_url}
                  className="w-full h-full border-none"
                  title="Lesson PDF Material"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <FileText className="w-12 h-12 text-[#0055ff] mx-auto opacity-70" />
                <h4 className="text-base font-bold text-[#061b36]">No PDF Document Attached</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  The lesson PDF is being prepared. You can mark this stage as complete and proceed to Short Notes and Video.
                </p>
                <button
                  onClick={() => markStageComplete(1)}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Mark Complete & Proceed →
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 2: SHORT NOTES PDF --- */}
        {activeStage === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-[#0284c7]" />
                  <span>{t.stage2Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage2Desc}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                {lessonData?.short_notes_pdf_url && (
                  <a
                    href={lessonData.short_notes_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#061b36] text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer min-h-[42px]"
                  >
                    <Download className="w-4 h-4 text-[#0284c7]" />
                    <span>Download Notes (PDF)</span>
                  </a>
                )}

                <button
                  onClick={() => markStageComplete(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer min-h-[42px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{notesDone ? `${t.markStageDone} ✓` : t.markStageDone}</span>
                </button>
              </div>
            </div>

            {lessonData?.short_notes_pdf_url ? (
              <div className="w-full h-[520px] sm:h-[650px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                <iframe
                  src={lessonData.short_notes_pdf_url}
                  className="w-full h-full border-none"
                  title="Lesson Short Notes PDF"
                />
              </div>
            ) : (
              <div className="text-center py-14 sm:py-16 bg-sky-50/60 rounded-3xl border border-sky-200 p-6 sm:p-8 space-y-4">
                <FileCheck className="w-12 h-12 text-[#0284c7] mx-auto animate-bounce" />
                <h4 className="text-base sm:text-lg font-black text-[#061b36]">
                  {lang === "ta" ? "சுருக்கக் குறிப்புகள் (Short Notes PDF)" : "Short Notes PDF"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
                  {lang === "ta"
                    ? "இந்தப் பாடத்திற்கான சுருக்கக் குறிப்புகள் தயாரிப்பில் உள்ளது அல்லது விரைவில் பதிவேற்றப்படும். நீங்கள் காணொளி விளக்கம் (Stage 3) காண நேரடியாக செல்லலாம்."
                    : "Short notes PDF will be uploaded shortly by admin. You can proceed directly to Stage 3 Video Lesson."}
                </p>
                <button
                  onClick={() => markStageComplete(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[42px]"
                >
                  {lang === "ta" ? "அடுத்த நிலைக்குச் செல் (Stage 3 Video)" : "Proceed to Stage 3 Video"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 3: VIDEO LESSON --- */}
        {activeStage === 3 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <Video className="w-5 h-5 text-[#00a651]" />
                  <span>{t.stage3Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage3Desc}
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
                  onClick={() => markStageComplete(3)}
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

        {/* --- STAGE 4: PRACTICE MCQS (TYPE 1 & TYPE 2) --- */}
        {activeStage === 4 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-[#ff7a00]" />
                    <span>{t.stage4Title}</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                    quizInfo.is_type2
                      ? "bg-purple-100 text-purple-900 border-purple-200"
                      : "bg-blue-100 text-blue-900 border-blue-200"
                  }`}>
                    {quizInfo.is_type2 ? "Type 2 Quiz (மறுபயிற்சி வினாக்கள்)" : "Type 1 Quiz (முதன்மைப் பயிற்சி வினாக்கள்)"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {quizInfo.is_type2
                    ? "Stage 5 re-attempt mode: Practice these Type 2 alternate questions to master the lesson concepts."
                    : t.stage4Desc}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                {canDownloadQuiz && questionsData.length > 0 && (
                  <button
                    onClick={handleDownloadQuiz}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#061b36] text-xs sm:text-sm font-bold border border-slate-200 shadow-2xs cursor-pointer min-h-[42px]"
                    title="Download practice quiz questions for offline reading"
                  >
                    <Download className="w-4 h-4 text-[#0055ff]" />
                    <span>{t.downloadQuizBtn || "Download Quiz (PDF)"}</span>
                  </button>
                )}

                {(() => {
                  const totalCount = questionsData.length;
                  const answeredCount = questionsData.filter((q, i) => {
                    const k = q.id !== undefined ? String(q.id) : String(i);
                    return userPracticeAnswers[k] !== undefined;
                  }).length;
                  const isAllAttended = totalCount > 0 && answeredCount >= totalCount;
                  
                  return (
                    <button
                      onClick={() => {
                        if (!isAllAttended) {
                          alert(lang === "ta" 
                            ? `அனைத்து ${totalCount} பயிற்சி வினாக்களுக்கும் பதிலளித்த பின்னரே இந்த நிலையை நிறைவு செய்ய முடியும்! (${answeredCount}/${totalCount} விடையளிக்கப்பட்டுள்ளது)` 
                            : `Please attend all ${totalCount} practice questions before marking this stage complete! (${answeredCount}/${totalCount} answered)`
                          );
                          return;
                        }
                        markStageComplete(4);
                        try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch(e){}
                      }}
                      disabled={!isAllAttended}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-xs min-h-[42px] transition-all ${
                        isAllAttended
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer ring-2 ring-emerald-300 shadow-md scale-105 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
                      }`}
                      title={!isAllAttended ? `Attend all questions (${answeredCount}/${totalCount}) to enable completion` : "All practice questions attended! Click to complete Stage 4"}
                    >
                      {isAllAttended ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                      <span>
                        {isAllAttended
                          ? (lang === "ta" ? "நிறைவு செய்க & தொடர்க →" : "Mark as Complete & Proceed →")
                          : (lang === "ta" ? `அனைத்து வினாக்களுக்கும் பதிலளிக்கவும் (${answeredCount}/${totalCount})` : `Attend all questions (${answeredCount}/${totalCount})`)}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>

            {questionsLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-[#061b36]">
                  Loading practice questions for {lessonData.title}...
                </p>
              </div>
            ) : questionsData.length === 0 ? (
              <div className="text-center py-14 sm:py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
                <HelpCircle className="w-12 h-12 text-[#ff7a00] mx-auto animate-float" />
                <h4 className="text-base sm:text-lg font-black text-[#061b36]">{t.stage4Title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-medium">
                  {t.stage4Desc}
                </p>
                <button
                  onClick={() => handleLoadPracticeQuestions()}
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
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line tamil-content">
                        {cleanQuestionStem(q.question)}
                      </h4>

                      {/* Options in 2 columns: A & B on line 1, C & D on line 2 */}
                      {(() => {
                        const mapLetterToIdx = { A: 0, B: 1, C: 2, D: 3 };
                        const ansStr = typeof q.answer === "string" ? q.answer.trim().toUpperCase() : "";
                        const resolvedCorrectIdx = typeof q.answer_index === "number" && q.answer_index >= 0
                          ? q.answer_index
                          : ["A", "B", "C", "D"].includes(ansStr)
                          ? mapLetterToIdx[ansStr]
                          : (q.options || []).findIndex(o => o && o.trim() === q.answer?.trim());

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userPracticeAnswers[q.id] === optIdx;
                              const isCorrect = resolvedCorrectIdx >= 0 ? (resolvedCorrectIdx === optIdx) : (q.answer_index === optIdx);
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
                                {formatMathSymbols(opt)}
                              </span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-2 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                        </div>
                      );
                    })()}

                      {hasAnswered && (
                        <div className="p-4 rounded-xl bg-blue-50/90 border border-[#0055ff]/30 text-xs sm:text-sm text-[#061b36] font-medium leading-relaxed mt-2 animate-fade-in">
                          <div className="flex items-center space-x-1.5 font-black text-[#0055ff] mb-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{t.explanationTitle} (விரிவான விளக்கம்):</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-normal">{formatMathSymbols(q.explanation)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* STAGE 4 BOTTOM COMPLETION BAR */}
                {(() => {
                  const totalCount = questionsData.length;
                  const answeredCount = questionsData.filter((q, i) => {
                    const k = q.id !== undefined ? String(q.id) : String(i);
                    return userPracticeAnswers[k] !== undefined;
                  }).length;
                  const isAllAttended = totalCount > 0 && answeredCount >= totalCount;
                  const percentAttended = totalCount > 0 ? Math.min(100, Math.round((answeredCount / totalCount) * 100)) : 0;

                  return (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-orange-50/50 to-slate-50 border-2 border-orange-200/80 space-y-3 mt-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-black text-[#061b36] flex items-center space-x-2">
                            <CheckCircle2 className={`w-5 h-5 ${isAllAttended ? "text-emerald-600" : "text-[#ff7a00]"}`} />
                            <span>
                              {isAllAttended
                                ? (lang === "ta" ? "🎉 அனைத்துப் பயிற்சி வினாக்களுக்கும் பதிலளித்துவிட்டீர்கள்!" : "🎉 You have attended all practice questions!")
                                : (lang === "ta" ? `பயிற்சி முன்னேற்றம்: ${answeredCount}/${totalCount} விடையளிக்கப்பட்டுள்ளது` : `Practice Progress: ${answeredCount}/${totalCount} Questions Attended`)}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {isAllAttended
                              ? (lang === "ta" ? "இப்போது 'நிறைவு செய்க & தொடர்க' பட்டனை அழுத்தி Stage 5 இறுதித் தேர்வுக்குச் செல்லலாம்." : "Ready to proceed! Click 'Mark as Complete & Proceed' to unlock Stage 5 Timed Final Exam.")
                              : (lang === "ta" ? `நிலை 4-ஐ நிறைவு செய்ய மீதமுள்ள ${totalCount - answeredCount} வினாக்களுக்கும் பதிலளிக்கவும்.` : `Please answer all remaining ${totalCount - answeredCount} questions to enable stage completion.`)}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (!isAllAttended) {
                              alert(lang === "ta" 
                                ? `அனைத்து ${totalCount} பயிற்சி வினாக்களுக்கும் பதிலளித்த பின்னரே இந்த நிலையை நிறைவு செய்ய முடியும்! (${answeredCount}/${totalCount} முடிந்தது)` 
                                : `Please attend all ${totalCount} questions before completing! (${answeredCount}/${totalCount} attended)`
                              );
                              return;
                            }
                            markStageComplete(4);
                            try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch(e){}
                          }}
                          disabled={!isAllAttended}
                          className={`px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all shrink-0 min-h-[46px] ${
                            isAllAttended
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer ring-4 ring-emerald-200 animate-pulse scale-105"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-75"
                          }`}
                          title={!isAllAttended ? `Attend all questions (${answeredCount}/${totalCount}) to enable completion` : "All practice questions attended! Click to complete Stage 4"}
                        >
                          {isAllAttended ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                          <span>
                            {isAllAttended 
                              ? (lang === "ta" ? "நிறைவு செய்க & தொடர்க →" : "Mark as Complete & Proceed →")
                              : (lang === "ta" ? `அனைத்து வினாக்களுக்கும் பதிலளிக்கவும் (${answeredCount}/${totalCount})` : `Attend all questions (${answeredCount}/${totalCount})`)}
                          </span>
                        </button>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${isAllAttended ? "bg-emerald-500" : "bg-gradient-to-r from-[#ff7a00] to-amber-500"}`}
                          style={{ width: `${percentAttended}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 5: TIMED FINAL EXAM (PASS MARK: 80%) --- */}
        {activeStage === 5 && (
          !questionsDone ? (
            <div className="text-center py-16 sm:py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-6 sm:p-10 space-y-4 max-w-2xl mx-auto animate-fade-in my-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-800 border border-amber-400/30 uppercase tracking-widest inline-block">
                  {lang === "ta" ? "நிலை 5 பூட்டப்பட்டுள்ளது" : "Stage 5 Disabled"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#061b36]">
                  {lang === "ta" 
                    ? "நிலை 4 பயிற்சி வினாக்களை நிறைவு செய்த பிறகே இந்த தேர்வு திறக்கப்படும்" 
                    : "Stage 5 is disabled until Stage 4 Practice is marked complete"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
                  {lang === "ta"
                    ? "Stage 5 இறுதித் தேர்வை எழுத, Stage 4-ல் உள்ள அனைத்து பயிற்சி வினாக்களுக்கும் பதிலளித்து 'நிறைவு செய்க' பட்டனை அழுத்தவும்."
                    : "To take the Stage 5 Timed Final Exam, please answer all practice questions in Stage 4 and click 'Mark as Complete & Proceed'."}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-6 py-3 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{lang === "ta" ? "Stage 4 பயிற்சிக்குச் செல்க →" : "Go to Stage 4 Practice →"}</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{t.stage5Title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.stage5Desc} • Score at least 80% to complete this lesson and unlock the next lesson.
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
                  : "bg-rose-50/90 border-rose-400 text-rose-950"
              }`}>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm ${
                  testResult.passed
                    ? "bg-emerald-100 border-2 border-emerald-500 text-emerald-700"
                    : "bg-rose-100 border-2 border-rose-500 text-rose-700"
                }`}>
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {testResult.passed ? "🎉 Lesson Completed Successfully!" : "⚠️ Exam Score Below 80% (Pass Mark Required)"}
                  </h3>
                  
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border text-sm font-extrabold shadow-2xs">
                    <span>{t.yourScore}:</span>
                    <span className={`text-lg font-black ${testResult.passed ? "text-emerald-600" : "text-rose-700"}`}>
                      {testResult.score_percent}%
                    </span>
                    <span className="text-slate-500">
                      ({testResult.correct_count} / {testResult.total_questions} Correct • Pass Mark: 80%)
                    </span>
                  </div>

                  <p className="text-sm font-medium max-w-lg mx-auto leading-relaxed">
                    {testResult.passed
                      ? "Great job! You achieved the required 80% pass mark. This lesson is successfully marked as complete and your daily streak is recorded!"
                      : "To successfully complete this lesson and unlock subsequent modules, you must achieve at least 80%. Please restudy Stage 4 with the alternate Type 2 question set before retaking the exam."}
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
                  {!testResult.passed && (
                    <button
                      onClick={() => {
                        setActiveStage(4);
                        setQuestionsData([]);
                        handleLoadPracticeQuestions("type2");
                      }}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer min-h-[42px] animate-pulse"
                    >
                      <RotateCcw className="w-4 h-4 text-purple-200" />
                      <span>🔄 Restudy Stage 4 with Type 2 Questions (வகை 2 மறுபயிற்சி)</span>
                    </button>
                  )}

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
                    <span>{testResult.passed ? "Retake for Higher Score" : "🔄 Retake Final Exam (80% Pass)"}</span>
                  </button>

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
                        <FileCheck className="w-5 h-5 text-[#0055ff]" />
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
                          </div>

                          <h5 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line tamil-content">
                            {cleanQuestionStem(item.question)}
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
              isTimeLocked ? (
                <div className="text-center py-12 sm:py-16 bg-gradient-to-b from-amber-50/80 to-slate-50 rounded-3xl border-2 border-amber-300 p-6 sm:p-8 space-y-4 shadow-sm animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-block uppercase tracking-wider">
                      🔒 Scheduled Daily Exam Unlock • இரவு 8:00 மணி
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-[#061b36] pt-1">
                      Stage 5 Final Timed Exam Opens at {unlockTimeStr} (8:00 PM)
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
                      TET-1 மற்றும் TET-2 பாடங்களுக்கான மாதிரித் தேர்வு தினமும் இரவு 8:00 மணிக்கு நேரடியாக திறக்கப்படும். அதுவரை நீங்கள் Stage 1 பாடப்புத்தகம், Stage 2 சுருக்கக் குறிப்புகள், Stage 3 வீடியோ மற்றும் Stage 4 பயிற்சி வினாக்களை நிறைவு செய்து தேர்வுக்கு தயாராகுங்கள்.
                    </p>
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="py-2">
                    <div className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-white border border-amber-300 shadow-sm">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">தேர்வு திறக்க இன்னும்:</span>
                      <span className="font-mono font-black text-sm sm:text-base text-amber-900">
                        {countdownStr || "Computing Time..."}
                      </span>
                    </div>
                  </div>

                  {/* Admin Manual Override Control */}
                  {user?.role === "admin" && (
                    <div className="pt-4 border-t border-amber-200/90 max-w-md mx-auto">
                      <p className="text-xs font-bold text-amber-800 mb-2">
                        Admin Executive Privileges:
                      </p>
                      <button
                        onClick={handleAdminToggleStage5}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                      >
                        🔓 Admin Override: Open Stage 5 Immediately for Students
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 bg-gradient-to-b from-emerald-50/90 via-teal-50/30 to-slate-50 rounded-3xl border-2 border-emerald-400 p-6 sm:p-10 space-y-5 shadow-sm animate-fade-in relative overflow-hidden">
                  {/* Top Live Badge */}
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm uppercase tracking-wider">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100"></span>
                    </span>
                    <span>🔓 Stage 5 Unlocked & Active • தேர்வு திறக்கப்பட்டுள்ளது!</span>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                    <Award className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl sm:text-2xl font-black text-[#061b36]">{t.stage5Title}</h4>
                    <p className="text-xs sm:text-sm text-emerald-950 max-w-lg mx-auto font-medium leading-relaxed bg-emerald-100/70 p-3.5 rounded-2xl border border-emerald-300">
                      {t.stage5Desc} • You must score at least <strong className="text-emerald-900 font-black">80%</strong> to complete this lesson and unlock subsequent lessons.
                    </p>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleStartTest}
                      disabled={testLoading}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer min-h-[46px] ring-4 ring-emerald-300/40 disabled:opacity-80"
                    >
                      {testLoading ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{lang === "ta" ? "வினாத்தாள் தயாராகிறது..." : "Preparing Exam Questions..."}</span>
                        </span>
                      ) : (
                        `🚀 ${t.startTimedExam}`
                      )}
                    </button>

                    {user?.role === "admin" && (
                      <button
                        onClick={handleAdminToggleStage5}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                        title="Lock Stage 5 back to 8:00 PM schedule"
                      >
                        🔒 Admin: Lock back to 8:00 PM
                      </button>
                    )}
                  </div>
                </div>
              )
            ) : testLoading || !testData?.questions ? (
              <div className="py-20 text-center space-y-4 bg-slate-50/80 rounded-3xl border border-slate-200 p-8 animate-fade-in">
                <div className="w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-base font-black text-[#061b36]">
                  {lang === "ta" ? "இறுதித் தேர்வு வினாத்தாள் தயாராகிறது..." : "Preparing 50 Exam Questions..."}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                  {lang === "ta"
                    ? "பாடப்பகுதியிலிருந்து 50 வினாக்கள் சரிபார்க்கப்படுகின்றன. தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்..."
                    : "Validating non-overlapping questions across all 6 cognitive question types. Please wait a moment..."}
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
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line tamil-content">
                        {cleanQuestionStem(q.question)}
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
        )
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
