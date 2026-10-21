import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  PlayCircle,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { fetchApi } from "../api";
import { downloadQuizAsPdf } from "../utils/pdfExport";

export default function DailyPracticeModal({ practiceId, onClose, user, lang = "en" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(null);

  // Practice state (Stage 3)
  const [practiceAnswers, setPracticeAnswers] = useState({});

  // Timed Exam state (Stage 4)
  const [examActive, setExamActive] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examResult, setExamResult] = useState(null);
  const [canDownloadQuiz, setCanDownloadQuiz] = useState(true);

  useEffect(() => {
    fetchApi("/public-settings")
      .then((settings) => {
        if (settings && typeof settings.enable_quiz_download === "boolean") {
          setCanDownloadQuiz(settings.enable_quiz_download);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (practiceId) {
      loadDetail();
    }
  }, [practiceId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/daily-practice/${practiceId}`);
      setData(res);
      const rawStages = res.active_stages;
      const stages = Array.isArray(rawStages)
        ? rawStages
        : (typeof rawStages === "string" ? rawStages.split(",").map(Number).filter(n => !isNaN(n)) : [1, 3, 4]);
      if (stages.length > 0) {
        setActiveStage(stages[0]);
      }
      setTimeLeft((res.time_limit_mins || 20) * 60);
    } catch (err) {
      console.error("Failed to load daily practice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Exam timer
  useEffect(() => {
    if (!examActive || timeLeft <= 0 || examResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examActive, timeLeft, examResult]);

  const handleStartExam = () => {
    setExamAnswers({});
    setExamResult(null);
    setTimeLeft((data?.time_limit_mins || 20) * 60);
    setExamActive(true);
  };

  const handleFinishExam = () => {
    setExamActive(false);
    const questions = data?.questions || [];
    let correct = 0;
    questions.forEach((q, idx) => {
      const userPick = examAnswers[idx];
      let correctIdx = q.answer_index;
      if (correctIdx === undefined && q.answer) {
        correctIdx = typeof q.answer === "string" ? q.answer.charCodeAt(0) - 65 : q.answer;
      }
      if (userPick === correctIdx) {
        correct += 1;
      }
    });

    const total = questions.length || 1;
    const scorePct = Math.round((correct / total) * 100);
    const passPct = data?.pass_percentage || 80;
    const passed = scorePct >= passPct;

    setExamResult({
      score: scorePct,
      correctCount: correct,
      totalCount: total,
      passed,
      passPercentage: passPct
    });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  const formatTime = formatTimer;

  const stageLabels = {
    1: { name: "Stage 1: பாடம் & குறிப்புகள் (Study Material)", icon: FileText, color: "text-[#0055ff]" },
    2: { name: "Stage 2: வீடியோ விளக்கம் (Video Class)", icon: PlayCircle, color: "text-[#00b027]" },
    3: { name: "Stage 3: பயிற்சி வினாக்கள் (Practice Quiz)", icon: HelpCircle, color: "text-[#ff7a00]" },
    4: { name: "Stage 4: மாதிரித் தேர்வு (Final Timed Exam)", icon: Award, color: "text-[#7d00e5]" }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-[#0055ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#061b36]">Loading Daily Practice Test...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const rawStages = data.active_stages;
  const activeStages = Array.isArray(rawStages)
    ? rawStages
    : (typeof rawStages === "string" ? rawStages.split(",").map(Number).filter(n => !isNaN(n)) : [1, 3, 4]);
  const questions = Array.isArray(data.questions) ? data.questions : [];

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col w-screen h-screen overflow-hidden animate-fade-in">
      
      {/* FULL-PAGE APPLICATION HEADER */}
      <header className="bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer shrink-0"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 font-black uppercase text-[10px]">
                Class {data.class_num} • {data.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold text-[10px]">
                {data.term}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 font-bold text-[10px] hidden sm:inline">
                Pass Mark: {data.pass_percentage || 80}%
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-black truncate">{data.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {activeStage === 4 && examActive && !examResult && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-[#061b36] font-mono font-black text-xs sm:text-sm shadow-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500 text-white transition cursor-pointer text-xs font-bold"
            title="Exit Test & Return to Dashboard"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Full Page</span>
          </button>
        </div>
      </header>

      {/* FULL-WIDTH STAGES TABS */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 flex items-center justify-between overflow-x-auto shrink-0 shadow-xs">
        <div className="flex items-center space-x-2 shrink-0">
          {activeStages.map((stg) => {
            const conf = stageLabels[stg] || { name: `Stage ${stg}`, icon: HelpCircle, color: "text-[#0055ff]" };
            const Icon = conf.icon;
            const isCurrent = activeStage === stg;
            return (
              <button
                key={stg}
                onClick={() => setActiveStage(stg)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? "bg-[#0055ff] text-white shadow-md font-black"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? "text-white" : conf.color}`} />
                <span>{conf.name}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 font-semibold">
          <span>TN TET Practice Portal • Full Workspace</span>
        </div>
      </div>

      {/* FULL-PAGE SCROLLABLE CONTENT VIEWPORT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 w-full max-w-7xl mx-auto space-y-6">

        {/* STAGE 1: STUDY MATERIAL */}
        {activeStage === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0055ff]" />
                  <span>பாடக் குறிப்புகள் & பாடப்பொருள் (Study Material & Notes)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Review textbook syllabus and key takeaways for this daily practice.
                </p>
              </div>

              {data.pdf_url && (
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#0055ff] border border-blue-200 text-xs font-bold hover:bg-blue-100 transition cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Open PDF</span>
                </a>
              )}
            </div>

            {data.pdf_url ? (
              <div className="w-full h-[calc(100vh-230px)] min-h-[580px] rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-100">
                <iframe
                  src={data.pdf_url}
                  className="w-full h-full"
                  title="Daily Practice Study Material"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <FileText className="w-12 h-12 text-[#0055ff] mx-auto opacity-70" />
                  <h4 className="text-base font-bold text-[#061b36]">வகுப்பு {data.class_num} {data.subject} பாடக் குறிப்புகள்</h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                    இந்த நாளுக்கான முக்கிய பாடக்கருத்துக்கள் மற்றும் குறிப்புகளை நேரடியாக Stage 3 வினாடி-வினா மற்றும் Stage 4 மாதிரித் தேர்வில் உடனடியாக பயிற்சி செய்யலாம்.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: VIDEO CLASS (Only if active) */}
          {activeStage === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                  <PlayCircle className="w-5 h-5 text-[#00b027]" />
                  <span>வீடியோ வழிகாட்டுதல் (Video Explanation Lesson)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Watch expert coaching breakdown and problem-solving techniques.
                </p>
              </div>

              <div className="aspect-video w-full max-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black">
                <iframe
                  src={data.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                  title="Daily Practice Video Lesson"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* STAGE 3: INTERACTIVE PRACTICE QUIZ */}
          {activeStage === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-[#ff7a00]" />
                    <span>பயிற்சி வினாக்கள் (Daily Practice Questions)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Answer questions with instant feedback and pedagogical theory explanations.
                  </p>
                </div>

                {canDownloadQuiz && questions.length > 0 && (
                  <button
                    onClick={() => {
                      downloadQuizAsPdf({
                        title: data.title,
                        lesson: { class_num: data.class_num, subject: data.subject, term: data.term },
                        quizType: "daily_practice",
                        questions: questions
                      });
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#061b36] text-xs font-bold border border-slate-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#0055ff]" />
                    <span>Download Quiz (PDF)</span>
                  </button>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-sm font-bold text-slate-600">No questions loaded for this daily practice yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const hasAnswered = practiceAnswers[idx] !== undefined;
                    let correctIdx = q.answer_index;
                    if (correctIdx === undefined && q.answer) {
                      correctIdx = typeof q.answer === "string" ? q.answer.charCodeAt(0) - 65 : q.answer;
                    }

                    return (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-black text-[#ff7a00] uppercase">
                          <span>Question {idx + 1} of {questions.length}</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-relaxed whitespace-pre-line">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {(q.options || []).map((opt, optIdx) => {
                            const isPicked = practiceAnswers[idx] === optIdx;
                            const isCorrect = correctIdx === optIdx;

                            let btnStyle = "bg-white border-slate-200 text-[#061b36] hover:bg-orange-50/50";
                            let badgeStyle = "bg-slate-100 text-slate-700";

                            if (hasAnswered) {
                              if (isCorrect) {
                                btnStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black";
                                badgeStyle = "bg-emerald-600 text-white font-black";
                              } else if (isPicked) {
                                btnStyle = "bg-rose-50 border-2 border-rose-500 text-rose-950 font-bold";
                                badgeStyle = "bg-rose-600 text-white font-black";
                              } else {
                                btnStyle = "bg-white/80 border-slate-200 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => setPracticeAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                                className={`p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center min-h-[44px] ${btnStyle}`}
                              >
                                <span className={`font-black mr-2.5 px-2.5 py-1 rounded-md text-xs shrink-0 ${badgeStyle}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                                {hasAnswered && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-2 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {hasAnswered && q.explanation && (
                          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-[#061b36] mt-2">
                            <span className="font-black text-[#0055ff] block mb-0.5">விளக்கம் (Pedagogical Rationale):</span>
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

          {/* STAGE 4: TIMED FINAL EXAM (PASS MARK: 80%) */}
          {activeStage === 4 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#061b36] flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>மாதிரித் தேர்வு (Daily Timed Exam • Pass Mark: {data.pass_percentage || 80}%)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Time limit: {data.time_limit_mins || 20} Mins • Total Questions: {questions.length}
                  </p>
                </div>

                {examActive && (
                  <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-black text-sm">
                    <Clock className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Time Left: {formatTimer(timeLeft)}</span>
                  </div>
                )}
              </div>

              {examResult ? (
                <div className={`rounded-3xl p-6 sm:p-8 text-center space-y-4 border-2 ${
                  examResult.passed
                    ? "bg-emerald-50/90 border-emerald-400 text-emerald-950"
                    : "bg-rose-50/90 border-rose-400 text-rose-950"
                }`}>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-xs ${
                    examResult.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    <Award className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black">
                    {examResult.passed ? "🎉 Daily Practice Completed Successfully!" : "⚠️ Exam Score Below Required Pass Mark"}
                  </h3>

                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border text-sm font-black shadow-2xs">
                    <span>Score:</span>
                    <span className={`text-lg font-black ${examResult.passed ? "text-emerald-600" : "text-rose-700"}`}>
                      {examResult.score}%
                    </span>
                    <span className="text-slate-500">
                      ({examResult.correctCount} / {examResult.totalCount} Correct • Pass Mark: {examResult.passPercentage}%)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium max-w-md mx-auto">
                    {examResult.passed
                      ? "Congratulations! You have successfully passed today's practice test. Keep up your continuous learning streak!"
                      : "You did not achieve the required pass mark. Review Stage 3 practice questions and try the exam again!"}
                  </p>

                  <div className="pt-2 flex justify-center space-x-3">
                    <button
                      onClick={handleStartExam}
                      className="px-6 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Retake Exam
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : !examActive ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
                  <Award className="w-12 h-12 text-[#0055ff] mx-auto animate-float" />
                  <h4 className="text-lg font-black text-[#061b36]">{data.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
                    This daily test contains <strong>{questions.length} questions</strong>. You will have <strong>{data.time_limit_mins || 20} minutes</strong>. Score at least <strong>{data.pass_percentage || 80}%</strong> to qualify.
                  </p>
                  <button
                    onClick={handleStartExam}
                    className="px-8 py-3 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
                  >
                    Start Timed Exam Now →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sticky exam bar */}
                  <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Answered: {Object.keys(examAnswers).length} / {questions.length}
                    </span>
                    <button
                      onClick={handleFinishExam}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm cursor-pointer"
                    >
                      Submit Exam ✓
                    </button>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <span className="text-xs font-black text-[#7d00e5] uppercase">
                          Question {idx + 1} of {questions.length}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#061b36] whitespace-pre-line">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {(q.options || []).map((opt, optIdx) => {
                            const isPicked = examAnswers[idx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => setExamAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                                className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center min-h-[44px] ${
                                  isPicked
                                    ? "bg-blue-50 border-2 border-[#0055ff] text-[#0055ff] font-black shadow-2xs"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className={`font-black mr-2.5 px-2.5 py-1 rounded-md text-xs shrink-0 ${
                                  isPicked ? "bg-[#0055ff] text-white" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                    <button
                      onClick={handleFinishExam}
                      className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
                    >
                      Submit All Answers & View Score →
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

      </main>
    </div>
  );
}
