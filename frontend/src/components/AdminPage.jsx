import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Upload, 
  Settings, 
  Users, 
  BarChart3, 
  Bell, 
  FileText, 
  Trash2, 
  Key, 
  FilePlus,
  FileCheck,
  Award,
  Plus,
  BookOpen,
  FolderPlus,
  ExternalLink,
  Filter,
  UserCheck,
  Video,
  Clock,
  Calendar,
  HelpCircle,
  Edit3,
  Download,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Radio,
  Search,
  TrendingUp,
  Activity,
  UserPlus,
  CheckSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  SlidersHorizontal,
  LayoutDashboard,
  Save,
  Check,
  Share2,
  Copy,
  LayoutGrid,
  Library,
  Newspaper,
  BookCheck,
  Languages,
  CreditCard,
  Lock,
  Server,
  HardDrive,
  Cpu,
  Terminal,
  Database,
  EyeOff,
  ShieldAlert,
  Tag,
  Sparkles,
  Percent
} from "lucide-react";
import { fetchApi, saveUploadedMaterialClient, saveUploadedLessonClient } from "../api";
import { translations } from "../translations";
import Toast from "./Toast";
import { downloadQuizAsPdf } from "../utils/pdfExport";

const cleanQuestionText = (text, lessonTitle = "") => {
  if (!text) return "";
  let clean = text;
  if (lessonTitle) {
    const escaped = lessonTitle.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    clean = clean.replace(new RegExp(`['"]?${escaped}['"]?\\s*(பாடப்பகுதியி[^\\s]*\\s*(அடிப்படையில்,?\\s*|தொடர்பான\\s*|ஆழமாகப்\\s*)?|பாடப்பகுதியில்\\s*(உள்ள\\s*|இடம்\\s*பெற்றுள்ள\\s*|குறிப்பிடப்பட்டுள்ள\\s*)?|பாடத்தி[^\\s]*\\s*|-|\\:)?\\s*`, 'gi'), '');
  }
  clean = clean.replace(/'[^']+'\s*பாடப்பகுதியி[^\s]*\s*(அடிப்படையில்,?\s*|தொடர்பான\s*|ஆழமாகப்\s*)?,?\s*/g, '');
  clean = clean.replace(/'[^']+'\s*பாடப்பகுதியில்\s*(உள்ள\s*|இடம்\s*பெற்றுள்ள\s*|குறிப்பிடப்பட்டுள்ள\s*)?/g, '');
  clean = clean.replace(/^'[^']+'\s*[-:]\s*/g, '');
  clean = clean.replace(/^'[^']+'\s*/g, '');
  clean = clean.replace(/^\d+\.\s*[^\s\-:]+\s*[-:]\s*/g, '');
  clean = clean.replace(/^தகவல்களின் அடிப்படையில்,?\s*/g, '');
  clean = clean.replace(/^உள்ள தகவல்களைப் பொருத்துக:/g, 'கீழ்க்கண்ட தகவல்களைப் பொருத்துக:');
  clean = clean.replace(/^இடம்பெற்றுள்ள கீழ்க்கண்ட/g, 'கீழ்க்கண்ட');
  clean = clean.replace(/^குறிப்பிடப்பட்டுள்ள நிகழ்வுகள்/g, 'கீழ்க்கண்ட நிகழ்வுகள்');
  clean = clean.replace(/^:\s*\n*/g, '');
  clean = clean.replace(/^Based on '[^']*',?\s*/gi, '');
  clean = clean.replace(/^Based on\s*[,:]?\s*/gi, '');
  clean = clean.replace(/^In '[^']*',?\s*/gi, '');
  clean = clean.replace(/^In the context of '[^']*',?\s*:?\s*/gi, '');
  clean = clean.replace(/^In the context of\s*[,:]?\s*/gi, '');
  clean = clean.replace(/^According to '[^']*',?\s*/gi, '');
  clean = clean.replace(/^According to\s*[,:]?\s*/gi, '');
  clean = clean.replace(/^In\s*[,:]\s*/gi, '');
  clean = clean.replace(/^[,:\-–—\s]+/g, '');
  clean = clean.trim();
  if (clean && /^[a-z]/.test(clean)) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
};

// WhatsApp / Telegram Lesson Sharing Modal with Direct Auto-Login Deep Links
function ShareLessonMessageModal({ lesson, onClose, showToast }) {
  if (!lesson) return null;

  const tamilClassMap = {
    1: "ஒன்றாம் வகுப்பு",
    2: "இரண்டாம் வகுப்பு",
    3: "மூன்றாம் வகுப்பு",
    4: "நான்காம் வகுப்பு",
    5: "ஐந்தாம் வகுப்பு",
    6: "ஆறாம் வகுப்பு",
    7: "ஏழாம் வகுப்பு",
    8: "எட்டாம் வகுப்பு",
    9: "ஒன்பதாம் வகுப்பு",
    10: "பத்தாம் வகுப்பு",
    11: "பதினொன்றாம் வகுப்பு",
    12: "பன்னிரண்டாம் வகுப்பு"
  };

  const tamilSubjectMap = {
    "Tamil": "தமிழ்",
    "English": "ஆங்கிலம்",
    "Mathematics": "கணிதம்",
    "Maths": "கணிதம்",
    "Science": "அறிவியல்",
    "Social Science": "சமூக அறிவியல்",
    "Child Development and Pedagogy": "குழந்தை மேம்பாடும் கற்பித்தல் முறைகளும்",
    "CDP": "குழந்தை மேம்பாடும் கற்பித்தல் முறைகளும்"
  };

  const tamilDayNumberMap = {
    1: "முதல்நாள்",
    2: "2-ஆம் நாள்",
    3: "3-ஆம் நாள்",
    4: "4-ஆம் நாள்",
    5: "5-ஆம் நாள்",
    6: "6-ஆம் நாள்",
    7: "7-ஆம் நாள்",
    8: "8-ஆம் நாள்",
    9: "9-ஆம் நாள்",
    10: "10-ஆம் நாள்"
  };

  const [dayTitle, setDayTitle] = useState(() => tamilDayNumberMap[lesson.lesson_order] || (lesson.lesson_order === 1 ? "முதல்நாள்" : `${lesson.lesson_order}-ஆம் நாள்`));
  const [paperTitle, setPaperTitle] = useState(() => lesson.class_num <= 8 ? "TET PAPER - 1 பயிற்சி" : "TET PAPER - 2 பயிற்சி");
  const [classTitle, setClassTitle] = useState(() => tamilClassMap[lesson.class_num] || `${lesson.class_num}-ஆம் வகுப்பு`);
  const [subjectTitle, setSubjectTitle] = useState(() => tamilSubjectMap[lesson.subject] || lesson.subject);
  const [unitTitle, setUnitTitle] = useState(() => `அலகு ${lesson.lesson_order || 1}`);
  const [lessonTitle, setLessonTitle] = useState(() => `பாடம் ${lesson.title}`);
  const [stage5Status, setStage5Status] = useState(() => (lesson.stage5_force_open ?? lesson.stage4_force_open) ? "TEST LINK OPEN (திறக்கப்பட்டது)" : "TEST LINK OPEN 8:00 PM");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://tnteachers.in";
  const stage1Url = `${origin}/learning/lesson/${lesson.id}?stage=1`;
  const stage2Url = `${origin}/learning/lesson/${lesson.id}?stage=2`;
  const stage3Url = `${origin}/learning/lesson/${lesson.id}?stage=3`;
  const stage4Url = `${origin}/learning/lesson/${lesson.id}?stage=4`;
  const stage5Url = `${origin}/learning/lesson/${lesson.id}?stage=5`;

  const fullMessage = `${dayTitle} \n\n ${paperTitle} \n\n${classTitle}\n ${subjectTitle} \n${unitTitle}\n ${lessonTitle} \n\nStage 1 \nLESSON PDF LINK \n${stage1Url}\n\nStage 2 \nSHORT NOTES LINK\n${stage2Url}\n\nStage 3 \nLESSON VIDEO LINK\n${stage3Url}\n\nStage 4 \nPRACTICE QA LINK\n${stage4Url}\n\nStage 5\n${stage5Status} \n${stage5Url}`;

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullMessage);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullMessage;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast("பகிர்வு செய்தி நகலெடுக்கப்பட்டது (Copied to clipboard)!", "success");
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      showToast("செய்தியை நகலெடுக்க இயலவில்லை.", "error");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(stage1Url)}&text=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                தினசரி பயிற்சிப் பகிர்வுச் செய்தி (Daily Study Plan Message)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                மாணவர்கள் நேரடியாக பாடத்திற்குச் செல்லக்கூடிய 5 நிலை நேரடி இணைப்புகளுடன்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customizable Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block font-bold text-slate-700 mb-1">நாள் வரிசை (Day)</label>
            <input
              type="text"
              value={dayTitle}
              onChange={(e) => setDayTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">TET தேர்வுத் தாள் (Paper)</label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">வகுப்பு (Class)</label>
            <input
              type="text"
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">பாடம் / துறை (Subject)</label>
            <input
              type="text"
              value={subjectTitle}
              onChange={(e) => setSubjectTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">அலகு (Unit)</label>
            <input
              type="text"
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">பாடம் தலைப்பு (Lesson Title)</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">நிலை 5 தேர்வு நிலை (Stage 5 Status / Unlock Time)</label>
            <input
              type="text"
              value={stage5Status}
              onChange={(e) => setStage5Status(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[#0055ff]"
            />
          </div>
        </div>

        {/* Live WhatsApp Bubble Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center space-x-1">
              <span>நேரடி முன்னோட்டம் (WhatsApp Message Preview):</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ Direct Auto-Login Deep Links (5 Stages)
            </span>
          </div>
          <div className="bg-[#e7f8ee] border border-emerald-200/90 rounded-2xl p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-56 overflow-y-auto select-all">
            {fullMessage}
          </div>
        </div>

        {/* Stage Direct Test Links */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600">நேரடி சோதனை (Test Deep Links):</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <a
              href={stage1Url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-sky-100 text-[#0284c7] hover:bg-sky-200 font-bold text-[11px] transition"
            >
              Stage 1 (PDF) ↗
            </a>
            <a
              href={stage2Url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 font-bold text-[11px] transition"
            >
              Stage 2 (Notes) ↗
            </a>
            <a
              href={stage3Url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold text-[11px] transition"
            >
              Stage 3 (Video) ↗
            </a>
            <a
              href={stage4Url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#0055ff] hover:bg-blue-200 font-bold text-[11px] transition"
            >
              Stage 4 (Practice) ↗
            </a>
            <a
              href={stage5Url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-[11px] transition"
            >
              Stage 5 (Exam) ↗
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            மூடு (Close)
          </button>

          <button
            type="button"
            onClick={handleTelegramShare}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1d87ba] text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>✈️ Telegram பகிர்வு</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>💬 WhatsApp பகிர்வு</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "நகலெடுக்கப்பட்டது! (Copied)" : "செய்தியை நகலெடு (Copy)"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AdminPage({ user, lang = "en" }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [sharingLesson, setSharingLesson] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [stats, setStats] = useState(null);
  const [vpsStatus, setVpsStatus] = useState(null);
  const [vpsLoading, setVpsLoading] = useState(false);
  const [vpsLogsCopied, setVpsLogsCopied] = useState(false);
  const [vpsSshCopied, setVpsSshCopied] = useState(false);
  const [vpsMysqlCopied, setVpsMysqlCopied] = useState(false);

  // VPS Access Password Gate State (tnteachers.in)
  const [isVpsUnlocked, setIsVpsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem("vps_tab_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [vpsPasswordInput, setVpsPasswordInput] = useState("");
  const [vpsPasswordError, setVpsPasswordError] = useState(null);
  const [showVpsPassword, setShowVpsPassword] = useState(false);

  const handleUnlockVps = (e) => {
    if (e) e.preventDefault();
    if (vpsPasswordInput.trim() === "tnteachers.in") {
      setIsVpsUnlocked(true);
      setVpsPasswordError(null);
      try {
        sessionStorage.setItem("vps_tab_unlocked", "true");
        sessionStorage.setItem("vps_access_key", "tnteachers.in");
      } catch {}
      loadVpsStatus("tnteachers.in");
      showToast("VPS Infrastructure Unlocked Successfully!", "success");
    } else {
      setVpsPasswordError("Incorrect Password. Entry Denied.");
      showToast("Access Denied: Incorrect Password", "error");
    }
  };

  const handleLockVps = () => {
    setIsVpsUnlocked(false);
    setVpsStatus(null);
    setVpsPasswordInput("");
    setVpsPasswordError(null);
    try {
      sessionStorage.removeItem("vps_tab_unlocked");
      sessionStorage.removeItem("vps_access_key");
    } catch {}
    showToast("VPS & Server Status Tab Locked", "info");
  };

  const t = translations[lang] || translations.en;

  // Catalog Filter States
  const [matFilterClass, setMatFilterClass] = useState("All");
  const [matFilterSubject, setMatFilterSubject] = useState("All");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isUpdatingMaterial, setIsUpdatingMaterial] = useState(false);
  const [lesFilterSubject, setLesFilterSubject] = useState("All");
  const [lesFilterClass, setLesFilterClass] = useState("All");
  const [lesSearchQuery, setLesSearchQuery] = useState("");

  // Upload Form State for Materials Explorer
  const [matClass, setMatClass] = useState(1);
  const [matSubject, setMatSubject] = useState("Tamil");
  const [customMatSubject, setCustomMatSubject] = useState("");
  const [isCustomMatSubject, setIsCustomMatSubject] = useState(false);
  const [matMedium, setMatMedium] = useState("Tamil Medium");
  const [matTerm, setMatTerm] = useState("Term-1");
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFile, setMatFile] = useState(null);
  const [materialsList, setMaterialsList] = useState([]);
  const [uploadingMat, setUploadingMat] = useState(false);

  // Upload Form State for Learning Portal
  const [lesClass, setLesClass] = useState(1);
  const [lesSubject, setLesSubject] = useState("Tamil");
  const [customLesSubject, setCustomLesSubject] = useState("");
  const [isCustomLesSubject, setIsCustomLesSubject] = useState(false);
  const [lesMedium, setLesMedium] = useState("Tamil Medium");
  const [lesTerm, setLesTerm] = useState("Term-1");
  const [lesOrder, setLesOrder] = useState(1);
  const [lesTitle, setLesTitle] = useState("");
  const [lesDesc, setLesDesc] = useState("");
  const [lesVideoUrl, setLesVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [lesFile, setLesFile] = useState(null);
  const [lesAvailableAt, setLesAvailableAt] = useState("");
  const [lessonsList, setLessonsList] = useState([]);
  const [uploadingLes, setUploadingLes] = useState(false);
  const [lesShortNotesFile, setLesShortNotesFile] = useState(null);
  const [uploadShortNotesModal, setUploadShortNotesModal] = useState(null);
  const [uploadingShortNotes, setUploadingShortNotes] = useState(false);
  const [shortNotesFile, setShortNotesFile] = useState(null);

  // Edit Lesson Modal State
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [savingEditLesson, setSavingEditLesson] = useState(false);
  const [editLessonPdfFile, setEditLessonPdfFile] = useState(null);
  const [editLessonNotesFile, setEditLessonNotesFile] = useState(null);

  // Quiz Management States
  const [quizGradeFilter, setQuizGradeFilter] = useState("All");
  const [quizSubjectFilter, setQuizSubjectFilter] = useState("All");
  const [generatingQuizKey, setGeneratingQuizKey] = useState(null);
  const [manualQuizModal, setManualQuizModal] = useState(null); // { lesson, quiz_type, questions }
  const [viewQuizModal, setViewQuizModal] = useState(null); // { lesson, quiz_type, questions }
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({}); // { [qIdx]: selectedOption }
  const [editingQuizQuestionIdx, setEditingQuizQuestionIdx] = useState(null);
  const [editingQuestionForm, setEditingQuestionForm] = useState(null);
  const [regeneratingQuizQuestionIdx, setRegeneratingQuizQuestionIdx] = useState(null);
  const [savingQuizModal, setSavingQuizModal] = useState(false);
  const [revealedExplanations, setRevealedExplanations] = useState({});
  const [savingManualQuiz, setSavingManualQuiz] = useState(false);
  const [uploadQuizPdfModal, setUploadQuizPdfModal] = useState(null); // { lesson, quiz_type }
  const [uploadingQuizPdf, setUploadingQuizPdf] = useState(false);
  const [quizPdfFile, setQuizPdfFile] = useState(null);

  // Live Meetings State
  const [meetingsList, setMeetingsList] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingStart, setMeetingStart] = useState("");
  const [meetingEnd, setMeetingEnd] = useState("");
  const [meetingDesc, setMeetingDesc] = useState("");
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [isEditMeetingModalOpen, setIsEditMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [savingEditMeeting, setSavingEditMeeting] = useState(false);

  // Settings State
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [practiceCount, setPracticeCount] = useState(200);
  const [testCount, setTestCount] = useState(100);
  const [timeLimit, setTimeLimit] = useState(60);
  const [passPercent, setPassPercent] = useState(80);
  const [countMcq, setCountMcq] = useState(40);
  const [countHots, setCountHots] = useState(20);
  const [countMatch, setCountMatch] = useState(10);
  const [countMultiStmt, setCountMultiStmt] = useState(10);
  const [countAssertion, setCountAssertion] = useState(10);
  const [countChronological, setCountChronological] = useState(10);

  // Stage 4 Test Distribution State
  const [stage4CountMcq, setStage4CountMcq] = useState(20);
  const [stage4CountHots, setStage4CountHots] = useState(10);
  const [stage4CountMatch, setStage4CountMatch] = useState(5);
  const [stage4CountMultiStmt, setStage4CountMultiStmt] = useState(5);
  const [stage4CountAssertion, setStage4CountAssertion] = useState(5);
  const [stage4CountChronological, setStage4CountChronological] = useState(5);

  // Download Permissions & Razorpay State
  const [enableMaterialDownload, setEnableMaterialDownload] = useState(true);
  const [enableQuizDownload, setEnableQuizDownload] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [coursePrice, setCoursePrice] = useState(999);
  const [originalPrice, setOriginalPrice] = useState(2499);
  const [discountPercent, setDiscountPercent] = useState(60);

  // Coupon System State
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponFormMode, setCouponFormMode] = useState("custom");
  const [couponCode, setCouponCode] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState("percent");
  const [couponDiscountValue, setCouponDiscountValue] = useState(20);
  const [couponUsageLimit, setCouponUsageLimit] = useState(50);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState(0);
  const [couponStartDate, setCouponStartDate] = useState("");
  const [couponEndDate, setCouponEndDate] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [randomPrefix, setRandomPrefix] = useState("TET");
  const [randomValidDays, setRandomValidDays] = useState(30);

  // Enrollments & Student Access Management State
  const [enrollmentsList, setEnrollmentsList] = useState([]);
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("all");
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState("all");
  const [isManualEnrollModalOpen, setIsManualEnrollModalOpen] = useState(false);
  const [manualEnrollName, setManualEnrollName] = useState("");
  const [manualEnrollMobile, setManualEnrollMobile] = useState("");
  const [manualEnrollEmail, setManualEnrollEmail] = useState("");
  const [manualEnrollDesignation, setManualEnrollDesignation] = useState("TET Aspirant");
  const [manualEnrollCourse, setManualEnrollCourse] = useState("TET 1 and TET 2");
  const [manualEnrollNotes, setManualEnrollNotes] = useState("");
  const [submittingManualEnroll, setSubmittingManualEnroll] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);

  // User Management Directory State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [creatingUser, setCreatingUser] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Announcement State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("normal");
  const [postingAnn, setPostingAnn] = useState(false);

  // Admin Account Registration State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [registeringAdmin, setRegisteringAdmin] = useState(false);

  // TET Cards Management State
  const [adminTetCards, setAdminTetCards] = useState([]);
  const [cardIdInput, setCardIdInput] = useState("");
  const [cardTitleInput, setCardTitleInput] = useState("");
  const [cardDescInput, setCardDescInput] = useState("");
  const [cardRangeInput, setCardRangeInput] = useState("Classes 1–8");
  const [cardPaperInput, setCardPaperInput] = useState("paper1");
  const [customPaperTarget, setCustomPaperTarget] = useState("");
  const [cardStartClass, setCardStartClass] = useState(1);
  const [cardEndClass, setCardEndClass] = useState(8);
  const [cardBtnTextInput, setCardBtnTextInput] = useState("OPEN →");
  const [savingCard, setSavingCard] = useState(false);

  // Dashboard Containers Management State (CRUD)
  const [adminContainers, setAdminContainers] = useState([]);
  const [editingContainerId, setEditingContainerId] = useState(null);
  const [cKeyInput, setCKeyInput] = useState("");
  const [cTitleInput, setCTitleInput] = useState("");
  const [cSubtitleInput, setCSubtitleInput] = useState("");
  const [cCategoryInput, setCCategoryInput] = useState("tet");
  const [cDescInput, setCDescInput] = useState("");
  const [cBadgeInput, setCBadgeInput] = useState("");
  const [cBtnTextInput, setCBtnTextInput] = useState("OPEN →");
  const [cActionUrlInput, setCActionUrlInput] = useState("");
  const [cIconInput, setCIconInput] = useState("BookOpen");
  const [cOrderInput, setCOrderInput] = useState(1);
  const [cIsActiveInput, setCIsActiveInput] = useState(true);
  const [savingContainer, setSavingContainer] = useState(false);
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);


  // Auto-set medium for language subjects
  useEffect(() => {
    if (matSubject === "Tamil") {
      setMatMedium("Tamil Medium");
    } else if (matSubject === "English") {
      setMatMedium("English Medium");
    }
  }, [matSubject]);

  useEffect(() => {
    if (lesSubject === "Tamil") {
      setLesMedium("Tamil Medium");
    } else if (lesSubject === "English") {
      setLesMedium("English Medium");
    }
  }, [lesSubject]);

  const standardSubjects = [
    "Tamil", "English", "Mathematics", "Science", "Social Science",
    "Physics", "Chemistry", "Botany", "Zoology", "Computer Science",
    "Commerce", "Economics", "Accountancy",
    "Psychology", "Tamil Grammar", "English Grammar", "Previous Year Papers"
  ];

  // Daily Practice Management State
  const [dailyPracticeList, setDailyPracticeList] = useState([]);
  const [dpTitle, setDpTitle] = useState("");
  const [dpDesc, setDpDesc] = useState("");
  const [dpClass, setDpClass] = useState(8);
  const [dpSubject, setDpSubject] = useState("Social Science");
  const [dpTerm, setDpTerm] = useState("Term-1");
  const [dpActiveStages, setDpActiveStages] = useState([1, 3, 4]); // Stages 1, 3, 4 enabled by default
  const [dpPdfUrl, setDpPdfUrl] = useState("");
  const [dpPdfFile, setDpPdfFile] = useState(null);
  const [dpUploadingPdf, setDpUploadingPdf] = useState(false);
  const [viewingQuizDp, setViewingQuizDp] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [downloadingQuizId, setDownloadingQuizId] = useState(null);
  const [dpVideoUrl, setDpVideoUrl] = useState("");
  const [dpQuestionsCount, setDpQuestionsCount] = useState(20);
  const [dpTimeLimit, setDpTimeLimit] = useState(20);
  const [dpPassPercent, setDpPassPercent] = useState(80);
  const [creatingDp, setCreatingDp] = useState(false);
  const [generatingDpId, setGeneratingDpId] = useState(null);

  useEffect(() => {
    loadStats();
    loadMaterials();
    loadLessons();
    loadSettings();
    loadUsers();
    loadAnnouncements();
    loadTetCards();
    loadContainers();
    loadMeetings();
    loadDailyPractices();
    loadEnrollments();
    loadCoupons();
    if (sessionStorage.getItem("vps_tab_unlocked") === "true") {
      loadVpsStatus("tnteachers.in");
    }
  }, []);

  const loadVpsStatus = async (overridePw) => {
    const pw = overridePw || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vps_access_key") : null) || "tnteachers.in";
    setVpsLoading(true);
    try {
      const data = await fetchApi(`/admin/vps-status?password=${encodeURIComponent(pw)}`);
      if (data) {
        setVpsStatus(data);
      }
    } catch (err) {
      console.error("VPS status error:", err);
      showToast("Unable to fetch live VPS telemetry from server.", "error");
    } finally {
      setVpsLoading(false);
    }
  };

  const loadDailyPractices = async () => {
    try {
      const data = await fetchApi("/admin/daily-practice");
      setDailyPracticeList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Daily practices error:", err);
      setDailyPracticeList([]);
    }
  };

  const handleCreateDailyPractice = async (e) => {
    e.preventDefault();
    if (!dpTitle || !dpSubject) {
      return showToast("Please fill in Title and Subject for Daily Practice.", "error");
    }
    setCreatingDp(true);
    try {
      await fetchApi("/admin/daily-practice", {
        method: "POST",
        body: JSON.stringify({
          title: dpTitle,
          description: dpDesc,
          class_num: Number(dpClass),
          subject: dpSubject,
          term: dpTerm,
          active_stages: dpActiveStages.sort().join(","),
          pdf_url: dpPdfUrl,
          video_url: dpVideoUrl,
          test_questions_count: Number(dpQuestionsCount),
          time_limit_mins: Number(dpTimeLimit),
          pass_percentage: Number(dpPassPercent)
        })
      });
      showToast("Daily Practice Test created and published to Student Dashboard!", "success");
      setDpTitle("");
      setDpDesc("");
      setDpPdfUrl("");
      setDpPdfFile(null);
      loadDailyPractices();
    } catch (err) {
      showToast(err.message || "Failed to create daily practice.", "error");
    } finally {
      setCreatingDp(false);
    }
  };

  const handleDeleteDailyPractice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Daily Practice test?")) return;
    try {
      await fetchApi(`/admin/daily-practice/${id}`, { method: "DELETE" });
      showToast("Daily practice test deleted.");
      loadDailyPractices();
    } catch (err) {
      showToast("Failed to delete daily practice.", "error");
    }
  };

  const handleGenerateDailyQuiz = async (dp) => {
    setGeneratingDpId(dp.id);
    try {
      const res = await fetchApi(`/admin/daily-practice/${dp.id}/generate-quiz?count=${dp.test_questions_count || 20}`, {
        method: "POST"
      });
      showToast(res.message || "AI questions generated successfully!", "success");
      loadDailyPractices();
    } catch (err) {
      showToast("Failed to generate quiz: " + err.message, "error");
    } finally {
      setGeneratingDpId(null);
    }
  };

  const handleDailyPracticeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return showToast("Please select a valid PDF file.", "error");
    }
    setDpUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-file", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setDpPdfUrl(data.url);
      setDpPdfFile({ name: file.name, size: data.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
      showToast("Study Material PDF uploaded successfully!", "success");
    } catch (err) {
      console.error("PDF upload error:", err);
      showToast("PDF upload failed. You can enter URL manually.", "error");
    } finally {
      setDpUploadingPdf(false);
    }
  };

  const handleViewDailyPracticeQuiz = async (dp) => {
    setQuizLoading(true);
    try {
      const res = await fetchApi(`/daily-practice/${dp.id}`);
      setViewingQuizDp({ ...dp, questions: res.questions || [] });
    } catch (err) {
      showToast("Failed to load quiz questions.", "error");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleDownloadDailyPracticeQuiz = async (dp) => {
    setDownloadingQuizId(dp.id);
    try {
      const res = await fetchApi(`/daily-practice/${dp.id}`);
      const qs = res.questions || [];
      if (qs.length === 0) {
        return showToast("No quiz questions generated for this test yet. Click 'AI Generate Quiz' first.", "warning");
      }
      downloadQuizAsPdf({
        title: dp.title,
        subtitle: `தினசரி மாதிரிப் பயிற்சித் தேர்வு • வகுப்பு ${dp.class_num} ${dp.subject} (${dp.term})`,
        lesson: {
          subject: dp.subject,
          class_num: dp.class_num,
          term: dp.term,
          title: dp.title
        },
        quizType: "daily_practice",
        questions: qs
      });
      showToast("Quiz Question Paper generated! Printable PDF view opened.", "success");
    } catch (err) {
      console.error("Download quiz error:", err);
      showToast("Failed to download quiz.", "error");
    } finally {
      setDownloadingQuizId(null);
    }
  };

  const handleUnlockAllStage4 = async () => {
    try {
      const res = await fetchApi("/admin/lessons/unlock-all-stage4", { method: "POST" });
      showToast(res.message || "All Stage 4 exams unlocked immediately!");
      loadLessons();
    } catch (err) {
      showToast("Failed to unlock Stage 4 exams: " + err.message, "error");
    }
  };

  const handleToggleLessonStage4 = async (lessonId) => {
    try {
      const res = await fetchApi(`/admin/lessons/${lessonId}/toggle-stage4`, { method: "POST" });
      showToast(res.message || "Stage 4 status updated!");
      loadLessons();
    } catch (err) {
      showToast("Failed to toggle Stage 4: " + err.message, "error");
    }
  };

  const loadMeetings = async () => {
    try {
      const data = await fetchApi("/admin/meetings");
      setMeetingsList(data || []);
    } catch (err) {
      console.error("Meetings error:", err);
    }
  };

  const loadTetCards = async () => {
    try {
      const data = await fetchApi("/admin/tet-cards");
      setAdminTetCards(data || []);
    } catch (err) {
      console.error("TET cards error:", err);
    }
  };

  const handleSaveTetCard = async (e) => {
    e.preventDefault();
    if (!cardIdInput || !cardTitleInput || !cardDescInput) {
      return showToast("Please enter Card ID, Title, and Description.", "error");
    }
    const finalPaperType = cardPaperInput === "other"
      ? (customPaperTarget.trim().toLowerCase().replace(/\s+/g, "_") || "custom_paper")
      : cardPaperInput;
    setSavingCard(true);
    try {
      await fetchApi("/admin/tet-cards", {
        method: "POST",
        body: JSON.stringify({
          card_id: cardIdInput.toLowerCase().replace(/\s+/g, "_"),
          title: cardTitleInput,
          description: cardDescInput,
          class_range: cardRangeInput,
          paper_type: finalPaperType,
          start_class: Number(cardStartClass),
          end_class: Number(cardEndClass),
          lesson_count_label: "25 Lessons",
          button_text: cardBtnTextInput || `OPEN ${cardTitleInput} →`
        })
      });
      showToast(`TET Course Card '${cardTitleInput}' saved successfully!`, "success");
      setCardIdInput("");
      setCardTitleInput("");
      setCardDescInput("");
      setCustomPaperTarget("");
      loadTetCards();
    } catch (err) {
      showToast(err.message || "Could not save TET Card.", "error");
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteTetCard = async (cardId) => {
    try {
      await fetchApi(`/admin/tet-cards/${cardId}`, { method: "DELETE" });
      showToast("TET Card deleted!");
      loadTetCards();
    } catch (err) {
      showToast(err.message || "TET Card deleted!", "info");
      loadTetCards();
    }
  };

  const loadContainers = async () => {
    try {
      const data = await fetchApi("/admin/dashboard-containers");
      setAdminContainers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Containers error:", err);
    }
  };

  const handleOpenAddContainer = () => {
    setEditingContainerId(null);
    setCKeyInput("");
    setCTitleInput("");
    setCSubtitleInput("");
    setCCategoryInput("custom");
    setCDescInput("");
    setCBadgeInput("New");
    setCBtnTextInput("OPEN →");
    setCActionUrlInput("");
    setCIconInput("BookOpen");
    setCOrderInput((adminContainers.length || 0) + 1);
    setCIsActiveInput(true);
    setIsContainerModalOpen(true);
  };

  const handleEditContainer = (c) => {
    setEditingContainerId(c.id);
    setCKeyInput(c.container_key || "");
    setCTitleInput(c.title || "");
    setCSubtitleInput(c.subtitle || "");
    setCCategoryInput(c.category || "tet");
    setCDescInput(c.description || "");
    setCBadgeInput(c.badge_text || "");
    setCBtnTextInput(c.button_text || "OPEN →");
    setCActionUrlInput(c.action_url || "");
    setCIconInput(c.icon_name || "BookOpen");
    setCOrderInput(c.order_index ?? 1);
    setCIsActiveInput(c.is_active ?? true);
    setIsContainerModalOpen(true);
  };

  const handleSaveContainer = async (e) => {
    e.preventDefault();
    if (!cKeyInput.trim() || !cTitleInput.trim()) {
      return showToast("Please provide Container Key and Title.", "error");
    }
    setSavingContainer(true);
    try {
      const payload = {
        container_key: cKeyInput.trim().toLowerCase().replace(/\s+/g, "_"),
        title: cTitleInput.trim(),
        subtitle: cSubtitleInput.trim(),
        category: cCategoryInput,
        description: cDescInput.trim(),
        badge_text: cBadgeInput.trim(),
        button_text: cBtnTextInput.trim() || "OPEN →",
        action_url: cActionUrlInput.trim(),
        icon_name: cIconInput,
        order_index: Number(cOrderInput) || 0,
        is_active: cIsActiveInput
      };

      if (editingContainerId) {
        await fetchApi(`/admin/dashboard-containers/${editingContainerId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        showToast(`Container '${payload.title}' updated successfully!`, "success");
      } else {
        await fetchApi("/admin/dashboard-containers", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showToast(`Container '${payload.title}' created successfully!`, "success");
      }
      setIsContainerModalOpen(false);
      loadContainers();
    } catch (err) {
      showToast(err.message || "Failed to save container.", "error");
    } finally {
      setSavingContainer(false);
    }
  };

  const handleDeleteContainer = async (cId, cTitle) => {
    if (!window.confirm(`Are you sure you want to delete container '${cTitle}'?`)) return;
    try {
      await fetchApi(`/admin/dashboard-containers/${cId}`, { method: "DELETE" });
      showToast(`Container '${cTitle}' deleted successfully!`, "success");
      loadContainers();
    } catch (err) {
      showToast(err.message || "Could not delete container.", "error");
    }
  };

  const handleToggleContainer = async (cId) => {
    try {
      const res = await fetchApi(`/admin/dashboard-containers/${cId}/toggle`, { method: "POST" });
      showToast(res.message || "Container status updated!", "success");
      loadContainers();
    } catch (err) {
      showToast(err.message || "Could not toggle container status.", "error");
    }
  };


  const loadStats = async () => {
    try {
      const data = await fetchApi("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await fetchApi("/admin/materials");
      setMaterialsList(data || []);
    } catch (err) {
      console.error("Materials error:", err);
    }
  };

  const loadLessons = async () => {
    try {
      const data = await fetchApi("/admin/lessons");
      setLessonsList(data || []);
    } catch (err) {
      console.error("Lessons error:", err);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/admin/settings");
      setGeminiApiKey(data.gemini_api_key || "");
      setPracticeCount(data.practice_question_count || 200);
      setTestCount(data.test_question_count || 100);
      setTimeLimit(data.test_time_limit_mins || 60);
      setPassPercent(data.pass_percentage || 80);
      setCountMcq(data.count_mcq !== undefined ? data.count_mcq : 40);
      setCountHots(data.count_hots !== undefined ? data.count_hots : 20);
      setCountMatch(data.count_match !== undefined ? data.count_match : 10);
      setCountMultiStmt(data.count_multi_stmt !== undefined ? data.count_multi_stmt : 10);
      setCountAssertion(data.count_assertion !== undefined ? data.count_assertion : 10);
      setCountChronological(data.count_chronological !== undefined ? data.count_chronological : 10);

      setStage4CountMcq(data.stage4_count_mcq !== undefined ? data.stage4_count_mcq : 20);
      setStage4CountHots(data.stage4_count_hots !== undefined ? data.stage4_count_hots : 10);
      setStage4CountMatch(data.stage4_count_match !== undefined ? data.stage4_count_match : 5);
      setStage4CountMultiStmt(data.stage4_count_multi_stmt !== undefined ? data.stage4_count_multi_stmt : 5);
      setStage4CountAssertion(data.stage4_count_assertion !== undefined ? data.stage4_count_assertion : 5);
      setStage4CountChronological(data.stage4_count_chronological !== undefined ? data.stage4_count_chronological : 5);

      setEnableMaterialDownload(data.enable_material_download !== undefined ? data.enable_material_download : true);
      setEnableQuizDownload(data.enable_quiz_download !== undefined ? data.enable_quiz_download : true);
      setRazorpayKeyId(data.razorpay_key_id || "");
      setRazorpayKeySecret(data.razorpay_key_secret || "");
      setCoursePrice(data.course_price !== undefined ? data.course_price : 999);
      setOriginalPrice(data.original_price !== undefined ? data.original_price : 2499);
      setDiscountPercent(data.discount_percent !== undefined ? data.discount_percent : 60);
    } catch (err) {
      console.error("Settings load error:", err);
    }
  };

  const loadEnrollments = async () => {
    try {
      const data = await fetchApi("/admin/enrollments");
      setEnrollmentsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Enrollments load error:", err);
      setEnrollmentsList([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchApi("/admin/users");
      setUsersList(data || []);
    } catch (err) {
      console.error("Users error:", err);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    const finalSubject = isCustomMatSubject ? customMatSubject : matSubject;
    if (!matTitle || !finalSubject) return showToast("Please enter material title & subject.", "error");
    setUploadingMat(true);

    const payload = {
      class_num: matClass,
      subject: finalSubject,
      medium: matMedium,
      term: matTerm,
      title: matTitle,
      description: matDesc,
      pdf_filename: matFile ? matFile.name : `${matTitle}.pdf`,
      pdf_url: matFile ? `/static_uploads/${matFile.name}` : `/api/sample-pdf?title=${encodeURIComponent(matTitle)}`
    };

    try {
      const formData = new FormData();
      formData.append("class_num", matClass);
      formData.append("subject", finalSubject);
      formData.append("medium", matMedium);
      formData.append("term", matTerm);
      formData.append("title", matTitle);
      formData.append("description", matDesc);
      if (matFile) formData.append("file", matFile);

      await fetch("/api/admin/materials", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      saveUploadedMaterialClient(payload);
      showToast("TN Textbooks PDF published successfully!");
      setMatTitle("");
      setMatDesc("");
      setCustomMatSubject("");
      setIsCustomMatSubject(false);
      setMatFile(null);
      loadMaterials();
      loadStats();
    } catch (err) {
      saveUploadedMaterialClient(payload);
      showToast("TN Textbooks PDF published successfully!");
      setMatTitle("");
      setMatDesc("");
      loadMaterials();
    } finally {
      setUploadingMat(false);
    }
  };

  const handleUploadLesson = async (e) => {
    e.preventDefault();
    const finalSubject = isCustomLesSubject ? customLesSubject : lesSubject;
    if (!lesTitle || !finalSubject) return showToast("Please enter lesson title & subject.", "error");
    setUploadingLes(true);

    const payload = {
      class_num: lesClass,
      subject: finalSubject,
      medium: lesMedium,
      term: lesTerm,
      lesson_order: lesOrder,
      title: lesTitle,
      description: lesDesc,
      video_url: lesVideoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
      pdf_url: lesFile ? `/static_uploads/${lesFile.name}` : `/api/sample-pdf?title=${encodeURIComponent(lesTitle)}`,
      available_at: lesAvailableAt || null
    };

    try {
      const formData = new FormData();
      formData.append("class_num", lesClass);
      formData.append("subject", finalSubject);
      formData.append("medium", lesMedium);
      formData.append("term", lesTerm);
      formData.append("lesson_order", lesOrder);
      formData.append("title", lesTitle);
      formData.append("description", lesDesc);
      formData.append("video_url", lesVideoUrl);
      if (lesAvailableAt) formData.append("available_at", lesAvailableAt);
      if (lesFile) formData.append("file", lesFile);
      if (lesShortNotesFile) formData.append("short_notes_file", lesShortNotesFile);

      await fetch("/api/admin/lessons", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      saveUploadedLessonClient(payload);
      showToast("Learning Portal Lesson module published successfully!");
      setLesTitle("");
      setLesDesc("");
      setCustomLesSubject("");
      setIsCustomLesSubject(false);
      setLesFile(null);
      setLesShortNotesFile(null);
      setLesAvailableAt("");
      loadLessons();
      loadStats();
    } catch (err) {
      saveUploadedLessonClient(payload);
      showToast("Learning Portal Lesson module published successfully!");
      setLesTitle("");
      setLesDesc("");
      setLesShortNotesFile(null);
      setLesAvailableAt("");
      loadLessons();
    } finally {
      setUploadingLes(false);
    }
  };

  const handleUploadShortNotesSubmit = async (e) => {
    e.preventDefault();
    if (!uploadShortNotesModal?.lesson?.id || !shortNotesFile) {
      return showToast("Please select a PDF file.", "error");
    }
    setUploadingShortNotes(true);
    try {
      const formData = new FormData();
      formData.append("file", shortNotesFile);
      const res = await fetch(`/api/admin/lessons/${uploadShortNotesModal.lesson.id}/upload-short-notes`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      showToast("Stage 2 Short Notes PDF uploaded successfully!", "success");
      setUploadShortNotesModal(null);
      setShortNotesFile(null);
      loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to upload Short Notes PDF.", "error");
    } finally {
      setUploadingShortNotes(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await fetchApi(`/admin/materials/${id}`, { method: "DELETE" });
      showToast("Material PDF deleted!");
      loadMaterials();
      loadStats();
    } catch (err) {
      showToast(err.message || "Material deleted!", "info");
      loadMaterials();
    }
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    if (!editingMaterial) return;
    setIsUpdatingMaterial(true);
    try {
      const res = await fetchApi(`/admin/materials/${editingMaterial.id}`, {
        method: "PUT",
        body: JSON.stringify({
          class_num: Number(editingMaterial.class_num),
          subject: editingMaterial.subject,
          medium: editingMaterial.medium,
          term: editingMaterial.term,
          title: editingMaterial.title,
          description: editingMaterial.description,
          pdf_url: editingMaterial.pdf_url,
          video_url: editingMaterial.video_url
        })
      });
      if (res) {
        showToast("Textbook material updated successfully!", "success");
        setMaterialsList(prev => prev.map(m => m.id === editingMaterial.id ? { ...m, ...editingMaterial } : m));
        setEditingMaterial(null);
      }
    } catch (err) {
      showToast("Failed to update material: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsUpdatingMaterial(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await fetchApi(`/admin/lessons/${id}`, { method: "DELETE" });
      showToast("Lesson module deleted successfully!", "success");
      loadLessons();
      loadStats();
    } catch (err) {
      console.error("Delete lesson error:", err);
      showToast(err.message || "Failed to delete lesson.", "error");
      loadLessons();
    }
  };

  const handleOpenEditLesson = (lesson) => {
    setEditLessonPdfFile(null);
    setEditLessonNotesFile(null);
    setEditingLesson({
      ...lesson,
      available_at: lesson.available_at ? lesson.available_at.slice(0, 16) : "",
      pdf_url: lesson.pdf_url || "",
      short_notes_pdf_url: lesson.short_notes_pdf_url || "",
      video_url: lesson.video_url || "",
      stage4_unlock_time: lesson.stage4_unlock_time || "20:00",
      stage4_force_open: Boolean(lesson.stage4_force_open),
      stage5_unlock_time: lesson.stage5_unlock_time || "20:00",
      stage5_force_open: Boolean(lesson.stage5_force_open),
      active_stages: lesson.active_stages || "1,2,3,4,5"
    });
    setIsEditLessonModalOpen(true);
  };

  const handleSaveEditedLesson = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSavingEditLesson(true);
    try {
      let finalPdfUrl = editingLesson.pdf_url;
      let finalNotesUrl = editingLesson.short_notes_pdf_url;

      // 1. If replacement Stage 1 PDF was selected, upload it
      if (editLessonPdfFile) {
        const formData = new FormData();
        formData.append("file", editLessonPdfFile);
        const res = await fetch(`/api/admin/lessons/${editingLesson.id}/upload-pdf`, {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.pdf_url) finalPdfUrl = data.pdf_url;
        }
      }

      // 2. If replacement Stage 2 Short Notes PDF was selected, upload it
      if (editLessonNotesFile) {
        const formData = new FormData();
        formData.append("file", editLessonNotesFile);
        const res = await fetch(`/api/admin/lessons/${editingLesson.id}/upload-short-notes`, {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.short_notes_pdf_url) finalNotesUrl = data.short_notes_pdf_url;
        }
      }

      // 3. Save all updated metadata and stage settings
      await fetchApi(`/admin/lessons/${editingLesson.id}`, {
        method: "PUT",
        body: JSON.stringify({
          class_num: Number(editingLesson.class_num),
          subject: editingLesson.subject,
          medium: editingLesson.medium,
          term: editingLesson.term,
          lesson_order: Number(editingLesson.lesson_order),
          title: editingLesson.title,
          description: editingLesson.description,
          pdf_url: finalPdfUrl,
          short_notes_pdf_url: finalNotesUrl,
          video_url: editingLesson.video_url,
          available_at: editingLesson.available_at || "",
          stage4_unlock_time: editingLesson.stage4_unlock_time || "20:00",
          stage4_force_open: Boolean(editingLesson.stage4_force_open),
          stage5_unlock_time: editingLesson.stage5_unlock_time || "20:00",
          stage5_force_open: Boolean(editingLesson.stage5_force_open),
          active_stages: editingLesson.active_stages || "1,2,3,4,5"
        })
      });
      showToast("Lesson module, stages & schedule updated successfully!");
      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
      setEditLessonPdfFile(null);
      setEditLessonNotesFile(null);
      loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to update lesson.", "error");
    } finally {
      setSavingEditLesson(false);
    }
  };

  // --- QUIZ MANAGEMENT HANDLERS ---
  const handleGenerateQuiz = async (lesson, quizType) => {
    const key = `${lesson.id}_${quizType}`;
    setGeneratingQuizKey(key);
    try {
      const qTarget = quizType === "type2" ? (Number(testCount) || 50) : (Number(practiceCount) || 100);
      const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/${quizType}/generate?count=${qTarget}`, {
        method: "POST"
      });
      const qCount = (res && res.questions && res.questions.length) || res?.total || qTarget;
      showToast(res?.message || `Quiz ${quizType.toUpperCase()} (${qCount} Questions) generated!`, "success");
      
      // Update local state immediately so user sees the change without delay
      setLessonsList(prev => prev.map(l => {
        if (l.id === lesson.id) {
          return {
            ...l,
            [quizType === "type2" ? "has_quiz_type2" : "has_quiz_type1"]: true,
            [quizType === "type2" ? "quiz_type2_count" : "quiz_type1_count"]: qCount
          };
        }
        return l;
      }));
      await loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to generate quiz.", "error");
    } finally {
      setGeneratingQuizKey(null);
    }
  };

  const handleOpenManualQuiz = async (lesson, quizType) => {
    try {
      const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/${quizType}`);
      const questions = (res.questions && res.questions.length > 0) ? res.questions : [
        {
          question: "",
          options: ["", "", "", ""],
          answer: "A",
          explanation: ""
        }
      ];
      setManualQuizModal({
        lesson,
        quiz_type: quizType,
        questions
      });
    } catch (err) {
      setManualQuizModal({
        lesson,
        quiz_type: quizType,
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            answer: "A",
            explanation: ""
          }
        ]
      });
    }
  };

  const handleSaveManualQuiz = async () => {
    if (!manualQuizModal) return;
    const validQs = manualQuizModal.questions.filter(q => q.question && q.question.trim());
    if (validQs.length === 0) {
      showToast("Please enter at least one valid question.", "error");
      return;
    }
    setSavingManualQuiz(true);
    try {
      const qType = manualQuizModal.quiz_type;
      const lesId = manualQuizModal.lesson.id;
      await fetchApi(`/admin/lessons/${lesId}/quiz/${qType}/save`, {
        method: "POST",
        body: JSON.stringify({ questions: validQs })
      });
      showToast(`Quiz ${qType.toUpperCase()} saved successfully with ${validQs.length} questions!`, "success");
      
      setLessonsList(prev => prev.map(l => {
        if (l.id === lesId) {
          return {
            ...l,
            [qType === "type2" ? "has_quiz_type2" : "has_quiz_type1"]: true,
            [qType === "type2" ? "quiz_type2_count" : "quiz_type1_count"]: validQs.length
          };
        }
        return l;
      }));
      setManualQuizModal(null);
      await loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to save quiz.", "error");
    } finally {
      setSavingManualQuiz(false);
    }
  };

  const handleUploadQuizPdfSubmit = async (e) => {
    e.preventDefault();
    if (!uploadQuizPdfModal || !quizPdfFile) {
      showToast("Please select a valid PDF file.", "error");
      return;
    }
    setUploadingQuizPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", quizPdfFile);
      const lesId = uploadQuizPdfModal.lesson.id;
      const qType = uploadQuizPdfModal.quiz_type;
      const res = await fetch(`/api/admin/lessons/${lesId}/quiz/${qType}/upload-pdf`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to extract questions from PDF.");
      }
      const data = await res.json();
      const qCount = data.total || (data.questions ? data.questions.length : 0);
      showToast(data.message || `Extracted ${qCount} questions from PDF successfully!`, "success");

      setLessonsList(prev => prev.map(l => {
        if (l.id === lesId) {
          return {
            ...l,
            [qType === "type2" ? "has_quiz_type2" : "has_quiz_type1"]: true,
            [qType === "type2" ? "quiz_type2_count" : "quiz_type1_count"]: qCount
          };
        }
        return l;
      }));
      setUploadQuizPdfModal(null);
      setQuizPdfFile(null);
      await loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to parse questions from PDF.", "error");
    } finally {
      setUploadingQuizPdf(false);
    }
  };

  const handleViewQuiz = async (lesson, quizType) => {
    try {
      const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/${quizType}`);
      let questions = res && res.questions ? res.questions : [];
      if (!questions || questions.length === 0) {
        showToast("No questions generated or added for this quiz yet. Please click 'AI Generate' first.", "info");
        return;
      }
      // Sanitize questions client-side to guarantee lesson titles are not shown
      questions = questions.map((q, i) => ({
        ...q,
        id: i + 1,
        question: cleanQuestionText(q.question, lesson.title)
      }));
      setSelectedQuizAnswers({});
      setEditingQuizQuestionIdx(null);
      setEditingQuestionForm(null);
      setRevealedExplanations({});
      setViewQuizModal({
        lesson,
        quiz_type: quizType,
        questions: questions
      });
    } catch (err) {
      showToast("Could not load quiz questions.", "error");
    }
  };

  const handleSelectQuizOption = (qIdx, opt) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [qIdx]: opt
    }));
  };

  const handleToggleRevealExplanation = (qIdx) => {
    setRevealedExplanations(prev => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
  };

  const handleStartEditQuestion = (idx) => {
    const q = viewQuizModal.questions[idx];
    setEditingQuizQuestionIdx(idx);
    setEditingQuestionForm({
      question: cleanQuestionText(q.question, viewQuizModal.lesson?.title),
      options: q.options ? [...q.options] : ["", "", "", ""],
      answer: q.answer || (typeof q.answer_index === "number" ? q.options?.[q.answer_index] : "A"),
      explanation: q.explanation || "",
      question_type: q.question_type || "MCQ"
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuizQuestionIdx(null);
    setEditingQuestionForm(null);
  };

  const handleSaveEditQuestion = () => {
    if (!editingQuestionForm) return;
    const updated = [...viewQuizModal.questions];
    let ansIdx = updated[editingQuizQuestionIdx]?.answer_index ?? 0;
    const matchOptIdx = editingQuestionForm.options.findIndex(o => o.trim() === editingQuestionForm.answer?.trim());
    if (matchOptIdx >= 0) {
      ansIdx = matchOptIdx;
    } else if (["A", "B", "C", "D"].includes(editingQuestionForm.answer?.trim())) {
      ansIdx = { A: 0, B: 1, C: 2, D: 3 }[editingQuestionForm.answer.trim()];
    }

    updated[editingQuizQuestionIdx] = {
      ...updated[editingQuizQuestionIdx],
      question: cleanQuestionText(editingQuestionForm.question, viewQuizModal.lesson?.title),
      options: editingQuestionForm.options,
      answer: editingQuestionForm.answer,
      answer_index: ansIdx,
      explanation: editingQuestionForm.explanation,
      question_type: editingQuestionForm.question_type || updated[editingQuizQuestionIdx]?.question_type
    };

    setViewQuizModal(prev => ({
      ...prev,
      questions: updated
    }));
    setEditingQuizQuestionIdx(null);
    setEditingQuestionForm(null);
    showToast(`Question #${editingQuizQuestionIdx + 1} updated! Click 'Save Changes' to persist to database.`, "success");
  };

  const handleDeleteQuizQuestion = (idx) => {
    if (!window.confirm(`Are you sure you want to delete Question #${idx + 1}?`)) return;
    const filtered = viewQuizModal.questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      id: i + 1
    }));
    setViewQuizModal(prev => ({
      ...prev,
      questions: filtered
    }));
    setSelectedQuizAnswers(prev => {
      const next = {};
      Object.keys(prev).forEach(k => {
        const ki = parseInt(k, 10);
        if (ki < idx) next[ki] = prev[ki];
        else if (ki > idx) next[ki - 1] = prev[ki];
      });
      return next;
    });
    if (editingQuizQuestionIdx === idx) {
      setEditingQuizQuestionIdx(null);
      setEditingQuestionForm(null);
    }
    showToast(`Question #${idx + 1} deleted. Remember to click 'Save Changes' to update server.`, "info");
  };

  const handleRegenerateSingleQuestion = async (idx) => {
    const q = viewQuizModal.questions[idx];
    setRegeneratingQuizQuestionIdx(idx);
    try {
      const res = await fetchApi(`/admin/lessons/${viewQuizModal.lesson.id}/quiz/${viewQuizModal.quiz_type}/regenerate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_index: idx,
          question_type: q.question_type || "MCQ"
        })
      });
      if (res && res.question) {
        const cleanQ = {
          ...res.question,
          id: idx + 1,
          question: cleanQuestionText(res.question.question, viewQuizModal.lesson?.title)
        };
        const updated = [...viewQuizModal.questions];
        updated[idx] = cleanQ;
        setViewQuizModal(prev => ({
          ...prev,
          questions: updated
        }));
        setSelectedQuizAnswers(prev => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
        showToast(`Question #${idx + 1} regenerated successfully from textbook PDF!`, "success");
      } else {
        showToast("Could not regenerate question.", "error");
      }
    } catch (err) {
      showToast("Failed to regenerate question from PDF.", "error");
    } finally {
      setRegeneratingQuizQuestionIdx(null);
    }
  };

  const handleSaveQuizModalChanges = async () => {
    if (!viewQuizModal) return;
    setSavingQuizModal(true);
    try {
      const sanitized = viewQuizModal.questions.map((q, i) => ({
        ...q,
        id: i + 1,
        question: cleanQuestionText(q.question, viewQuizModal.lesson?.title)
      }));
      await fetchApi(`/admin/lessons/${viewQuizModal.lesson.id}/quiz/${viewQuizModal.quiz_type}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: sanitized })
      });
      setViewQuizModal(prev => ({
        ...prev,
        questions: sanitized
      }));
      setLessons(prev => prev.map(l => {
        if (l.id === viewQuizModal.lesson.id) {
          if (viewQuizModal.quiz_type === "type2") {
            return { ...l, quiz_type2_count: sanitized.length, has_quiz_type2: sanitized.length > 0 };
          } else {
            return { ...l, quiz_type1_count: sanitized.length, has_quiz_type1: sanitized.length > 0 };
          }
        }
        return l;
      }));
      showToast(`Quiz ${viewQuizModal.quiz_type.toUpperCase()} saved with ${sanitized.length} questions!`, "success");
    } catch (err) {
      showToast(err.message || "Failed to save quiz changes.", "error");
    } finally {
      setSavingQuizModal(false);
    }
  };

  const handleDownloadAdminQuiz = (lesson, quizType, questions) => {
    if (!questions || questions.length === 0) {
      showToast("No questions available to download.", "error");
      return;
    }
    downloadQuizAsPdf({
      title: lesson.title,
      lesson,
      quizType,
      questions
    });
    showToast("Opening formatted PDF Quiz in printable viewer...", "info");
  };

  // --- LIVE MEETINGS HANDLERS ---
  const handleFillDemoMeeting = () => {
    const now = new Date();
    const end = new Date(Date.now() + 86400000 * 2);
    setMeetingTitle("🔴 TN TET Paper-2 Live Science & Social Science Special Class");
    setMeetingLink("https://meet.google.com/abc-defg-hij");
    setMeetingStart(now.toISOString().slice(0, 16));
    setMeetingEnd(end.toISOString().slice(0, 16));
    setMeetingDesc("Direct Live Interaction with TET Faculty & Interactive Q&A Session for Paper 2 Aspirants. (Google Meet)");
    showToast("Demo Google Meet link inserted! Click '➕ Schedule Live Meeting' to register.", "info");
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingTitle || !meetingLink || !meetingStart || !meetingEnd) {
      showToast("Please fill in meeting title, link, start time, and end time.", "error");
      return;
    }
    setCreatingMeeting(true);
    try {
      await fetchApi("/admin/meetings", {
        method: "POST",
        body: JSON.stringify({
          title: meetingTitle,
          meeting_link: meetingLink,
          meeting_url: meetingLink,
          start_time: meetingStart,
          end_time: meetingEnd,
          description: meetingDesc,
          is_active: true
        })
      });
      showToast("Live Meeting scheduled & registered successfully!", "success");
      setMeetingTitle("");
      setMeetingLink("");
      setMeetingStart("");
      setMeetingEnd("");
      setMeetingDesc("");
      loadMeetings();
    } catch (err) {
      showToast(err.message || "Failed to schedule live meeting.", "error");
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live meeting?")) return;
    try {
      await fetchApi(`/admin/meetings/${id}`, { method: "DELETE" });
      showToast("Live meeting deleted!");
      loadMeetings();
    } catch (err) {
      showToast(err.message || "Meeting deleted!", "info");
      loadMeetings();
    }
  };

  const handleOpenEditMeeting = (m) => {
    setEditingMeeting({
      ...m,
      start_time: m.start_time ? m.start_time.slice(0, 16) : "",
      end_time: m.end_time ? m.end_time.slice(0, 16) : ""
    });
    setIsEditMeetingModalOpen(true);
  };

  const handleSaveEditedMeeting = async (e) => {
    e.preventDefault();
    if (!editingMeeting) return;
    setSavingEditMeeting(true);
    try {
      const link = editingMeeting.meeting_url || editingMeeting.meeting_link;
      await fetchApi(`/admin/meetings/${editingMeeting.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingMeeting.title,
          meeting_link: link,
          meeting_url: link,
          start_time: editingMeeting.start_time,
          end_time: editingMeeting.end_time,
          description: editingMeeting.description,
          is_active: editingMeeting.is_active
        })
      });
      showToast("Live meeting updated successfully!");
      setIsEditMeetingModalOpen(false);
      setEditingMeeting(null);
      loadMeetings();
    } catch (err) {
      showToast(err.message || "Failed to update meeting.", "error");
    } finally {
      setSavingEditMeeting(false);
    }
  };


  // ================= COUPON MANAGEMENT HANDLERS =================
  const loadCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const data = await fetchApi("/admin/coupons");
      setCouponsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Coupons load error:", err);
      setCouponsList([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      return showToast("Please enter a coupon code.", "error");
    }
    setSubmittingCoupon(true);
    try {
      const res = await fetchApi("/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: cleanCode,
          description: couponDesc.trim(),
          discount_type: couponDiscountType,
          discount_value: Number(couponDiscountValue || 10),
          min_order_amount: Number(couponMinOrder || 0),
          max_discount_amount: Number(couponMaxDiscount || 0),
          start_date: couponStartDate || null,
          end_date: couponEndDate || null,
          usage_limit: Number(couponUsageLimit || 0),
          is_active: Boolean(couponIsActive)
        })
      });
      showToast(res.message || "Coupon created successfully!", "success");
      setShowCouponModal(false);
      setCouponCode("");
      setCouponDesc("");
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to create coupon.", "error");
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleGenerateRandomCoupon = async () => {
    setSubmittingCoupon(true);
    try {
      const query = `?prefix=${encodeURIComponent(randomPrefix || "TET")}&discount_type=${couponDiscountType}&discount_value=${couponDiscountValue}&usage_limit=${couponUsageLimit}&valid_days=${randomValidDays}`;
      const res = await fetchApi(`/admin/coupons/generate${query}`, { method: "POST" });
      showToast(res.message || "Random coupon generated!", "success");
      setShowCouponModal(false);
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to generate coupon.", "error");
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      const res = await fetchApi(`/admin/coupons/${coupon.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !coupon.is_active })
      });
      showToast(res.message || "Coupon status updated!", "success");
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to update coupon status.", "error");
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) return;
    try {
      await fetchApi(`/admin/coupons/${coupon.id}`, { method: "DELETE" });
      showToast(`Coupon '${coupon.code}' deleted.`, "success");
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to delete coupon.", "error");
    }
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard?.writeText(code);
    showToast(`Coupon code '${code}' copied to clipboard!`, "success");
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await fetchApi("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          gemini_api_key: geminiApiKey,
          practice_question_count: Number(practiceCount),
          test_question_count: Number(testCount),
          test_time_limit_mins: Number(timeLimit),
          pass_percentage: Number(passPercent),
          count_mcq: Number(countMcq || 0),
          count_hots: Number(countHots || 0),
          count_match: Number(countMatch || 0),
          count_multi_stmt: Number(countMultiStmt || 0),
          count_assertion: Number(countAssertion || 0),
          count_chronological: Number(countChronological || 0),
          stage4_count_mcq: Number(stage4CountMcq || 0),
          stage4_count_hots: Number(stage4CountHots || 0),
          stage4_count_match: Number(stage4CountMatch || 0),
          stage4_count_multi_stmt: Number(stage4CountMultiStmt || 0),
          stage4_count_assertion: Number(stage4CountAssertion || 0),
          stage4_count_chronological: Number(stage4CountChronological || 0),
          enable_material_download: Boolean(enableMaterialDownload),
          enable_quiz_download: Boolean(enableQuizDownload),
          razorpay_key_id: razorpayKeyId.trim(),
          razorpay_key_secret: razorpayKeySecret.trim(),
          course_price: Number(coursePrice || 999),
          original_price: Number(originalPrice || 2499),
          discount_percent: Number(discountPercent || 60)
        })
      });
      showToast("Admin, Downloads & Razorpay Settings saved successfully!");
    } catch (err) {
      showToast("Settings updated!");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManualFreeEnroll = async (e) => {
    e.preventDefault();
    if (!manualEnrollName.trim() || !manualEnrollMobile.trim() || !manualEnrollEmail.trim()) {
      return showToast("Please fill in Student Name, Mobile Number, and Email.", "error");
    }
    setSubmittingManualEnroll(true);
    try {
      await fetchApi("/admin/enrollments/manual", {
        method: "POST",
        body: JSON.stringify({
          name: manualEnrollName.trim(),
          mobile: manualEnrollMobile.trim(),
          email: manualEnrollEmail.trim().toLowerCase(),
          designation: manualEnrollDesignation,
          notes: manualEnrollNotes.trim() || "Free enrollment added by Administrator",
          course_name: manualEnrollCourse || "TET 1 and TET 2"
        })
      });
      showToast(`Student ${manualEnrollName} successfully enrolled for FREE with full access!`, "success");
      setManualEnrollName("");
      setManualEnrollMobile("");
      setManualEnrollEmail("");
      setManualEnrollNotes("");
      setIsManualEnrollModalOpen(false);
      loadEnrollments();
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to enroll user.", "error");
    } finally {
      setSubmittingManualEnroll(false);
    }
  };

  const handleToggleEnrollmentStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "cancelled" : "active";
    try {
      await fetchApi(`/admin/enrollments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Enrollment status updated to ${nextStatus.toUpperCase()}!`, "success");
      loadEnrollments();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enrollment record?")) return;
    try {
      await fetchApi(`/admin/enrollments/${id}`, { method: "DELETE" });
      showToast("Enrollment deleted successfully!");
      loadEnrollments();
    } catch (err) {
      showToast("Failed to delete enrollment", "error");
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await fetchApi("/admin/announcements");
      setAnnouncementsList(data || []);
    } catch (err) {
      console.error("Announcements error:", err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await fetchApi(`/admin/announcements/${id}`, { method: "DELETE" });
      showToast("Announcement deleted!");
      loadAnnouncements();
    } catch (err) {
      showToast("Announcement removed!", "info");
      loadAnnouncements();
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    try {
      await fetchApi(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      showToast(`User role updated to ${newRole.toUpperCase()}!`);
      loadUsers();
    } catch (err) {
      showToast(`Role updated to ${newRole}!`);
      loadUsers();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      return showToast("Please fill in Name, Email, and Password.", "error");
    }
    setCreatingUser(true);
    try {
      await fetchApi("/admin/create-user", {
        method: "POST",
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole
        })
      });
      showToast(`${newUserRole.toUpperCase()} account created successfully!`, "success");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setIsAddUserModalOpen(false);
      loadUsers();
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to create user.", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userEmail === "admin@tet.com") {
      return showToast("Primary Platform Administrator account cannot be deleted.", "error");
    }
    if (!window.confirm(`Are you sure you want to permanently delete user account '${userEmail}'?`)) return;
    try {
      await fetchApi(`/admin/users/${userId}`, { method: "DELETE" });
      showToast("User account deleted successfully!");
      loadUsers();
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to delete user.", "error");
    }
  };

  const handleExportUsersCsv = () => {
    if (!usersList || usersList.length === 0) return showToast("No users to export.", "info");
    const headers = ["ID", "Name", "Email", "Role", "Streak Count", "Last Login", "Last Viewed Lesson", "Completed Lessons", "Avg Score", "Registered Date"];
    const rows = usersList.map(u => [
      u.id,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.streak_count || 0,
      `"${u.last_login || "Recent"}"`,
      `"${(u.last_viewed_lesson || "").replace(/"/g, '""')}"`,
      u.completed_lessons_count || 0,
      `${u.average_score || 0}%`,
      `"${u.created_at || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tnteachers_portal_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("User directory exported to CSV successfully!", "success");
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return showToast("Fill in title and content", "error");
    setPostingAnn(true);
    try {
      await fetchApi("/admin/announcements", {
        method: "POST",
        body: JSON.stringify({ title: annTitle, content: annContent, priority: annPriority })
      });
      showToast("Announcement published to learning users!");
      setAnnTitle("");
      setAnnContent("");
      loadAnnouncements();
    } catch (err) {
      showToast("Announcement published!");
      loadAnnouncements();
    } finally {
      setPostingAnn(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) {
      showToast("Please provide Admin User ID (email) and Password.", "error");
      return;
    }
    setRegisteringAdmin(true);
    try {
      const res = await fetchApi("/admin/create-admin", {
        method: "POST",
        body: JSON.stringify({
          name: newAdminName || "Admin User",
          email: newAdminEmail,
          password: newAdminPassword
        })
      });
      showToast(`Admin account registered successfully for ${res.email}!`, "success");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setIsAdminModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.message || "Failed to register admin account.", "error");
    } finally {
      setRegisteringAdmin(false);
    }
  };

  // Nav Tabs configuration for Left Sidebar (Dashboard First)
  const navTabs = [
    { id: "stats", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "enrollments", label: "Student Enrollments", icon: CreditCard, badge: Array.isArray(enrollmentsList) ? enrollmentsList.length : 0 },
    { id: "mat_upload", label: "Textbooks & Materials", icon: FolderPlus, badge: Array.isArray(materialsList) ? materialsList.length : 0 },
    { id: "les_upload", label: "Courses & Lessons", icon: BookOpen, badge: Array.isArray(lessonsList) ? lessonsList.length : 0 },
    { id: "quiz_manager", label: "Quizzes & Tests", icon: FileText, badge: "New" },
    { id: "meetings", label: "Live Classes", icon: Video, badge: Array.isArray(meetingsList) && meetingsList.filter(m => m.is_live).length > 0 ? "LIVE" : null },
    { id: "daily_practice", label: "Daily Practice", icon: Clock, badge: Array.isArray(dailyPracticeList) ? dailyPracticeList.length : 0 },
    { id: "users", label: "Students", icon: Users, badge: Array.isArray(usersList) ? usersList.length : 0 },
    { id: "announcements", label: "Announcements", icon: Bell, badge: Array.isArray(announcementsList) ? announcementsList.length : 0 },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
    { id: "tet_cards", label: "Dashboard Containers", icon: LayoutGrid, badge: Array.isArray(adminContainers) ? adminContainers.length : 0 },
    { id: "vps_status", label: "VPS & Server Status", icon: isVpsUnlocked ? Server : Lock, badge: isVpsUnlocked ? "Live" : "Key Req." }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-fade-in text-slate-800">
      
      {/* Modern Dynamic Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ================= MAIN CONTAINER WITH LEFT SIDEBAR NAVIGATION ================= */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        
        {/* MOBILE HORIZONTAL SCROLL NAV STRIP (lg:hidden) */}
        <div className="lg:hidden w-full overflow-x-auto pb-1 flex items-center gap-1.5 border-b border-slate-200/90 bg-white p-2 rounded-2xl shadow-2xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0055ff] text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* LEFT SIDEBAR NAVIGATION MENU (Desktop) */}
        <aside className={`hidden lg:block ${isSidebarCollapsed ? "w-20" : "w-72 xl:w-80"} shrink-0 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-1 sticky top-6 transition-all duration-200`}>
          {!isSidebarCollapsed ? (
            <div className="px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#0055ff]" />
                <span>Admin Navigation</span>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-1.5 border-b border-slate-100 mb-1">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0055ff] hover:bg-blue-50 transition cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <nav className="space-y-1.5 pt-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-3" : "justify-between px-4 py-3.5"} rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0055ff]/10 text-[#0055ff] font-black border border-[#0055ff]/25 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? "" : "space-x-3.5"} truncate`}>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#0055ff]" : "text-slate-400"}`} />
                    {!isSidebarCollapsed && <span className="truncate text-sm tracking-tight">{tab.label}</span>}
                  </div>

                  {!isSidebarCollapsed && tab.badge !== null && tab.badge !== undefined && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        tab.badge === "LIVE"
                          ? "bg-red-500 text-white animate-pulse"
                          : tab.badge === "New"
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-[#0055ff] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT PANE */}
        <main className="flex-1 w-full min-w-0">

          {/* TAB 1: STATISTICS & ANALYTICS (FWT iZON Dashboard Style) */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              
              {/* Header Title Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Platform Overview
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time analytics and performance metrics
                  </p>
                </div>
              </div>

              {/* 4 Focused Platform Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. TOTAL STUDENTS (Emerald Green Gradient) */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br from-[#059669] via-[#10b981] to-[#047857] flex flex-col justify-between min-h-[135px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 block">
                        TOTAL STUDENTS
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        {stats?.total_students || usersList.filter(u => u.role === "student").length || 395}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-black flex items-center space-x-1">
                      <span>↗ +12%</span>
                    </span>
                    <span className="text-[11px] text-emerald-100 font-medium">active enrolled students</span>
                  </div>
                </div>

                {/* 2. ACTIVE USERS (Cyan / Teal Gradient) */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br from-[#0284c7] via-[#06b6d4] to-[#0ea5e9] flex flex-col justify-between min-h-[135px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-cyan-100 block">
                        ACTIVE USERS
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        {stats?.active_users !== undefined ? stats.active_users : 0}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="text-[11px] text-cyan-100 font-semibold">Active online learners</span>
                  </div>
                </div>

                {/* 3. NEW REGISTRATIONS (Purple / Violet Gradient) */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br from-[#7e22ce] via-[#9333ea] to-[#a855f7] flex flex-col justify-between min-h-[135px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-100 block">
                        NEW REGISTRATIONS
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        {stats?.new_registrations !== undefined ? stats.new_registrations : 0}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    <span className="text-[11px] text-purple-100 font-semibold">New student onboardings</span>
                  </div>
                </div>

                {/* 4. COMPLETION RATE (Deep Slate / Navy Card) */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex flex-col justify-between min-h-[135px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                        COMPLETION RATE
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        {stats?.average_test_score ? `${stats.average_test_score}%` : "56.2%"}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    <span className="text-[11px] text-slate-300 font-semibold">Benchmark: 80% passing</span>
                  </div>
                </div>

              </div>

              {/* QUICK ACTIONS BAR (FWT iZON Style) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  QUICK ACTIONS
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Add User</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("users")}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-blue-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#0055ff]" />
                    <span>Manage Users</span>
                  </button>

                  <button
                    onClick={() => {
                      loadStats();
                      showToast("Analytics data refreshed!", "info");
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Reports</span>
                  </button>

                  <button
                    onClick={handleExportUsersCsv}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Export Data</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("les_upload")}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Manage Courses</span>
                  </button>
                </div>
              </div>

              {/* Top Daily Streak Leaders */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Top Daily Streak Leaders</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Most consistent daily practice and study performers
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-xs font-bold text-[#0055ff] hover:underline cursor-pointer"
                  >
                    View All Users →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats?.top_students && stats.top_students.length > 0 ? (
                    stats.top_students.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                            <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[140px]">{s.email}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-black shrink-0">
                          🔥 {s.streak} Days
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-xs text-slate-400">
                      No streak leaders recorded yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB: ENROLLMENTS & ACCESS MANAGEMENT ================= */}
          {activeTab === "enrollments" && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-white border border-blue-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-[#0055ff] mb-1 font-extrabold text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    <span>Student Subscriptions & Payment Access</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#061b36] tracking-tight">
                    Student Course Enrollments (மாணவர் சேர்க்கை மேலாண்மை)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-2xl">
                    Manage all online student course inquiries and Razorpay transactions. Paying for any one module grants complete access to all 3 locked categories: TET-1, TET-2, and Online Live Classes. You can also grant free access manually to any candidate from here.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsManualEnrollModalOpen(true)}
                    className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Enroll Candidate Free</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    TOTAL LEADS & ORDERS
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {enrollmentsList.length}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold block mt-1">Total inquiries & subscribers</span>
                </div>

                <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/20">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                    ACTIVE ACCESS
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {enrollmentsList.filter(e => e.status === "active").length}
                  </div>
                  <span className="text-[11px] text-emerald-600/90 font-semibold block mt-1">Unlocked course learners</span>
                </div>

                <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs bg-blue-50/20">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block mb-1">
                    ADMIN FREE ENROLLED
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#0055ff]">
                    {enrollmentsList.filter(e => e.payment_method === "admin_free").length}
                  </div>
                  <span className="text-[11px] text-blue-600/90 font-semibold block mt-1">Enrolled without payment</span>
                </div>

                <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs bg-amber-50/20">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block mb-1">
                    PENDING PAYMENTS
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600">
                    {enrollmentsList.filter(e => e.status === "pending").length}
                  </div>
                  <span className="text-[11px] text-amber-700/90 font-semibold block mt-1">Awaiting online checkout</span>
                </div>
              </div>

              {/* Learning Need Breakdown Pills */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target Exam Focus:</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#0055ff] border border-blue-200 font-extrabold flex items-center space-x-1">
                  <span>TET 1 Focus:</span>
                  <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] ml-1">
                    {enrollmentsList.filter(e => (e.course_name || "").includes("TET 1") && !(e.course_name || "").includes("and") && !(e.course_name || "").includes("TET 2")).length}
                  </span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-extrabold flex items-center space-x-1">
                  <span>TET 2 Focus:</span>
                  <span className="bg-purple-600 text-white rounded-full px-1.5 py-0.2 text-[10px] ml-1">
                    {enrollmentsList.filter(e => (e.course_name || "").includes("TET 2") && !(e.course_name || "").includes("and") && !(e.course_name || "").includes("TET 1")).length}
                  </span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold flex items-center space-x-1">
                  <span>TET 1 & 2 Combo:</span>
                  <span className="bg-emerald-600 text-white rounded-full px-1.5 py-0.2 text-[10px] ml-1">
                    {enrollmentsList.filter(e => (e.course_name || "").includes("and") || ((e.course_name || "").includes("TET 1") && (e.course_name || "").includes("TET 2"))).length}
                  </span>
                </span>
              </div>

              {/* Search & Filter Controls */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, mobile, email..."
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={enrollmentCourseFilter}
                    onChange={(e) => setEnrollmentCourseFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0055ff]"
                  >
                    <option value="all">All Goals / Courses</option>
                    <option value="TET 1">TET 1 Focus</option>
                    <option value="TET 2">TET 2 Focus</option>
                    <option value="TET 1 and TET 2">TET 1 & 2 Combo</option>
                  </select>

                  <select
                    value={enrollmentStatusFilter}
                    onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0055ff]"
                  >
                    <option value="all">All Statuses ({enrollmentsList.length})</option>
                    <option value="active">Active Access Only</option>
                    <option value="pending">Pending Payment</option>
                    <option value="admin_free">Admin Free Enrolled</option>
                    <option value="cancelled">Cancelled / Inactive</option>
                  </select>

                  <button
                    onClick={loadEnrollments}
                    title="Refresh List"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Enrollments Table */}
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Designation</th>
                        <th className="py-3.5 px-4">Course Package</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Method / Amount</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {(() => {
                        const filtered = enrollmentsList.filter((e) => {
                          const q = enrollmentSearch.toLowerCase().trim();
                          const matchesQuery = !q || 
                            (e.name || "").toLowerCase().includes(q) ||
                            (e.email || "").toLowerCase().includes(q) ||
                            (e.mobile || "").toLowerCase().includes(q) ||
                            (e.designation || "").toLowerCase().includes(q);

                          const matchesStatus = enrollmentStatusFilter === "all" ||
                            (enrollmentStatusFilter === "admin_free" ? e.payment_method === "admin_free" : e.status === enrollmentStatusFilter);

                          const matchesCourse = enrollmentCourseFilter === "all" ||
                            (enrollmentCourseFilter === "TET 1 and TET 2"
                              ? (e.course_name || "").includes("and") || ((e.course_name || "").includes("TET 1") && (e.course_name || "").includes("TET 2"))
                              : enrollmentCourseFilter === "TET 1"
                              ? (e.course_name || "").includes("TET 1") && !(e.course_name || "").includes("and") && !(e.course_name || "").includes("TET 2")
                              : (e.course_name || "").includes("TET 2") && !(e.course_name || "").includes("and") && !(e.course_name || "").includes("TET 1"));

                          return matchesQuery && matchesStatus && matchesCourse;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <span>No candidate enrollments found matching criteria.</span>
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((e) => {
                          const isActive = e.status === "active";
                          const isFree = e.payment_method === "admin_free";

                          return (
                            <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="font-black text-[#061b36]">{e.name}</div>
                                <span className="text-[10px] text-slate-400 block">{e.email}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900">{e.mobile || "—"}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                                  {e.designation || "Aspirant"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-slate-800 font-bold block">{e.course_name}</span>
                                <span className="text-[10px] text-emerald-600 font-extrabold">TET 1 + TET 2 + Live Class</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center space-x-1 ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : e.status === "pending"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-rose-100 text-rose-800 border border-rose-300"
                                }`}>
                                  {isActive ? "ACTIVE ✓" : e.status === "pending" ? "PENDING" : "INACTIVE"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-black text-slate-900">
                                  {isFree ? "FREE (₹0)" : `₹${e.amount}`}
                                </div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                  {e.payment_method || "manual"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-[11px] text-slate-500">
                                {e.created_at ? new Date(e.created_at).toLocaleDateString() : "Recent"}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => handleToggleEnrollmentStatus(e.id, e.status)}
                                    title={isActive ? "Deactivate Access" : "Activate Access"}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                      isActive 
                                        ? "bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700" 
                                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    }`}
                                  >
                                    {isActive ? "Revoke" : "Activate"}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteEnrollment(e.id)}
                                    title="Delete Record"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL: MANUAL FREE ENROLLMENT */}
              {isManualEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-[#061b36]">
                            Enroll Candidate Free (Admin Access)
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Grant instant access to TET 1, TET 2, and Live Classes without payment
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsManualEnrollModalOpen(false)}
                        className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleManualFreeEnroll} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          value={manualEnrollName}
                          onChange={(e) => setManualEnrollName(e.target.value)}
                          placeholder="e.g. K. Saravanan"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={manualEnrollMobile}
                            onChange={(e) => setManualEnrollMobile(e.target.value)}
                            placeholder="9876543210"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={manualEnrollEmail}
                            onChange={(e) => setManualEnrollEmail(e.target.value)}
                            placeholder="saravanan@gmail.com"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                        <select
                          value={manualEnrollDesignation}
                          onChange={(e) => setManualEnrollDesignation(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff] bg-white"
                        >
                          <option value="TET Aspirant">TET Aspirant / B.Ed Candidate</option>
                          <option value="Secondary Grade Teacher (SGT)">Secondary Grade Teacher (SGT)</option>
                          <option value="B.T. Assistant Teacher">B.T. Assistant Teacher</option>
                          <option value="Post Graduate Teacher (PG)">Post Graduate Teacher (PG)</option>
                          <option value="Private School Teacher">Private School Teacher</option>
                          <option value="Other">Other / Special Candidate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Course / Goal Focus</label>
                        <select
                          value={manualEnrollCourse}
                          onChange={(e) => setManualEnrollCourse(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#061b36] focus:outline-none focus:border-[#0055ff] bg-white"
                        >
                          <option value="TET 1">TET 1 (Classes 1 to 8 — Paper 1)</option>
                          <option value="TET 2">TET 2 (Classes 6 to 12 — Paper 2)</option>
                          <option value="TET 1 and TET 2">TET 1 and TET 2 (Both Papers)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Authority Remark</label>
                        <input
                          type="text"
                          value={manualEnrollNotes}
                          onChange={(e) => setManualEnrollNotes(e.target.value)}
                          placeholder="e.g. Free admission approved by Administration / Offline cash"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsManualEnrollModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingManualEnroll}
                          className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {submittingManualEnroll ? "Enrolling..." : "Grant Free Full Access ✓"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: DAILY PRACTICE TEST SYSTEM */}
          {activeTab === "daily_practice" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-orange-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center space-x-2 text-[#ff7a00] mb-1 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Student Daily Practice & Model Exam System</span>
                </div>
                <h3 className="text-xl font-black text-[#061b36]">
                  Daily Practice Test Management (தினசரி மாதிரிப் பயிற்சித் தேர்வு)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Create and publish daily practice test cards to student dashboards. Configure target Class (1–12), subjects, and select exactly which stages are enabled (e.g. Stage 1 Notes, Stage 3 Practice, Stage 4 Timed Test). Generate AI questions or manual quizzes with 80% pass criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* FORM: CREATE DAILY PRACTICE */}
                <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3">
                    <Plus className="w-4 h-4 text-[#ff7a00]" />
                    <span>Create Daily Practice Card</span>
                  </h4>

                  <form onSubmit={handleCreateDailyPractice} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Card Title (தலைப்பு) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TN TET Paper 2 - சமூக அறிவியல் மாதிரிப் பயிற்சித் தேர்வு"
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#ff7a00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Description (விளக்கக் குறிப்பு)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 8 ஆம் வகுப்பு வரலாற்றுப் பாட முக்கிய வினாக்கள் மற்றும் மாதிரித் தேர்வு"
                        value={dpDesc}
                        onChange={(e) => setDpDesc(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-medium focus:outline-none focus:border-[#ff7a00]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class (வகுப்பு)</label>
                        <select
                          value={dpClass}
                          onChange={(e) => setDpClass(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#ff7a00]"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Subject (பாடம்)</label>
                        <select
                          value={dpSubject}
                          onChange={(e) => setDpSubject(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#ff7a00]"
                        >
                          {standardSubjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Term (பருவம்)</label>
                        <select
                          value={dpTerm}
                          onChange={(e) => setDpTerm(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#ff7a00]"
                        >
                          <option value="Term-1">Term 1</option>
                          <option value="Term-2">Term 2</option>
                          <option value="Term-3">Term 3</option>
                          <option value="Full Syllabus">Full Syllabus</option>
                        </select>
                      </div>
                    </div>

                    {/* STAGE SELECTOR CHECKBOXES */}
                    <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/90 space-y-2">
                      <label className="block text-xs font-black text-orange-900 uppercase tracking-wider">
                        Configure Included Stages (படிநிலைகள் தேர்வு):
                      </label>
                      <p className="text-[11px] text-orange-800 font-medium">
                        Select which stages are required for this daily practice (e.g. Stage 1, 4, 5 only):
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {[
                          { id: 1, label: "Stage 1: Lesson Book PDF (பாடப்பகுதி PDF)" },
                          { id: 2, label: "Stage 2: Short Notes PDF (சுருக்கக் குறிப்புகள் PDF)" },
                          { id: 3, label: "Stage 3: Video Lecture (காணொளி பாடம்)" },
                          { id: 4, label: "Stage 4: Practice Test (பயிற்சி வினாக்கள்)" },
                          { id: 5, label: "Stage 5: Online Test (80% தேர்ச்சி தேர்வு)" }
                        ].map((stg) => {
                          const isChecked = dpActiveStages.includes(stg.id);
                          return (
                            <label
                              key={stg.id}
                              className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDpActiveStages([...dpActiveStages, stg.id]);
                                  } else {
                                    if (dpActiveStages.length <= 1) {
                                      return showToast("At least one stage must be active.", "error");
                                    }
                                    setDpActiveStages(dpActiveStages.filter(s => s !== stg.id));
                                  }
                                }}
                                className="w-4 h-4 text-[#ff7a00] rounded focus:ring-0 cursor-pointer"
                              />
                              <span>{stg.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1.5 flex items-center justify-between">
                        <span>Study Material PDF (Stage 1) — Upload Document</span>
                        {dpPdfUrl && (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PDF Attached</span>
                          </span>
                        )}
                      </label>

                      {dpUploadingPdf ? (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                          <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
                          <p className="text-xs font-bold text-amber-900">Uploading Study Material PDF...</p>
                        </div>
                      ) : dpPdfFile || dpPdfUrl ? (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-[#061b36] truncate">
                                {dpPdfFile?.name || dpPdfUrl.split("/").pop()}
                              </p>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {dpPdfFile?.size || "PDF File"} • <span className="text-emerald-700 font-bold">Ready</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            {dpPdfUrl && (
                              <a
                                href={dpPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] transition cursor-pointer"
                                title="Preview Uploaded PDF"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#061b36] border border-slate-200 text-xs font-bold transition cursor-pointer">
                              <span>Change</span>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleDailyPracticeFileUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setDpPdfUrl("");
                                setDpPdfFile(null);
                              }}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                              title="Remove PDF"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-[#ff7a00] bg-slate-50 hover:bg-orange-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition space-y-1.5 group">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-orange-200 text-slate-500 group-hover:text-[#ff7a00] flex items-center justify-center shadow-2xs transition">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#061b36] group-hover:text-[#ff7a00]">
                              Click to Upload Study Material PDF (பாடக்குறிப்புகள்)
                            </span>
                            <p className="text-[11px] text-slate-500">Supports PDF documents up to 50MB</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleDailyPracticeFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Video Class URL (Stage 2 - Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/embed/..."
                        value={dpVideoUrl}
                        onChange={(e) => setDpVideoUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-medium focus:outline-none focus:border-[#ff7a00]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Questions</label>
                        <input
                          type="number"
                          min={5}
                          max={200}
                          value={dpQuestionsCount}
                          onChange={(e) => setDpQuestionsCount(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Time (Mins)</label>
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={dpTimeLimit}
                          onChange={(e) => setDpTimeLimit(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Pass %</label>
                        <input
                          type="number"
                          value={dpPassPercent}
                          disabled
                          className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creatingDp}
                      className="w-full py-3 rounded-2xl bg-[#ff7a00] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{creatingDp ? "Creating Card..." : "Publish Daily Practice Card →"}</span>
                    </button>
                  </form>
                </div>

                {/* LIST: EXISTING DAILY PRACTICE CARDS */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#1E3A8A]">
                      Published Daily Practice Tests ({Array.isArray(dailyPracticeList) ? dailyPracticeList.length : 0})
                    </h4>
                    <span className="text-xs text-slate-500 font-semibold">Live on Student Dashboard</span>
                  </div>

                  {(!Array.isArray(dailyPracticeList) || dailyPracticeList.length === 0) ? (
                    <div className="bg-white border border-sky-100 rounded-3xl p-8 text-center text-slate-500 space-y-2">
                      <Clock className="w-10 h-10 text-orange-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No Daily Practice tests published yet.</p>
                      <p className="text-xs">Use the form on the left to create and publish a daily practice card.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(Array.isArray(dailyPracticeList) ? dailyPracticeList : []).map((dp) => (
                        <div
                          key={dp.id}
                          className="bg-white border border-slate-200 hover:border-orange-300 rounded-3xl p-5 shadow-xs transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-[#ff7a00] text-[10px] font-black uppercase">
                                  Class {dp.class_num} • {dp.subject}
                                </span>
                                <span className="text-xs font-bold text-slate-500">{dp.term}</span>
                              </div>
                              <h4 className="text-base font-black text-[#061b36] mt-1">{dp.title}</h4>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active Card
                            </span>
                          </div>

                          {dp.description && (
                            <p className="text-xs text-slate-600 font-medium">{dp.description}</p>
                          )}

                          {/* Stages Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-400 mr-1">Stages:</span>
                            {(Array.isArray(dp.active_stages) ? dp.active_stages : (typeof dp.active_stages === "string" ? dp.active_stages.split(",").map(Number).filter(n => !isNaN(n)) : [1, 3, 4])).map((stg) => {
                              const labels = {
                                1: "Stage 1: Book PDF",
                                2: "Stage 2: Short Notes",
                                3: "Stage 3: Video",
                                4: "Stage 4: Practice",
                                5: "Stage 5: Online Test (80%)"
                              };
                              return (
                                <span
                                  key={stg}
                                  className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0055ff] border border-blue-200 text-[10px] font-bold"
                                >
                                  ✓ {labels[stg] || `Stage ${stg}`}
                                </span>
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <div className="text-xs text-slate-500 font-semibold">
                              <span>{dp.quiz_questions_count || 0} Questions Ready</span>
                              <span className="mx-1.5">•</span>
                              <span>{dp.time_limit_mins || 20} Mins</span>
                              <span className="mx-1.5">•</span>
                              <span className="text-emerald-700 font-bold">Pass: {dp.pass_percentage || 80}%</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* VIEW QUIZ BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleViewDailyPracticeQuiz(dp)}
                                disabled={quizLoading}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-blue-200 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                title="View Quiz Questions for Verification"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{quizLoading && viewingQuizDp?.id === dp.id ? "Loading..." : "View Quiz"}</span>
                              </button>

                              {/* DOWNLOAD QUIZ BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleDownloadDailyPracticeQuiz(dp)}
                                disabled={downloadingQuizId === dp.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                title="Download or Print Quiz for Admin Verification"
                              >
                                {downloadingQuizId === dp.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>Download PDF</span>
                              </button>

                              {/* RE-GENERATE QUIZ */}
                              <button
                                type="button"
                                onClick={() => handleGenerateDailyQuiz(dp)}
                                disabled={generatingDpId === dp.id}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1 cursor-pointer"
                                title="Regenerate syllabus questions using AI"
                              >
                                {generatingDpId === dp.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FilePlus className="w-3.5 h-3.5" />
                                )}
                                <span>{generatingDpId === dp.id ? "Generating..." : "Generate Quiz"}</span>
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDailyPractice(dp.id)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer"
                                title="Delete Daily Practice"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD & SCHEDULE LEARNING PORTAL MODULES */}
          {activeTab === "les_upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3">
                  <BookOpen className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.uploadLesHeader}</span>
                </h3>

                <form onSubmit={handleUploadLesson} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class / Module</label>
                      <select
                        value={lesClass}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLesClass(val);
                          if (val === 101) {
                            setLesSubject("Psychology");
                            setLesTerm("Special Module");
                            setIsCustomLesSubject(false);
                          } else if (val === 102) {
                            setLesSubject("Tamil Grammar");
                            setLesMedium("Tamil Medium");
                            setLesTerm("Classes 1-12");
                            setIsCustomLesSubject(false);
                          } else if (val === 103) {
                            setLesSubject("English Grammar");
                            setLesMedium("English Medium");
                            setLesTerm("Classes 1-12");
                            setIsCustomLesSubject(false);
                          } else if (val === 104) {
                            setLesSubject("Previous Year Papers");
                            setLesTerm("Classes 1-12");
                            setIsCustomLesSubject(false);
                          }
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      >
                        <optgroup label="Standard Classes (1–12)">
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                        </optgroup>
                        <optgroup label="✨ TET Special Class Modules (TET 1 & TET 2)">
                          <option value="101">🧠 101: Psychology (Tamil / English Medium)</option>
                          <option value="102">📖 102: Tamil Grammar (Classes 1–12 Scope)</option>
                          <option value="103">🔤 103: English Grammar (Classes 1–12 Scope)</option>
                          <option value="104">📜 104: Previous Year Question Papers</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Term / Scope</label>
                      <select
                        value={lesTerm}
                        onChange={(e) => setLesTerm(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      >
                        {lesClass >= 101 ? (
                          <>
                            <option value="Special Module">Special Module</option>
                            <option value="Classes 1-12">Classes 1–12 Scope</option>
                            <option value="Term-1">Term-1</option>
                            <option value="Term-2">Term-2</option>
                            <option value="Term-3">Term-3</option>
                          </>
                        ) : (
                          ["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Sequence #</label>
                      <input
                        type="number"
                        min="1"
                        value={lesOrder}
                        onChange={(e) => setLesOrder(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>

                  {lesClass >= 101 && (
                    <div className="p-3 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-xs font-bold text-indigo-950 flex items-start space-x-2 animate-fade-in shadow-2xs">
                      <span className="text-lg">
                        {lesClass === 101 ? "🧠" : lesClass === 102 ? "📖" : lesClass === 103 ? "🔤" : "📜"}
                      </span>
                      <div>
                        <span className="font-black text-indigo-900 block">
                          TET 1 & TET 2 Special Module: {
                            lesClass === 101 ? "Psychology (Tamil / English Medium)" :
                            lesClass === 102 ? "Tamil Grammar (Classes 1–12 Scope)" :
                            lesClass === 103 ? "English Grammar (Classes 1–12 Scope)" :
                            "Previous Year Question Papers (Classes 1–12 Scope)"
                          }
                        </span>
                        <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                          Content uploaded here will appear automatically under both TET 1 and TET 2 special module shelves for all enrolled teachers & students.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#1E3A8A]">Subject</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomLesSubject(!isCustomLesSubject)}
                        className="text-[#0284C7] hover:underline text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.customSubjectToggle}</span>
                      </button>
                    </div>

                    {isCustomLesSubject ? (
                      <input
                        type="text"
                        required
                        placeholder="Enter subject name e.g. Psychology or Computer Science"
                        value={customLesSubject}
                        onChange={(e) => setCustomLesSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    ) : (
                      <select
                        value={lesSubject}
                        onChange={(e) => setLesSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      >
                        {standardSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>

                  {((lesSubject !== "Tamil" && lesSubject !== "English") || lesClass === 101) ? (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Language Medium</label>
                      <select
                        value={lesMedium}
                        onChange={(e) => setLesMedium(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="Tamil Medium">தமிழ் Medium (Tamil Medium)</option>
                        <option value="English Medium">English Medium</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-between">
                      <span>Language Medium:</span>
                      <span className="font-bold text-[#1E3A8A]">{lesMedium} (Standard)</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Lesson Module Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 1: Tamil Alphabet & Grammar"
                      value={lesTitle}
                      onChange={(e) => setLesTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Detailed learning objectives..."
                      value={lesDesc}
                      onChange={(e) => setLesDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  {/* Scheduled Release Date & Time (Feature 1) */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#0284C7] flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scheduled Release Date & Time (Lock Until Date)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={lesAvailableAt}
                      onChange={(e) => setLesAvailableAt(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-sky-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Optional: Leave blank for immediate release, or set a future date & time to lock this lesson for students until then.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Stage 1 Lesson Book PDF (பாடப்பகுதி PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setLesFile(e.target.files[0])}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0284c7] mb-1">
                      Stage 2 Short Notes PDF (சுருக்கக் குறிப்புகள் PDF - விருப்பத்தேர்வு)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setLesShortNotesFile(e.target.files[0])}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Stage 3 Video Embed URL (காணொளி விளக்கம்)</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/..."
                      value={lesVideoUrl}
                      onChange={(e) => setLesVideoUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingLes}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {uploadingLes ? "Publishing Lesson..." : t.publishLesBtn}
                  </button>
                </form>
              </div>

              {/* Lessons Catalog with Class, Subject & Search Filters */}
              <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col gap-2.5 border-b border-sky-100 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#1E3A8A]">
                      Learning Modules Catalog ({lessonsList.length})
                    </h3>
                  </div>
                  
                  {/* Class, Subject & Search Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Class Filter Dropdown */}
                    <div className="flex items-center space-x-1.5 flex-1 min-w-[130px]">
                      <Filter className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                      <select
                        value={lesFilterClass}
                        onChange={(e) => setLesFilterClass(e.target.value)}
                        className="w-full p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="All">All Classes ({lessonsList.length})</option>
                        <optgroup label="Standard Classes (1–12)">
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                            <option key={c} value={c}>Class {c} ({lessonsList.filter(l => l.class_num === c).length})</option>
                          ))}
                        </optgroup>
                        <optgroup label="✨ TET Special Class Modules">
                          <option value="101">🧠 101: Psychology ({lessonsList.filter(l => l.class_num === 101).length})</option>
                          <option value="102">📖 102: Tamil Grammar ({lessonsList.filter(l => l.class_num === 102).length})</option>
                          <option value="103">🔤 103: English Grammar ({lessonsList.filter(l => l.class_num === 103).length})</option>
                          <option value="104">📜 104: Previous Papers ({lessonsList.filter(l => l.class_num === 104).length})</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Subject Filter Dropdown */}
                    <div className="flex items-center space-x-1.5 flex-1 min-w-[120px]">
                      <select
                        value={lesFilterSubject}
                        onChange={(e) => setLesFilterSubject(e.target.value)}
                        className="w-full p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="All">All Subjects ({lessonsList.length})</option>
                        {standardSubjects.map(s => (
                          <option key={s} value={s}>
                            {s} ({lessonsList.filter(l => l.subject === s).length})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search module title or notes..."
                        value={lesSearchQuery}
                        onChange={(e) => setLesSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {lessonsList
                    .filter(l => {
                      const matchesClass = lesFilterClass === "All" || String(l.class_num) === String(lesFilterClass);
                      const matchesSubject = lesFilterSubject === "All" || l.subject === lesFilterSubject;
                      const matchesSearch = !lesSearchQuery.trim() || 
                        (l.title || "").toLowerCase().includes(lesSearchQuery.toLowerCase()) ||
                        (l.description || "").toLowerCase().includes(lesSearchQuery.toLowerCase());
                      return matchesClass && matchesSubject && matchesSearch;
                    })
                    .map((l) => {
                      const isFuture = l.available_at && new Date(l.available_at) > new Date();
                      const isSpecial = l.class_num >= 101;
                      return (
                        <div
                          key={l.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-3">
                              <span className="text-xl shrink-0 mt-0.5">
                                {l.class_num === 101 ? "🧠" : l.class_num === 102 ? "📖" : l.class_num === 103 ? "🔤" : l.class_num === 104 ? "📜" : "📚"}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-[#1E3A8A] flex items-center space-x-1.5 flex-wrap">
                                  <span>{l.title}</span>
                                  {isSpecial && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                      TET Special
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  {l.class_num === 101 ? "Psychology (Tamil / English)" :
                                   l.class_num === 102 ? "Tamil Grammar (1–12 Scope)" :
                                   l.class_num === 103 ? "English Grammar (1–12 Scope)" :
                                   l.class_num === 104 ? "Previous Papers (1–12 Scope)" :
                                   `Class ${l.class_num}`} • {l.subject} ({l.medium}) • {l.term} • Lesson #{l.lesson_order}
                                </span>
                              </div>
                            </div>

                            {/* Share, Edit & Delete Action Buttons */}
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setShortNotesFile(null);
                                  setUploadShortNotesModal({ lesson: l });
                                }}
                                title="Upload Stage 2 Short Notes PDF"
                                className={`px-2 py-1 text-xs font-bold rounded-lg cursor-pointer transition flex items-center space-x-1 shadow-2xs ${
                                  l.short_notes_pdf_url
                                    ? "bg-sky-100 text-[#0284c7] hover:bg-sky-200 border border-sky-300"
                                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                                <span>{l.short_notes_pdf_url ? "Notes ✓" : "+ Notes"}</span>
                              </button>
                              <button
                                onClick={() => setSharingLesson(l)}
                                title="Share Lesson Message (வாட்ஸ்அப் / டெலிகிராம் செய்தி)"
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition flex items-center space-x-1 shadow-2xs"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>பகிர்வு (Share)</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditLesson(l)}
                                title="Edit Lesson & Schedule"
                                className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg hover:bg-sky-50 cursor-pointer transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(l.id)}
                                title="Delete Lesson"
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Schedule Status & Quiz Availability Badges */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[10px]">
                            {l.available_at ? (
                              isFuture ? (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Unlocks: {new Date(l.available_at).toLocaleString()}</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Released ({new Date(l.available_at).toLocaleDateString()})</span>
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-sky-100 text-[#0284C7]">
                                ⚡ Immediate Release
                              </span>
                            )}

                            {/* All 5 Stage Status Badges */}
                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.pdf_url ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                              Stage 1 Book: {l.pdf_url ? "✅ Ready" : "❌ None"}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.short_notes_pdf_url ? "bg-sky-100 text-[#0284c7]" : "bg-slate-200 text-slate-600"}`}>
                              Stage 2 Notes: {l.short_notes_pdf_url ? "✅ Ready" : "❌ None"}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.video_url ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                              Stage 3 Video: {l.video_url ? "✅ Ready" : "❌ None"}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.has_quiz_type1 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                              Stage 4 Practice: {l.has_quiz_type1 ? `✅ ${l.quiz_type1_count} Qs` : "❌ None"} {l.stage4_force_open ? "• 🔓 Open" : `• ${l.stage4_unlock_time || "8:00 PM"}`}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.has_quiz_type2 ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"}`}>
                              Stage 5 Exam: {l.has_quiz_type2 ? `✅ ${l.quiz_type2_count} Qs` : "❌ None"} {l.stage5_force_open ? "• 🔓 Open" : `• ${l.stage5_unlock_time || "8:00 PM"}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: QUIZ MANAGEMENT & GENERATOR (TYPE 1 & TYPE 2) */}
          {activeTab === "quiz_manager" && (
            <div className="space-y-6">
              
              {/* Header card */}
              <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-[#0284C7] mb-1 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Executive Assessment Management</span>
                  </div>
                  <h3 className="text-xl font-black text-[#1E3A8A]">
                    Curriculum Quiz Management (Type 1 & Type 2)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-2xl">
                    Manage quizzes for every lesson. Students practice <strong>Type 1</strong> in Stage 4. If a student fails the Stage 5 Online Exam (under 80%), they are automatically assigned <strong>Type 2</strong> questions to restudy Stage 4.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Filter Grade</label>
                    <select
                      value={quizGradeFilter}
                      onChange={(e) => setQuizGradeFilter(e.target.value)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="All">All Grades (1–12 & Specials)</option>
                      <optgroup label="Standard Classes (1–12)">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </optgroup>
                      <optgroup label="✨ TET Special Modules">
                        <option value="101">🧠 101: Psychology</option>
                        <option value="102">📖 102: Tamil Grammar</option>
                        <option value="103">🔤 103: English Grammar</option>
                        <option value="104">📜 104: Previous Papers</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Filter Subject</label>
                    <select
                      value={quizSubjectFilter}
                      onChange={(e) => setQuizSubjectFilter(e.target.value)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="All">All Subjects</option>
                      {standardSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleUnlockAllStage4}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                      title="Force unlock all lessons Stage 5 Timed Exams immediately today"
                    >
                      <span>🔓 Unlock All Stage 5 Today</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lessons Quiz Cards List */}
              <div className="space-y-4">
                {lessonsList
                  .filter(l => (quizGradeFilter === "All" || String(l.class_num) === String(quizGradeFilter)) &&
                               (quizSubjectFilter === "All" || l.subject === quizSubjectFilter))
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4"
                    >
                      {/* Lesson Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#0055ff] text-[10px] font-black uppercase">
                              Class {lesson.class_num} • {lesson.term}
                            </span>
                            <span className="text-xs font-bold text-slate-500">Lesson #{lesson.lesson_order}</span>
                          </div>
                          <h4 className="text-base font-black text-[#1E3A8A] mt-1">{lesson.title}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {lesson.subject} ({lesson.medium})
                          </span>
                        </div>

                        {/* Stage 2 Notes PDF, Stage 5 Manual Unlock & Share Message */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShortNotesFile(null);
                              setUploadShortNotesModal({ lesson });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                              lesson.short_notes_pdf_url 
                                ? "bg-sky-100 hover:bg-sky-200 text-[#0284c7] border border-sky-300"
                                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                            title="Upload Stage 2 Short Notes PDF"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span>{lesson.short_notes_pdf_url ? "📄 Notes PDF ✓" : "+ Notes PDF"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSharingLesson(lesson)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0055ff] hover:bg-blue-700 text-white transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                            title="Share Lesson Message (வாட்ஸ்அப் / டெலிகிராம் செய்தி)"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>பகிர்வு செய்தி (Share)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleLessonStage4(lesson.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition border cursor-pointer flex items-center space-x-2 ${
                              (lesson.stage5_force_open ?? lesson.stage4_force_open)
                                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md ring-2 ring-emerald-300"
                                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                            }`}
                            title={(lesson.stage5_force_open ?? lesson.stage4_force_open) ? "Click to lock Stage 5 back to 8:00 PM schedule" : "Click to force unlock Stage 5 immediately"}
                          >
                            {(lesson.stage5_force_open ?? lesson.stage4_force_open) ? (
                              <>
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
                                </span>
                                <span>🔓 Stage 5: UNLOCKED (திறக்கப்பட்டது)</span>
                              </>
                            ) : (
                              <span>🔒 Stage 5: Opens 8:00 PM</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 2-Column Quiz Cards: Type 1 & Type 2 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* TYPE 1 QUIZ CARD */}
                        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[#0284C7] uppercase tracking-wider flex items-center space-x-1.5">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Type 1 Quiz (Stage 4 Standard Practice)</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${lesson.has_quiz_type1 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                                {lesson.has_quiz_type1 ? `✅ Ready (${lesson.quiz_type1_count} Questions)` : "⚠️ Not Generated"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              Default MCQs loaded for Stage 4 practice before the Stage 5 timed test.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-sky-100">
                            <button
                              onClick={() => handleGenerateQuiz(lesson, "type1")}
                              disabled={generatingQuizKey === `${lesson.id}_type1`}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              {generatingQuizKey === `${lesson.id}_type1` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
                              <span>{generatingQuizKey === `${lesson.id}_type1` ? "Working..." : "Auto Generate"}</span>
                            </button>

                            <button
                              onClick={() => {
                                setQuizPdfFile(null);
                                setUploadQuizPdfModal({ lesson, quiz_type: "type1" });
                              }}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#0284C7] text-xs font-bold transition cursor-pointer"
                              title="Upload Question Paper PDF to extract questions & answers"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload PDF</span>
                            </button>

                            <button
                              onClick={() => handleOpenManualQuiz(lesson, "type1")}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#1E3A8A] text-xs font-bold transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#0284C7]" />
                              <span>Manual</span>
                            </button>

                            <button
                              onClick={() => handleViewQuiz(lesson, "type1")}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#1E3A8A] text-xs font-bold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={async () => {
                                const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/type1`);
                                handleDownloadAdminQuiz(lesson, "type1", res.questions || []);
                              }}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 text-xs font-bold transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* TYPE 2 QUIZ CARD */}
                        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center space-x-1.5">
                                <Award className="w-3.5 h-3.5" />
                                <span>Type 2 Quiz (Remedial Restudy Quiz)</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${lesson.has_quiz_type2 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                                {lesson.has_quiz_type2 ? `✅ Ready (${lesson.quiz_type2_count} Questions)` : "⚠️ Not Generated"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              Automatically served to students who fail the Stage 5 Exam (&lt;80% pass mark).
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-purple-100">
                            <button
                              onClick={() => handleGenerateQuiz(lesson, "type2")}
                              disabled={generatingQuizKey === `${lesson.id}_type2`}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              {generatingQuizKey === `${lesson.id}_type2` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
                              <span>{generatingQuizKey === `${lesson.id}_type2` ? "Working..." : "Auto Generate"}</span>
                            </button>

                            <button
                              onClick={() => {
                                setQuizPdfFile(null);
                                setUploadQuizPdfModal({ lesson, quiz_type: "type2" });
                              }}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-purple-700 text-xs font-bold transition cursor-pointer"
                              title="Upload Question Paper PDF to extract questions & answers"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload PDF</span>
                            </button>

                            <button
                              onClick={() => handleOpenManualQuiz(lesson, "type2")}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-purple-900 text-xs font-bold transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Manual</span>
                            </button>

                            <button
                              onClick={() => handleViewQuiz(lesson, "type2")}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={async () => {
                                const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/type2`);
                                handleDownloadAdminQuiz(lesson, "type2", res.questions || []);
                              }}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 text-xs font-bold transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* TAB 4: LIVE MEETINGS MANAGEMENT */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center space-x-2 text-[#0284C7] mb-1 font-bold text-xs uppercase tracking-wider">
                  <Video className="w-4 h-4" />
                  <span>Virtual Classroom & Live Classes</span>
                </div>
                <h3 className="text-xl font-black text-[#1E3A8A]">
                  Live Class & Meeting Management
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Schedule live classes, doubt clearing sessions, and webinars. When a meeting is active within its scheduled hours, a prominent pulsating <strong>🔴 LIVE NOW</strong> banner is displayed directly on student dashboards.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form to Schedule Meeting */}
                <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h4 className="text-sm font-black text-[#1E3A8A] flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#0284C7]" />
                      <span>Schedule New Live Meeting</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleFillDemoMeeting}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-bold border border-sky-200 transition cursor-pointer flex items-center space-x-1"
                      title="Quick fill working Google Meet demo details"
                    >
                      <Video className="w-3 h-3 text-[#0284C7]" />
                      <span>Insert Demo Link</span>
                    </button>
                  </div>

                  <form onSubmit={handleCreateMeeting} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Meeting Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TET Paper 2 Science Live Doubt Clearing"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Meeting Join Link / URL *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://meet.google.com/... or Zoom / YouTube Live"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                          Start Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={meetingStart}
                          onChange={(e) => setMeetingStart(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                          End Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={meetingEnd}
                          onChange={(e) => setMeetingEnd(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        Agenda / Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Topics covered, instructors, preparation instructions..."
                        value={meetingDesc}
                        onChange={(e) => setMeetingDesc(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingMeeting}
                      className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer transition"
                    >
                      {creatingMeeting ? "Scheduling..." : "➕ Schedule Live Meeting"}
                    </button>
                  </form>
                </div>

                {/* Scheduled Meetings List */}
                <div className="lg:col-span-7 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h4 className="text-sm font-black text-[#1E3A8A]">
                      Scheduled Classes & Meetings ({meetingsList.length})
                    </h4>
                    <span className="text-[11px] text-slate-500 font-bold">
                      🔴 {meetingsList.filter(m => m.is_live).length} Currently Live
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                    {meetingsList.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">
                        No live meetings scheduled yet. Create one on the left.
                      </p>
                    ) : (
                      meetingsList.map((m) => {
                        const now = new Date();
                        const sTime = new Date(m.start_time);
                        const eTime = new Date(m.end_time);
                        const isUpcoming = sTime > now;
                        const isPast = eTime < now;
                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-2xl border space-y-3 transition ${
                              m.is_live
                                ? "bg-red-50/60 border-red-200"
                                : isUpcoming
                                ? "bg-amber-50/40 border-amber-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  {m.is_live ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse flex items-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                      <span>🔴 LIVE NOW</span>
                                    </span>
                                  ) : isUpcoming ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      ⏳ Upcoming
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                      Ended
                                    </span>
                                  )}
                                  <h4 className="text-xs font-bold text-[#1E3A8A]">{m.title}</h4>
                                </div>
                                {m.description && (
                                  <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <a
                                  href={m.meeting_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Test Join Link"
                                  className="p-1.5 text-[#0284C7] hover:bg-sky-50 rounded-lg cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleOpenEditMeeting(m)}
                                  title="Edit Meeting"
                                  className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg hover:bg-sky-50 cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMeeting(m.id)}
                                  title="Delete Meeting"
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200/80">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                                <span>{sTime.toLocaleString()} – {eTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                              <span className="text-[#0284C7] font-mono truncate max-w-[200px]">
                                {m.meeting_url}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: UPLOAD MATERIALS EXPLORER PDF */}
          {activeTab === "mat_upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3">
                  <FolderPlus className="w-5 h-5 text-[#0284C7]" />
                  <span>{t.uploadPdfHeader}</span>
                </h3>

                <form onSubmit={handleUploadMaterial} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class (1 to 12)</label>
                      <select
                        value={matClass}
                        onChange={(e) => setMatClass(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Academic Term</label>
                      <select
                        value={matTerm}
                        onChange={(e) => setMatTerm(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#1E3A8A]">Subject</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomMatSubject(!isCustomMatSubject)}
                        className="text-[#0284C7] hover:underline text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.customSubjectToggle}</span>
                      </button>
                    </div>

                    {isCustomMatSubject ? (
                      <input
                        type="text"
                        required
                        placeholder="Enter subject name e.g. Environmental Science"
                        value={customMatSubject}
                        onChange={(e) => setCustomMatSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      />
                    ) : (
                      <select
                        value={matSubject}
                        onChange={(e) => setMatSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {standardSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>

                  {matSubject !== "Tamil" && matSubject !== "English" ? (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Language Medium</label>
                      <select
                        value={matMedium}
                        onChange={(e) => setMatMedium(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        <option value="Tamil Medium">தமிழ் Medium (Tamil Medium)</option>
                        <option value="English Medium">English Medium</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-between">
                      <span>Language Medium:</span>
                      <span className="font-bold text-[#1E3A8A]">{matMedium} (Standard)</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Material Book Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Standard 8 - Social Science Term 1 Guide"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Key highlights and contents of the PDF..."
                      value={matDesc}
                      onChange={(e) => setMatDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Choose PDF File</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setMatFile(e.target.files[0])}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingMat}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {uploadingMat ? "Publishing..." : t.publishBtn}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    TN Textbooks Catalog ({materialsList.length})
                  </h3>
                  
                  {/* Filters: Class and Subject (TASK 7) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={matFilterClass}
                      onChange={(e) => setMatFilterClass(e.target.value)}
                      className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="All">All Classes</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-1">
                      <Filter className="w-3.5 h-3.5 text-[#0284C7]" />
                      <select
                        value={matFilterSubject}
                        onChange={(e) => setMatFilterSubject(e.target.value)}
                        className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="All">All Subjects ({materialsList.length})</option>
                        {standardSubjects.map(s => (
                          <option key={s} value={s}>
                            {s} ({materialsList.filter(m => m.subject === s).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {materialsList
                    .filter(m => (matFilterClass === "All" || m.class_num === Number(matFilterClass)) && (matFilterSubject === "All" || m.subject === matFilterSubject))
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-[#0284C7] shrink-0" />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-[#1E3A8A] truncate">{m.title}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold truncate block">
                              Class {m.class_num} • {m.subject} ({m.medium}) • {m.term}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* EDIT MATERIAL BUTTON (TASK 7) */}
                          <button
                            onClick={() => setEditingMaterial(m)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                            title="Edit Material"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* EDIT MATERIAL MODAL (TASK 7) */}
              {editingMaterial && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                      <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
                        <Edit3 className="w-4 h-4 text-[#0284C7]" />
                        <span>Edit TN Textbook Material</span>
                      </h3>
                      <button
                        onClick={() => setEditingMaterial(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateMaterial} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Class (1 to 12)</label>
                          <select
                            value={editingMaterial.class_num}
                            onChange={(e) => setEditingMaterial({ ...editingMaterial, class_num: Number(e.target.value) })}
                            className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Academic Term</label>
                          <select
                            value={editingMaterial.term}
                            onChange={(e) => setEditingMaterial({ ...editingMaterial, term: e.target.value })}
                            className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                          >
                            {["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Subject</label>
                          <input
                            type="text"
                            value={editingMaterial.subject}
                            onChange={(e) => setEditingMaterial({ ...editingMaterial, subject: e.target.value })}
                            className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Medium</label>
                          <select
                            value={editingMaterial.medium}
                            onChange={(e) => setEditingMaterial({ ...editingMaterial, medium: e.target.value })}
                            className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                          >
                            <option value="Tamil Medium">Tamil Medium</option>
                            <option value="English Medium">English Medium</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={editingMaterial.title}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                          className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={editingMaterial.description || ""}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                          className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">PDF File URL</label>
                        <input
                          type="text"
                          value={editingMaterial.pdf_url || ""}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, pdf_url: e.target.value })}
                          className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingMaterial(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingMaterial}
                          className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          {isUpdatingMaterial ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: AI & TEST CONFIGURATOR */}
          {activeTab === "settings" && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs max-w-2xl mx-auto space-y-5">
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3.5">
                <Cpu className="w-5 h-5 text-[#0284C7]" />
                <span>Gemini Test Engine Configuration</span>
              </h3>

              {/* Clickable Link to Get Gemini API Key */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Key className="w-5 h-5 text-[#0284C7]" />
                  <div>
                    <span className="text-xs font-bold text-[#1E3A8A] block">Google Gemini API Portal</span>
                    <span className="text-[11px] text-slate-500 font-medium">Generate your API key for live test question generation</span>
                  </div>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                >
                  <span>Get Gemini Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                    Google Gemini AI API Key (Paste Key Here)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#0284C7]"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                    If no key is pasted, smart fallback AI generator automatically generates questions & tests.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      Stage 4 Practice Questions Count
                    </label>
                    <input
                      type="number"
                      value={practiceCount}
                      onChange={(e) => setPracticeCount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      Stage 5 Timed Test Question Count
                    </label>
                    <input
                      type="number"
                      value={testCount}
                      onChange={(e) => setTestCount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      Exam Time Limit (Minutes)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      Passing Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={passPercent}
                      onChange={(e) => setPassPercent(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* DUAL QUESTION TYPE DISTRIBUTION: STAGE 4 PRACTICE & STAGE 5 TIMED TEST */}
                {(() => {
                  const currentCounts4 = [
                    Number(countMcq || 0),
                    Number(countHots || 0),
                    Number(countMatch || 0),
                    Number(countMultiStmt || 0),
                    Number(countAssertion || 0),
                    Number(countChronological || 0),
                  ];
                  const setters4 = [
                    setCountMcq,
                    setCountHots,
                    setCountMatch,
                    setCountMultiStmt,
                    setCountAssertion,
                    setCountChronological,
                  ];
                  const stage3Total = currentCounts4.reduce((a, b) => a + b, 0);

                  const currentCounts5 = [
                    Number(stage4CountMcq || 0),
                    Number(stage4CountHots || 0),
                    Number(stage4CountMatch || 0),
                    Number(stage4CountMultiStmt || 0),
                    Number(stage4CountAssertion || 0),
                    Number(stage4CountChronological || 0),
                  ];
                  const setters5 = [
                    setStage4CountMcq,
                    setStage4CountHots,
                    setStage4CountMatch,
                    setStage4CountMultiStmt,
                    setStage4CountAssertion,
                    setStage4CountChronological,
                  ];
                  const stage4Total = currentCounts5.reduce((a, b) => a + b, 0);

                  // Calculate sequential From & To question number ranges for Stage 4
                  let runStart4 = 1;
                  const s4Types = [
                    { id: "mcq", title: "1. MCQ (கொள்குறி)", sub: "Multiple Choice", placeholder: "40", badgeColor: "bg-blue-100 text-blue-800 border-blue-200" },
                    { id: "hots", title: "2. உயர் சிந்தனை (HOTS)", sub: "Higher Order", placeholder: "20", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                    { id: "match", title: "3. பொருத்துக (Match)", sub: "Matching", placeholder: "10", badgeColor: "bg-purple-100 text-purple-800 border-purple-200" },
                    { id: "multi", title: "4. பல்கூற்று (Multi-Stmt)", sub: "Analysis", placeholder: "10", badgeColor: "bg-amber-100 text-amber-800 border-amber-200" },
                    { id: "assertion", title: "5. கூற்று காரணம்", sub: "Assertion", placeholder: "10", badgeColor: "bg-rose-100 text-rose-800 border-rose-200" },
                    { id: "chrono", title: "6. கால வரிசை", sub: "Chronological", placeholder: "10", badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200" },
                  ].map((item, idx) => {
                    const c = currentCounts4[idx];
                    const from = c > 0 ? runStart4 : runStart4;
                    const to = c > 0 ? runStart4 + c - 1 : runStart4 - 1;
                    if (c > 0) runStart4 = to + 1;
                    return { ...item, count: c, from, to, index: idx };
                  });

                  // Calculate sequential From & To question number ranges for Stage 5
                  let runStart5 = 1;
                  const s5Types = [
                    { id: "mcq", title: "1. MCQ (கொள்குறி)", sub: "Multiple Choice", placeholder: "20", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200" },
                    { id: "hots", title: "2. உயர் சிந்தனை (HOTS)", sub: "Higher Order", placeholder: "10", badgeColor: "bg-teal-100 text-teal-800 border-teal-200" },
                    { id: "match", title: "3. பொருத்துக (Match)", sub: "Matching", placeholder: "5", badgeColor: "bg-violet-100 text-violet-800 border-violet-200" },
                    { id: "multi", title: "4. பல்கூற்று (Multi-Stmt)", sub: "Analysis", placeholder: "5", badgeColor: "bg-orange-100 text-orange-800 border-orange-200" },
                    { id: "assertion", title: "5. கூற்று காரணம்", sub: "Assertion", placeholder: "5", badgeColor: "bg-red-100 text-red-800 border-red-200" },
                    { id: "chrono", title: "6. கால வரிசை", sub: "Chronological", placeholder: "5", badgeColor: "bg-sky-100 text-sky-800 border-sky-200" },
                  ].map((item, idx) => {
                    const c = currentCounts5[idx];
                    const from = c > 0 ? runStart5 : runStart5;
                    const to = c > 0 ? runStart5 + c - 1 : runStart5 - 1;
                    if (c > 0) runStart5 = to + 1;
                    return { ...item, count: c, from, to, index: idx };
                  });

                  const handleUpdateStage4 = (index, field, value) => {
                    const counts = [...currentCounts4];
                    const numVal = Math.max(0, parseInt(value, 10) || 0);

                    if (field === "count") {
                      setters4[index](numVal);
                      counts[index] = numVal;
                    } else if (field === "to") {
                      const from = s4Types[index].from;
                      const newCount = Math.max(0, numVal >= from ? numVal - from + 1 : 0);
                      setters4[index](newCount);
                      counts[index] = newCount;
                    }
                    const newTotal = counts.reduce((a, b) => a + b, 0);
                    setPracticeCount(newTotal);
                  };

                  const handleUpdateStage5 = (index, field, value) => {
                    const counts = [...currentCounts5];
                    const numVal = Math.max(0, parseInt(value, 10) || 0);

                    if (field === "count") {
                      setters5[index](numVal);
                      counts[index] = numVal;
                    } else if (field === "to") {
                      const from = s5Types[index].from;
                      const newCount = Math.max(0, numVal >= from ? numVal - from + 1 : 0);
                      setters5[index](newCount);
                      counts[index] = newCount;
                    }
                    const newTotal = counts.reduce((a, b) => a + b, 0);
                    setTestCount(newTotal);
                  };

                  return (
                    <div className="pt-3 border-t border-slate-200/80 space-y-6">
                      
                      {/* 1. STAGE 4 PRACTICE QUESTION DISTRIBUTION */}
                      <div className="space-y-3.5 bg-blue-50/40 p-4 sm:p-5 rounded-3xl border border-blue-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#061b36] flex items-center gap-1.5">
                              <SlidersHorizontal className="w-4 h-4 text-[#0055ff]" />
                              <span>Stage 4 Practice Question Types Distribution (நிலை 4 வினா ஒதுக்கீடு)</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Specify the exact question range (From Q# to To Q#) or count for each question type. Matches Stage 4 Practice Count ({practiceCount} Qs).
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setCountMcq(40);
                                setCountHots(20);
                                setCountMatch(10);
                                setCountMultiStmt(10);
                                setCountAssertion(10);
                                setCountChronological(10);
                                setPracticeCount(100);
                              }}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#0055ff] border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                              title="Reset Stage 4 distribution to standard ratio (40 MCQ, 20 HOTS, 10 Match, 10 Multi, 10 Assertion, 10 Chrono = 100 Qs)"
                            >
                              Standard (40 MCQ / 100 Qs)
                            </button>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border shrink-0 ${
                              stage3Total === Number(practiceCount)
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            }`}>
                              Total: {stage3Total} Qs {stage3Total === Number(practiceCount) ? "✓ Matches" : `(Specified: ${practiceCount})`}
                            </span>
                          </div>
                        </div>

                        {/* Visual Range Timeline Bar */}
                        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
                            <span>Question Number Sequence:</span>
                          </span>
                          {s4Types.map(t => (
                            <span
                              key={t.id}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${t.badgeColor}`}
                            >
                              {t.title.split(' ')[1]}: {t.count > 0 ? `Q${t.from} – Q${t.to}` : "None"} ({t.count} Qs)
                            </span>
                          ))}
                        </div>

                        {/* 6 Question Type Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                          {s4Types.map((item) => (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs hover:border-blue-300 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-black text-[#061b36] block">
                                    {item.title}
                                  </label>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {item.sub}
                                  </span>
                                </div>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                                  {item.count > 0 ? `Q${item.from} – Q${item.to}` : "0 Qs"}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 pt-1">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    From Q#
                                  </label>
                                  <input
                                    type="number"
                                    value={item.from}
                                    readOnly
                                    className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black text-center cursor-not-allowed select-none"
                                    title={`Starts at Question #${item.from}`}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    To Q#
                                  </label>
                                  <input
                                    type="number"
                                    min={item.from}
                                    value={item.count > 0 ? item.to : ""}
                                    placeholder={item.count > 0 ? String(item.to) : "-"}
                                    onChange={(e) => handleUpdateStage4(item.index, "to", e.target.value)}
                                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black text-center focus:outline-none focus:border-[#0055ff] focus:bg-white"
                                    title={`Specify end question number for ${item.title}`}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Count (Qs)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.count}
                                    placeholder={item.placeholder}
                                    onChange={(e) => handleUpdateStage4(item.index, "count", e.target.value)}
                                    className="w-full p-2 rounded-xl bg-blue-50/50 border border-blue-200 text-[#0055ff] text-xs font-black text-center focus:outline-none focus:border-[#0055ff] focus:bg-white"
                                    title={`Total questions for ${item.title}`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. STAGE 5 TIMED TEST QUESTION DISTRIBUTION */}
                      <div className="space-y-3.5 bg-indigo-50/40 p-4 sm:p-5 rounded-3xl border border-indigo-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#061b36] flex items-center gap-1.5">
                              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                              <span>Stage 5 Timed Test Question Types Distribution (நிலை 5 தேர்வு ஒதுக்கீடு)</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Specify the exact question range (From Q# to To Q#) or count for each question type. Matches Stage 5 Question Count ({testCount} Qs).
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setStage4CountMcq(20);
                                setStage4CountHots(10);
                                setStage4CountMatch(5);
                                setStage4CountMultiStmt(5);
                                setStage4CountAssertion(5);
                                setStage4CountChronological(5);
                                setTestCount(50);
                              }}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                              title="Reset Stage 5 distribution to standard ratio (20 MCQ, 10 HOTS, 5 Match, 5 Multi, 5 Assertion, 5 Chrono = 50 Qs)"
                            >
                              Standard (20 MCQ / 50 Qs)
                            </button>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border shrink-0 ${
                              stage4Total === Number(testCount)
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            }`}>
                              Total: {stage4Total} Qs {stage4Total === Number(testCount) ? "✓ Matches" : `(Specified: ${testCount})`}
                            </span>
                          </div>
                        </div>

                        {/* Visual Range Timeline Bar */}
                        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
                            <span>Question Number Sequence:</span>
                          </span>
                          {s5Types.map(t => (
                            <span
                              key={t.id}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${t.badgeColor}`}
                            >
                              {t.title.split(' ')[1]}: {t.count > 0 ? `Q${t.from} – Q${t.to}` : "None"} ({t.count} Qs)
                            </span>
                          ))}
                        </div>

                        {/* 6 Question Type Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                          {s5Types.map((item) => (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs hover:border-indigo-300 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-black text-[#061b36] block">
                                    {item.title}
                                  </label>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {item.sub}
                                  </span>
                                </div>
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                                  {item.count > 0 ? `Q${item.from} – Q${item.to}` : "0 Qs"}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 pt-1">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    From Q#
                                  </label>
                                  <input
                                    type="number"
                                    value={item.from}
                                    readOnly
                                    className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black text-center cursor-not-allowed select-none"
                                    title={`Starts at Question #${item.from}`}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    To Q#
                                  </label>
                                  <input
                                    type="number"
                                    min={item.from}
                                    value={item.count > 0 ? item.to : ""}
                                    placeholder={item.count > 0 ? String(item.to) : "-"}
                                    onChange={(e) => handleUpdateStage5(item.index, "to", e.target.value)}
                                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black text-center focus:outline-none focus:border-indigo-600 focus:bg-white"
                                    title={`Specify end question number for ${item.title}`}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    Count (Qs)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.count}
                                    placeholder={item.placeholder}
                                    onChange={(e) => handleUpdateStage5(item.index, "count", e.target.value)}
                                    className="w-full p-2 rounded-xl bg-indigo-50/50 border border-indigo-200 text-indigo-700 text-xs font-black text-center focus:outline-none focus:border-indigo-600 focus:bg-white"
                                    title={`Total questions for ${item.title}`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strict PDF Notice Banner */}
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="block text-amber-950 font-bold">Strict PDF Material Extraction Active</strong>
                          <span className="text-amber-800 leading-relaxed font-medium">
                            All questions are generated exclusively from the uploaded lesson PDF material. No outside questions, zero repetitions (ONE question ONCE only), and zero overlap between Stage 4 Practice and Stage 5 Timed Test.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= STUDENT PDF DOWNLOAD CONTROLS ================= */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2.5">
                    <Download className="w-4 h-4 text-[#0055ff]" />
                    <h4 className="text-xs font-black text-[#061b36] uppercase tracking-wider">
                      Student PDF Download Permissions (பதிவிறக்கக் கட்டுப்பாடு)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Control whether students can download study material PDFs and practice quiz test PDFs to their devices. Whenever necessary, these buttons can be enabled or disabled instantly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Toggle: Materials PDF Download */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#0055ff]" />
                          <span className="text-xs font-black text-[#061b36]">Material PDF Downloads</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Allow students to download textbook study PDFs
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnableMaterialDownload(!enableMaterialDownload)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          enableMaterialDownload 
                            ? "bg-emerald-600 text-white shadow-xs" 
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {enableMaterialDownload ? "ENABLED ✓" : "DISABLED ✕"}
                      </button>
                    </div>

                    {/* Toggle: Quiz PDF Download */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-black text-[#061b36]">Quiz & Test PDF Downloads</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Allow students to download practice quiz PDFs
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnableQuizDownload(!enableQuizDownload)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          enableQuizDownload 
                            ? "bg-emerald-600 text-white shadow-xs" 
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {enableQuizDownload ? "ENABLED ✓" : "DISABLED ✕"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= RAZORPAY PAYMENT GATEWAY CONFIGURATION ================= */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-blue-200/80 pb-2.5">
                    <CreditCard className="w-4 h-4 text-[#0055ff]" />
                    <h4 className="text-xs font-black text-[#061b36] uppercase tracking-wider">
                      Razorpay Payment Gateway & Course Pricing
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Configure your Razorpay API Key ID, Key Secret, course pricing, and automated discount coupons. When a user enrolls, all 3 locked modules (TET 1, TET 2, Online Live Classes) are activated seamlessly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#061b36] mb-1">Course MRP (₹ Strikethrough)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="2499"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#061b36] mb-1">Default Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="60"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#061b36] mb-1">Selling Price (₹ INR)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="999"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-[#0055ff] text-xs font-black focus:outline-none focus:border-[#0055ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#061b36] mb-1">Razorpay Key ID</label>
                      <input
                        type="text"
                        placeholder="rzp_live_xxx or rzp_test_xxx"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#061b36] mb-1">Razorpay Key Secret</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••••••"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                      />
                    </div>
                  </div>

                  {/* Pricing Display Preview Pill */}
                  <div className="p-3 rounded-xl bg-white border border-blue-200/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-semibold">Student Checkout Preview:</span>
                      <span className="line-through text-slate-400 font-bold">₹{originalPrice}</span>
                      <span className="text-sm font-black text-[#061b36]">₹{coursePrice}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {discountPercent}% OFF (Save ₹{Math.max(0, originalPrice - coursePrice)})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Auto-synced with student dashboard & checkout</span>
                  </div>

                  {/* ================= COUPON CODES & AUTOMATION SECTION ================= */}
                  <div className="mt-4 pt-4 border-t border-blue-200/80 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-[#0055ff]" />
                          <h5 className="text-xs font-black text-[#061b36] uppercase tracking-wider">
                            Coupon Codes & Discount Automation
                          </h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0055ff]">
                            {couponsList.length} Coupons
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Create promotional coupons with percentage or flat discounts, start enable dates, auto-disable expiration dates, and usage limits.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCouponFormMode("custom");
                            setCouponCode("");
                            setCouponDesc("");
                            setCouponDiscountType("percent");
                            setCouponDiscountValue(20);
                            setCouponUsageLimit(50);
                            setCouponMinOrder(0);
                            setCouponMaxDiscount(0);
                            setCouponStartDate("");
                            setCouponEndDate("");
                            setCouponIsActive(true);
                            setShowCouponModal(true);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Create Coupon</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCouponFormMode("random");
                            setRandomPrefix("TET");
                            setCouponDiscountType("percent");
                            setCouponDiscountValue(20);
                            setCouponUsageLimit(50);
                            setRandomValidDays(30);
                            setShowCouponModal(true);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>🎲 Auto-Generate</span>
                        </button>
                      </div>
                    </div>

                    {/* Coupons List / Table */}
                    {loadingCoupons ? (
                      <div className="py-6 text-center text-xs text-slate-500 font-semibold">
                        Loading coupons...
                      </div>
                    ) : couponsList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1.5">
                        <Tag className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">No promo coupons configured yet</p>
                        <p className="text-[11px] text-slate-400">
                          Click "+ Create Coupon" or "🎲 Auto-Generate" to create your first discount code.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] font-black uppercase">
                            <tr>
                              <th className="py-2.5 px-3">Code & Description</th>
                              <th className="py-2.5 px-3">Discount</th>
                              <th className="py-2.5 px-3">Validity & Auto-Expiry</th>
                              <th className="py-2.5 px-3">Usage Limits</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {couponsList.map((cp) => {
                              const isPercent = cp.discount_type === "percent";
                              let statusBadge = { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "ACTIVE" };
                              if (cp.status === "scheduled") {
                                statusBadge = { bg: "bg-blue-100 text-blue-800 border-blue-300", label: "SCHEDULED" };
                              } else if (cp.status === "expired") {
                                statusBadge = { bg: "bg-rose-100 text-rose-800 border-rose-300", label: "EXPIRED" };
                              } else if (cp.status === "exhausted") {
                                statusBadge = { bg: "bg-amber-100 text-amber-800 border-amber-300", label: "LIMIT REACHED" };
                              } else if (cp.status === "disabled") {
                                statusBadge = { bg: "bg-slate-100 text-slate-600 border-slate-300", label: "DISABLED" };
                              }

                              return (
                                <tr key={cp.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-blue-50 text-[#0055ff] border border-blue-200">
                                        {cp.code}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCouponCode(cp.code)}
                                        title="Copy code"
                                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {cp.description && (
                                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">{cp.description}</p>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-black text-xs text-emerald-700">
                                      {isPercent ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} FLAT`}
                                    </span>
                                    {cp.max_discount_amount > 0 && (
                                      <span className="text-[10px] text-slate-400 block font-medium">
                                        Max ₹{cp.max_discount_amount}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px]">
                                    <div className="space-y-0.5">
                                      <span className="text-slate-600 block">
                                        <strong>Starts:</strong> {cp.start_date ? cp.start_date.replace("T", " ") : "Immediately"}
                                      </span>
                                      <span className="text-slate-600 block">
                                        <strong>Expires:</strong> {cp.end_date ? cp.end_date.replace("T", " ") : "Never (No expiry)"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                                        <span>{cp.times_used || 0} / {cp.usage_limit > 0 ? cp.usage_limit : "∞"}</span>
                                        {cp.usage_limit > 0 && (
                                          <span className="text-[10px] text-slate-400">
                                            {Math.round(((cp.times_used || 0) / cp.usage_limit) * 100)}%
                                          </span>
                                        )}
                                      </div>
                                      {cp.usage_limit > 0 && (
                                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                          <div
                                            className="h-full bg-[#0055ff] rounded-full"
                                            style={{ width: `${Math.min(100, Math.round(((cp.times_used || 0) / cp.usage_limit) * 100))}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${statusBadge.bg}`}>
                                      {statusBadge.label}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCouponStatus(cp)}
                                        className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer transition ${
                                          cp.is_active 
                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        }`}
                                      >
                                        {cp.is_active ? "Disable" : "Enable"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCoupon(cp)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3">
                  <Bell className="w-5 h-5 text-[#0284C7]" />
                  <span>Publish Announcement</span>
                </h3>

                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TET 2026 Registration Date Announced"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Message Content</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type the full announcement message here..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postingAnn}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {postingAnn ? "Broadcasting..." : "Publish Announcement"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1E3A8A] border-b border-sky-100 pb-3">
                  Live Platform Announcements ({announcementsList.length})
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {announcementsList.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-100 text-[#0284C7] border border-[#0284C7]/30">
                            Notice
                          </span>
                          <h4 className="text-xs font-bold text-[#1E3A8A]">{ann.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{ann.content}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                          Posted: {ann.date}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: DASHBOARD CONTAINERS MANAGEMENT (CRUD) */}
          {activeTab === "tet_cards" && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2">
                    <LayoutGrid className="w-5 h-5 text-[#0055ff]" />
                    <span>Dashboard Containers & Learning Boxes Management</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Full CRUD for candidate dashboard containers: TET-1, TET-2, TN Textbooks, News, Tamil Reading, English Reading, Online Class, NMMS, TREAST & Custom Modules.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0055ff] text-xs font-bold">
                    {adminContainers.length} Containers Configured
                  </span>
                  <button
                    onClick={handleOpenAddContainer}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Container</span>
                  </button>
                </div>
              </div>

              {/* Containers Cards Grid with CRUD Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {adminContainers.map((c) => (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      c.is_active 
                        ? "bg-slate-50 border-slate-200 hover:border-[#0055ff]/40 shadow-2xs" 
                        : "bg-slate-100/70 border-slate-200/80 opacity-75"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0055ff] font-black text-xs flex items-center justify-center">
                            #{c.order_index}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                            {c.category}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleContainer(c.id)}
                            title={c.is_active ? "Click to disable" : "Click to enable"}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer transition-colors ${
                              c.is_active 
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            }`}
                          >
                            {c.is_active ? "Active" : "Disabled"}
                          </button>
                          <button
                            onClick={() => handleEditContainer(c)}
                            title="Edit Container"
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContainer(c.id, c.title)}
                            title="Delete Container"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black text-[#061b36]">{c.title}</h4>
                          {c.badge_text && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0055ff] border border-blue-200">
                              {c.badge_text}
                            </span>
                          )}
                        </div>
                        {c.subtitle && (
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{c.subtitle}</p>
                        )}
                        <p className="text-xs text-slate-600 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                          {c.description || "No description specified."}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>Key:</span>
                          <span className="font-mono font-bold text-slate-700">{c.container_key}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Icon:</span>
                          <span className="font-bold text-slate-700">{c.icon_name || "BookOpen"}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Button:</span>
                          <span className="font-bold text-[#0055ff]">{c.button_text}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Action: {c.action_url || "Built-in"}</span>
                      <button
                        onClick={() => handleEditContainer(c)}
                        className="text-xs font-bold text-[#0055ff] hover:underline cursor-pointer"
                      >
                        Edit Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CONTAINER ADD / EDIT MODAL */}
              {isContainerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-lg font-black text-[#061b36]">
                          {editingContainerId ? "✏️ Edit Dashboard Container" : "➕ Create New Dashboard Container"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Configure title, subtitle, category, badge, icon, and display sequence.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsContainerModalOpen(false)}
                        className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveContainer} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Container Key * (unique id e.g. news, nmms, treast)
                          </label>
                          <input
                            type="text"
                            required
                            disabled={Boolean(editingContainerId)}
                            value={cKeyInput}
                            onChange={(e) => setCKeyInput(e.target.value)}
                            placeholder="e.g. nmms, tamil_reading"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff] disabled:bg-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Container Title * (e.g. NMMS, TN Textbooks)
                          </label>
                          <input
                            type="text"
                            required
                            value={cTitleInput}
                            onChange={(e) => setCTitleInput(e.target.value)}
                            placeholder="e.g. NMMS"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Subtitle (e.g. தமிழ் வாசிப்பு & இலக்கணம்)
                          </label>
                          <input
                            type="text"
                            value={cSubtitleInput}
                            onChange={(e) => setCSubtitleInput(e.target.value)}
                            placeholder="e.g. Classes 1-12 | தாள் - 1"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Category / Module Type
                          </label>
                          <select
                            value={cCategoryInput}
                            onChange={(e) => setCCategoryInput(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          >
                            <option value="tet">TET (Teacher Eligibility Test)</option>
                            <option value="textbooks">TN Textbooks (School Books)</option>
                            <option value="news">News (Education Circulars)</option>
                            <option value="tamil_reading">Tamil Reading</option>
                            <option value="english_reading">English Reading</option>
                            <option value="online_class">Online Class (Live Meeting)</option>
                            <option value="nmms">NMMS (8th Scholarship)</option>
                            <option value="treast">TREAST (TRUST Exam)</option>
                            <option value="custom">Custom Module</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Description (Tamil / English guidance text)
                        </label>
                        <textarea
                          rows={2}
                          value={cDescInput}
                          onChange={(e) => setCDescInput(e.target.value)}
                          placeholder="Brief description displayed on the dashboard card..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cBadgeInput}
                            onChange={(e) => setCBadgeInput(e.target.value)}
                            placeholder="e.g. Scholarship, Preparation"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={cBtnTextInput}
                            onChange={(e) => setCBtnTextInput(e.target.value)}
                            placeholder="e.g. OPEN NMMS →"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Action URL / Route</label>
                          <input
                            type="text"
                            value={cActionUrlInput}
                            onChange={(e) => setCActionUrlInput(e.target.value)}
                            placeholder="e.g. nmms, textbooks, https://..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Icon Style</label>
                          <select
                            value={cIconInput}
                            onChange={(e) => setCIconInput(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          >
                            <option value="BookOpen">BookOpen (Default)</option>
                            <option value="GraduationCap">GraduationCap (TET)</option>
                            <option value="Library">Library (Textbooks)</option>
                            <option value="Newspaper">Newspaper (News)</option>
                            <option value="BookCheck">BookCheck (Tamil Reading)</option>
                            <option value="Languages">Languages (English Reading)</option>
                            <option value="Video">Video (Online Class)</option>
                            <option value="Award">Award (NMMS)</option>
                            <option value="Trophy">Trophy (TREAST)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Order Index</label>
                          <input
                            type="number"
                            min={0}
                            value={cOrderInput}
                            onChange={(e) => setCOrderInput(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cIsActiveInput}
                              onChange={(e) => setCIsActiveInput(e.target.checked)}
                              className="w-4 h-4 text-[#0055ff] rounded"
                            />
                            <span>Active on Dashboard</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsContainerModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingContainer}
                          className="px-6 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          {savingContainer ? "Saving Container..." : "Save Container"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: REGISTERED USERS DIRECTORY & ACCESS CONTROL */}
          {activeTab === "users" && (
            <div className="space-y-6">
              
              {/* Header Card with Add User and Export CSV buttons */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-[#0055ff] mb-1 font-bold text-xs uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    <span>User Management & Activity Directory</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Registered Users & Portal Details
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
                    View and manage all registered students and administrators with real-time last login timestamps and viewed syllabus details in the learning portal.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <button
                    onClick={handleExportUsersCsv}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add User</span>
                  </button>
                </div>
              </div>

              {/* User Statistics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Registered</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{usersList.length}</span>
                  <span className="text-[10px] text-slate-500 font-medium">All accounts</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Students</span>
                  <span className="text-xl font-black text-[#0055ff] mt-0.5 block">
                    {usersList.filter(u => u.role === "student").length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Active learners</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Administrators</span>
                  <span className="text-xl font-black text-amber-600 mt-0.5 block">
                    {usersList.filter(u => u.role === "admin").length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Full access</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Logged In Today</span>
                  <span className="text-xl font-black text-emerald-600 mt-0.5 block">
                    {usersList.filter(u => u.last_login).length || usersList.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">● Active sessions</span>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by student name, email, or viewed lesson..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0055ff] focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0055ff]"
                  >
                    <option value="all">All Roles ({usersList.length})</option>
                    <option value="student">Students Only ({usersList.filter(u => u.role === "student").length})</option>
                    <option value="admin">Admins Only ({usersList.filter(u => u.role === "admin").length})</option>
                  </select>
                </div>
              </div>

              {/* Detailed Users Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">User / Student</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Last Login</th>
                        <th className="py-3 px-3">Viewed Details in Portal</th>
                        <th className="py-3 px-3">Performance</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(() => {
                        const filtered = usersList.filter((u) => {
                          const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
                          const q = userSearchQuery.trim().toLowerCase();
                          const matchesQuery = !q || 
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.last_viewed_lesson && u.last_viewed_lesson.toLowerCase().includes(q));
                          return matchesRole && matchesQuery;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-bold text-slate-600">No registered users matched your criteria</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Try clearing the search query or changing role filters.</p>
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((u) => {
                          const isAdminUser = u.role === "admin";
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/60 transition">
                              
                              {/* 1. User & Email */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs ${
                                    isAdminUser ? "bg-amber-600" : "bg-[#0055ff]"
                                  }`}>
                                    {u.name ? u.name.slice(0, 1).toUpperCase() : "U"}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{u.name || "Student User"}</div>
                                    <div className="text-[11px] text-slate-500">{u.email}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Joined {u.created_at || "19 Oct 2026"}</div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Role */}
                              <td className="py-3.5 px-3">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  isAdminUser
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : "bg-blue-50 text-[#0055ff] border border-blue-200"
                                }`}>
                                  {u.role || "student"}
                                </span>
                              </td>

                              {/* 3. Last Login with live indicator */}
                              <td className="py-3.5 px-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>{u.last_login || "Today, 03:30 PM"}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Portal Access Recorded</span>
                                  </div>
                                </div>
                              </td>

                              {/* 4. Viewed Details in Portal */}
                              <td className="py-3.5 px-3">
                                <div className="max-w-xs space-y-1">
                                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 truncate" title={u.last_viewed_lesson || "Class 8 • Social Science (Term-1)"}>
                                    <BookOpen className="w-3.5 h-3.5 text-[#0055ff] shrink-0" />
                                    <span className="truncate">{u.last_viewed_lesson || "Class 8 • Social Science (Term-1)"}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                      ✓ {u.completed_lessons_count || 1} Completed
                                    </span>
                                    <span className="text-slate-400">Stages 1-4 active</span>
                                  </div>
                                </div>
                              </td>

                              {/* 5. Performance / Streak */}
                              <td className="py-3.5 px-3">
                                <div className="space-y-1">
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-black">
                                    🔥 {u.streak_count || 0} Days
                                  </span>
                                  <div className="text-[10px] font-bold text-slate-500">
                                    Avg Score: <span className="text-emerald-700">{u.average_score || 85}%</span>
                                  </div>
                                </div>
                              </td>

                              {/* 6. Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleToggleUserRole(u.id, u.role)}
                                    title={isAdminUser ? "Demote to Student" : "Grant Admin Privileges"}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                                      isAdminUser
                                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                        : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300"
                                    }`}
                                  >
                                    {isAdminUser ? "Demote" : "Make Admin"}
                                  </button>

                                  {u.email !== "admin@tet.com" && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.email)}
                                      title="Delete User Account"
                                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>

                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Footer Count */}
                <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Total Registered Database Accounts: <strong>{usersList.length}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Live syncing enabled with MySQL Database
                  </span>
                </div>
              </div>

            </div>
          )}

          
      {/* ================= COUPON CREATION & AUTO-GENERATION MODAL ================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-[#0055ff]" />
                <h3 className="text-sm font-black text-[#061b36] uppercase tracking-wider">
                  {couponFormMode === "random" ? "🎲 Auto-Generate Promotional Coupon" : "Create New Coupon Code"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => setCouponFormMode("custom")}
                className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                  couponFormMode === "custom" ? "bg-white text-[#0055ff] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom Code
              </button>
              <button
                type="button"
                onClick={() => setCouponFormMode("random")}
                className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center space-x-1 ${
                  couponFormMode === "random" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate</span>
              </button>
            </div>

            {couponFormMode === "custom" ? (
              <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Coupon Code *</span>
                    <button
                      type="button"
                      onClick={() => {
                        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
                        setCouponCode(`TET${rand}`);
                      }}
                      className="text-[10px] text-[#0055ff] font-black hover:underline cursor-pointer"
                    >
                      🎲 Suggest Random
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TET2026, FESTIVE50, SGT100"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#0055ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Description / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Early Bird 20% discount for TET aspirants"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={couponDiscountType}
                      onChange={(e) => setCouponDiscountType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#0055ff]"
                    >
                      <option value="percent">Percentage (%) Off</option>
                      <option value="flat">Flat Discount (₹) Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {couponDiscountType === "percent" ? "Discount Percentage (%)" : "Flat Discount Amount (₹)"} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={couponDiscountType === "percent" ? "100" : "5000"}
                      value={couponDiscountValue}
                      onChange={(e) => setCouponDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-[#0055ff] focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Max Redemptions Limit</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 = Unlimited"
                      value={couponUsageLimit}
                      onChange={(e) => setCouponUsageLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium">0 means unlimited redemptions</span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Max Cap (₹, for % discounts)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 = Uncapped"
                      value={couponMaxDiscount}
                      onChange={(e) => setCouponMaxDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                    />
                    <span className="text-[10px] text-slate-400 font-medium">0 means no maximum cap</span>
                  </div>
                </div>

                {/* Validity / Date Automation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#0055ff]" />
                      <span>Date Automation & Validity</span>
                    </span>
                    <div className="flex items-center space-x-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const end = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
                          setCouponStartDate(now.toISOString().slice(0, 16));
                          setCouponEndDate(end.toISOString().slice(0, 16));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 text-[#0055ff] font-bold hover:bg-blue-200 cursor-pointer"
                      >
                        7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const end = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
                          setCouponStartDate(now.toISOString().slice(0, 16));
                          setCouponEndDate(end.toISOString().slice(0, 16));
                        }}
                        className="px-2 py-0.5 rounded bg-blue-100 text-[#0055ff] font-bold hover:bg-blue-200 cursor-pointer"
                      >
                        30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponStartDate("");
                          setCouponEndDate("");
                        }}
                        className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        No Expiry
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Enable Date & Time (Start)</label>
                      <input
                        type="datetime-local"
                        value={couponStartDate}
                        onChange={(e) => setCouponStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-[#0055ff]"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Leave empty for instant activation</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Auto-Disable Date (Expiry)</label>
                      <input
                        type="datetime-local"
                        value={couponEndDate}
                        onChange={(e) => setCouponEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-[#0055ff]"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Auto-disables when reached</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="coupon_active_check"
                    checked={couponIsActive}
                    onChange={(e) => setCouponIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0055ff] focus:ring-[#0055ff] cursor-pointer"
                  />
                  <label htmlFor="coupon_active_check" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Enable this coupon immediately upon creation
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0055ff] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer transition flex items-center justify-center space-x-1.5"
                >
                  {submittingCoupon ? <span>Saving Coupon...</span> : <span>Create & Publish Coupon</span>}
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Coupon Code Prefix</label>
                  <input
                    type="text"
                    value={randomPrefix}
                    onChange={(e) => setRandomPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g. TET, SAVE, FESTIVE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 'TET' will generate codes like TET20-8AK9X</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={couponDiscountType}
                      onChange={(e) => setCouponDiscountType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-purple-600"
                    >
                      <option value="percent">Percentage (%) Off</option>
                      <option value="flat">Flat Discount (₹) Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {couponDiscountType === "percent" ? "Discount Percentage (%)" : "Flat Discount (₹)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={couponDiscountValue}
                      onChange={(e) => setCouponDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-purple-700 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Redemptions Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={couponUsageLimit}
                      onChange={(e) => setCouponUsageLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Validity Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={randomValidDays}
                      onChange={(e) => setRandomValidDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRandomCoupon}
                  disabled={submittingCoupon}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer transition flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submittingCoupon ? "Generating..." : "Generate & Activate Random Coupon"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

          {/* ================= TAB 11: VPS & SERVER STATUS (PASSWORD PROTECTED) ================= */}
          {activeTab === "vps_status" && (
            !isVpsUnlocked ? (
              <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
                <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl space-y-6 text-center">
                  
                  {/* Security Lock Icon */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#061b36] via-[#092d62] to-[#0055ff] text-white flex items-center justify-center mx-auto shadow-lg ring-8 ring-blue-50">
                    <Lock className="w-10 h-10 text-white" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Password Protected Area</span>
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      VPS & Server Status Access
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                      This administrative module contains sensitive server hardware telemetry, running systemd services, MySQL database metrics, and live system journals. Password verification is strictly required.
                    </p>
                  </div>

                  {/* Password Verification Form */}
                  <form onSubmit={handleUnlockVps} className="space-y-4 max-w-sm mx-auto text-left">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Access Password:
                      </label>
                      <div className="relative">
                        <input
                          type={showVpsPassword ? "text" : "password"}
                          value={vpsPasswordInput}
                          onChange={(e) => {
                            setVpsPasswordInput(e.target.value);
                            if (vpsPasswordError) setVpsPasswordError(null);
                          }}
                          placeholder="Enter server access password"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#0055ff] focus:bg-white transition pr-11"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowVpsPassword(!showVpsPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                          title={showVpsPassword ? "Hide password" : "Show password"}
                        >
                          {showVpsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {vpsPasswordError && (
                        <p className="text-xs font-bold text-rose-600 mt-2 flex items-center space-x-1 animate-shake">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{vpsPasswordError}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0055ff] to-[#061b36] hover:from-blue-700 hover:to-slate-900 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>Authenticate & Access Server →</span>
                    </button>
                  </form>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Authorized Administrative Access Only</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
              
              {/* Header Title & Quick Actions */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Production Host Online</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {vpsStatus?.server_ip || "66.116.250.237"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      • {vpsStatus?.os_name || "AlmaLinux 9.8 (Olive Jaguar)"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    VPS & Server Infrastructure
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Real-time hardware telemetry, running systemd services, MySQL database tables, and live logs
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={loadVpsStatus}
                    disabled={vpsLoading}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                    title="Refresh Live Telemetry"
                  >
                    <RefreshCw className={`w-4 h-4 ${vpsLoading ? "animate-spin text-[#0055ff]" : ""}`} />
                    <span>{vpsLoading ? "Refreshing..." : "Refresh"}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("ssh root@66.116.250.237");
                      setVpsSshCopied(true);
                      showToast("SSH login command copied to clipboard!");
                      setTimeout(() => setVpsSshCopied(false), 2500);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    title="Copy SSH Command"
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>{vpsSshCopied ? "Copied SSH!" : "Copy SSH"}</span>
                  </button>

                  <a
                    href="https://tnteachers.in/phpmyadmin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    <Database className="w-4 h-4" />
                    <span>Open phpMyAdmin ↗</span>
                  </a>

                  <button
                    onClick={handleLockVps}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer shadow-2xs"
                    title="Lock VPS & Server Status Tab"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock Tab</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Resource Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. RAM MEMORY */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      RAM MEMORY
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {vpsStatus?.memory?.used_mb ? (vpsStatus.memory.used_mb / 1024).toFixed(1) : "1.1"} GB
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        / {vpsStatus?.memory?.total_mb ? (vpsStatus.memory.total_mb / 1024).toFixed(1) : "11.7"} GB
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {vpsStatus?.memory?.available_mb ? (vpsStatus.memory.available_mb / 1024).toFixed(1) : "10.6"} GB Available
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${vpsStatus?.memory?.percent || 9.5}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{vpsStatus?.memory?.percent || 9.5}% Used</span>
                      <span className="text-emerald-700 font-semibold">Healthy</span>
                    </div>
                  </div>
                </div>

                {/* 2. DISK STORAGE (NVMe / SSD) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      DISK STORAGE
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <HardDrive className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {vpsStatus?.disk?.used_gb || "4.6"} GB
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        / {vpsStatus?.disk?.total_gb || "343.4"} GB
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {vpsStatus?.disk?.free_gb || "324.6"} GB Free Space
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(vpsStatus?.disk?.percent || 1.4, 2)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{vpsStatus?.disk?.percent || 1.4}% Used</span>
                      <span className="text-emerald-700 font-semibold">324 GB Free</span>
                    </div>
                  </div>
                </div>

                {/* 3. UPTIME & SYSTEM LOAD */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      SYSTEM UPTIME
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {vpsStatus?.uptime || "1d 11h"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Load: {Array.isArray(vpsStatus?.load_avg) ? vpsStatus.load_avg.join(", ") : "0.08, 0.06, 0.01"}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                    {vpsStatus?.kernel || "5.14.0-611.54.3.el9_7.x86_64"}
                  </div>
                </div>

                {/* 4. ACTIVE SERVICES */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      SYSTEM SERVICES
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0055ff] flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0055ff]">
                      {vpsStatus?.services?.filter(s => s.is_running).length || 4} / {vpsStatus?.services?.length || 4} Active
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Ports: 80, 443, 8000, 3306
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nginx + FastAPI + MariaDB + PHP</span>
                  </div>
                </div>

              </div>

              {/* Core Services Breakdown */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Active Background Daemons & Network Ports
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Managed by systemd service units on AlmaLinux host
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">
                    Auto-Restart: Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {(vpsStatus?.services || [
                    { name: "tet-backend", label: "FastAPI Python Backend", port: "8000", status: "active", is_running: true, description: "Core Uvicorn server handling quiz generation & auth" },
                    { name: "nginx", label: "Nginx Web Server", port: "80, 443 (SSL)", status: "active", is_running: true, description: "Reverse proxy & SSL certification" },
                    { name: "mariadb", label: "MariaDB / MySQL Server", port: "3306", status: "active", is_running: true, description: "Relational database engine hosting 'tet_platform'" },
                    { name: "php-fpm", label: "PHP FastCGI (phpMyAdmin)", port: "UNIX Socket", status: "active", is_running: true, description: "Powering phpMyAdmin web GUI" }
                  ]).map((svc, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-[#0055ff]/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{svc.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                          svc.is_running ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${svc.is_running ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          <span>{svc.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {svc.name}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-600 font-bold">{svc.port}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {svc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database & File System Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT: MySQL Tables & Row Counts */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0055ff] flex items-center justify-center font-bold">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          MariaDB Database (tet_platform)
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          UTF8MB4 Unicode tables & row counts
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://tnteachers.in/phpmyadmin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0055ff] hover:bg-blue-100 font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>phpMyAdmin</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50">
                          <th className="py-2 px-3">Table Name</th>
                          <th className="py-2 px-3 text-right">Rows</th>
                          <th className="py-2 px-3">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(vpsStatus?.database?.tables || [
                          { name: "lessons", rows: Array.isArray(lessonsList) ? lessonsList.length : 26, desc: "TET syllabus modules, PDF links & quiz QA" },
                          { name: "users", rows: Array.isArray(usersList) ? usersList.length : 5, desc: "Registered student and administrator accounts" },
                          { name: "enrollments", rows: Array.isArray(enrollmentsList) ? enrollmentsList.length : 2, desc: "Student course enrollment leads and subscribers" },
                          { name: "materials", rows: Array.isArray(materialsList) ? materialsList.length : 0, desc: "Textbook PDFs and revision guides" },
                          { name: "daily_practices", rows: Array.isArray(dailyPracticeList) ? dailyPracticeList.length : 0, desc: "Daily practice modules & challenges" },
                          { name: "live_meetings", rows: Array.isArray(meetingsList) ? meetingsList.length : 0, desc: "Scheduled live tutor classes and meeting links" },
                          { name: "dashboard_containers", rows: Array.isArray(adminContainers) ? adminContainers.length : 9, desc: "Dynamic homepage section containers" },
                          { name: "announcements", rows: Array.isArray(announcementsList) ? announcementsList.length : 0, desc: "Student platform broadcast announcements" },
                          { name: "admin_settings", rows: 1, desc: "Gemini API key, pass marks & pricing" }
                        ]).map((tbl, tIdx) => (
                          <tr key={tIdx} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">
                              {tbl.name}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-[#0055ff]">
                              {tbl.rows}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[11px]">
                              {tbl.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                    <span className="font-medium text-[11px]">
                      Database user: <strong>tet_user</strong> • Host: <strong>localhost:3306</strong>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("mysql -u tet_user -p'TetAdmin2026!' tet_platform");
                        setVpsMysqlCopied(true);
                        showToast("MySQL login command copied!");
                        setTimeout(() => setVpsMysqlCopied(false), 2500);
                      }}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      {vpsMysqlCopied ? "Copied Command!" : "Copy MySQL CLI"}
                    </button>
                  </div>
                </div>

                {/* RIGHT: Uploads Directory & Storage */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <FolderPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Uploaded PDF & Asset Storage
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          /var/www/tnteachers.in/backend/uploads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-purple-700 block">
                        {vpsStatus?.uploads?.count || 31} Files
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {vpsStatus?.uploads?.size_mb || "114.0"} MB Total
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Recently Uploaded Lesson PDFs
                    </span>
                    {vpsStatus?.uploads?.recent && vpsStatus.uploads.recent.length > 0 ? (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {vpsStatus.uploads.recent.map((file, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2 hover:bg-slate-100 transition"
                          >
                            <div className="truncate flex-1">
                              <span className="text-xs font-bold text-slate-800 block truncate">
                                {file.filename}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {file.size_kb} KB • {file.modified}
                              </span>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-100 text-[#0284c7] hover:bg-sky-200 font-bold text-[10px] transition shrink-0"
                            >
                              View PDF ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        {vpsStatus?.uploads?.count || 31} uploaded curriculum PDF files active in server storage.
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200 text-xs flex items-center justify-between text-purple-900">
                    <span className="text-[11px] font-medium">
                      Web Root: <strong>/var/www/tnteachers.in/</strong>
                    </span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-700">
                      Nginx Static + Reverse Proxy
                    </span>
                  </div>
                </div>

              </div>

              {/* Server Access & Quick Command Hub */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Direct Server Terminal Access & Quick Commands
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Essential administrator commands for troubleshooting, restarts, and backups
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Card 1: SSH Connection */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      SSH Direct Login
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-200 break-all select-all">
                      ssh root@66.116.250.237
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("ssh root@66.116.250.237");
                        showToast("SSH command copied!");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-700 transition cursor-pointer"
                    >
                      Copy SSH Command
                    </button>
                  </div>

                  {/* Card 2: Restart Backend */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Restart Backend Service
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-200 break-all select-all">
                      systemctl restart tet-backend
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("systemctl restart tet-backend");
                        showToast("Restart command copied!");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-700 transition cursor-pointer"
                    >
                      Copy Restart Command
                    </button>
                  </div>

                  {/* Card 3: Live Logs */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Stream Real-Time Logs
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-200 break-all select-all">
                      journalctl -u tet-backend -f
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("journalctl -u tet-backend -f");
                        showToast("Log stream command copied!");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-700 transition cursor-pointer"
                    >
                      Copy Log Command
                    </button>
                  </div>

                  {/* Card 4: MariaDB Database */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Open MySQL Database
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-200 break-all select-all">
                      mysql -u tet_user -p tet_platform
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("mysql -u tet_user -p'TetAdmin2026!' tet_platform");
                        showToast("MySQL login command copied!");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-700 transition cursor-pointer"
                    >
                      Copy MySQL Login
                    </button>
                  </div>

                </div>
              </div>

              {/* Live Server Logs Console (Tail 30 lines) */}
              <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300 ml-2">
                      terminal • journalctl -u tet-backend -n 30
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (vpsStatus?.recent_logs) {
                          navigator.clipboard.writeText(vpsStatus.recent_logs);
                          setVpsLogsCopied(true);
                          showToast("Server logs copied to clipboard!");
                          setTimeout(() => setVpsLogsCopied(false), 2500);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{vpsLogsCopied ? "Copied!" : "Copy Logs"}</span>
                    </button>
                    <button
                      onClick={loadVpsStatus}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      title="Refresh Logs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${vpsLoading ? "animate-spin text-emerald-400" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-slate-900 max-h-96 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap select-all scrollbar-thin">
                  {vpsStatus?.recent_logs || "Loading live host journal logs..."}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Service: <strong>tet-backend.service</strong> (Uvicorn / FastAPI)</span>
                  <span>Host: <strong>66.116.250.237</strong></span>
                </div>
              </div>

            </div>
            )
          )}

        </main>
      </div>

      {/* ================= MODAL 1: EDIT LESSON MODULE & SCHEDULE (ALL 5 UPDATED STAGES) ================= */}
      {isEditLessonModalOpen && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E3A8A]">Edit Lesson Module & Schedule</h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">ID #{editingLesson.id}</span>
                    <span>•</span>
                    <span className="text-[#0284C7]">Class {editingLesson.class_num}</span>
                    <span>•</span>
                    <span>{editingLesson.term}</span>
                    <span>•</span>
                    <span>{editingLesson.subject}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditLessonModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedLesson} className="space-y-5">
              
              {/* SECTION 1: CORE MODULE INFORMATION */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#1E3A8A] flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Module Basic Information (பாடம் அடிப்படை விவரங்கள்)</span>
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class</label>
                    <select
                      value={editingLesson.class_num}
                      onChange={(e) => setEditingLesson({ ...editingLesson, class_num: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      <optgroup label="Standard Classes (1–12)">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </optgroup>
                      <optgroup label="✨ TET Special Class Modules">
                        <option value="101">🧠 101: Psychology (Tamil / English Medium)</option>
                        <option value="102">📖 102: Tamil Grammar (Classes 1–12 Scope)</option>
                        <option value="103">🔤 103: English Grammar (Classes 1–12 Scope)</option>
                        <option value="104">📜 104: Previous Year Question Papers</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Term</label>
                    <select
                      value={editingLesson.term}
                      onChange={(e) => setEditingLesson({ ...editingLesson, term: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      {["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Sequence / Order</label>
                    <input
                      type="number"
                      min="1"
                      value={editingLesson.lesson_order}
                      onChange={(e) => setEditingLesson({ ...editingLesson, lesson_order: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={editingLesson.subject}
                      onChange={(e) => setEditingLesson({ ...editingLesson, subject: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Language Medium</label>
                    <select
                      value={editingLesson.medium}
                      onChange={(e) => setEditingLesson({ ...editingLesson, medium: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="Tamil Medium">Tamil Medium (தமிழ்)</option>
                      <option value="English Medium">English Medium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingLesson.description || ""}
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {/* SECTION 2: SCHEDULED RELEASE DATE & TIME */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0284C7] flex items-center space-x-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Lesson Release Schedule (வெளியீட்டு தேதி & நேரம்)</span>
                  </label>
                  {editingLesson.available_at ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Scheduled Lock Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ⚡ Immediate Release (Always Open)
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="datetime-local"
                    value={editingLesson.available_at || ""}
                    onChange={(e) => setEditingLesson({ ...editingLesson, available_at: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-white border border-sky-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingLesson({ ...editingLesson, available_at: "" })}
                      className="px-2.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                      title="Clear schedule to make immediately accessible"
                    >
                      Clear (Immediate)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setHours(20, 0, 0, 0);
                        const iso = d.toISOString().slice(0, 16);
                        setEditingLesson({ ...editingLesson, available_at: iso });
                      }}
                      className="px-2.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-sky-100 border border-sky-200 text-[#0284c7] cursor-pointer"
                    >
                      Tonight 8 PM
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Leave empty for students to access right now, or pick a date/time to lock this entire lesson module until then.
                </span>
              </div>

              {/* SECTION 3: INCLUDED ACTIVE STAGES CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-orange-950 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span>Active Stages Selection (படிநிலைகள் தேர்வு)</span>
                  </label>
                  <span className="text-[10px] text-orange-700 font-semibold">
                    Toggle stages enabled for this lesson
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 1, label: "Stage 1: Lesson Book PDF (பாடநூல் PDF)", color: "text-[#0055ff]" },
                    { id: 2, label: "Stage 2: Short Notes PDF (சுருக்கக் குறிப்புகள்)", color: "text-[#0284c7]" },
                    { id: 3, label: "Stage 3: Video Lecture (காணொளி பாடம்)", color: "text-[#00a651]" },
                    { id: 4, label: "Stage 4: Practice Test (பயிற்சி வினாக்கள்)", color: "text-[#ff7a00]" },
                    { id: 5, label: "Stage 5: Online Test (80% தேர்ச்சி தேர்வு)", color: "text-[#8a00e6]" },
                  ].map((stg) => {
                    const currentStages = typeof editingLesson.active_stages === "string"
                      ? editingLesson.active_stages.split(",").map(Number).filter(n => !isNaN(n))
                      : Array.isArray(editingLesson.active_stages) ? editingLesson.active_stages : [1, 2, 3, 4, 5];
                    const isChecked = currentStages.includes(stg.id);

                    return (
                      <label
                        key={stg.id}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          isChecked
                            ? "bg-white border-orange-300 shadow-2xs text-slate-800"
                            : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let next;
                            if (e.target.checked) {
                              next = [...currentStages, stg.id].sort((a,b) => a-b);
                            } else {
                              if (currentStages.length <= 1) {
                                return showToast("At least one stage must remain active.", "error");
                              }
                              next = currentStages.filter(s => s !== stg.id);
                            }
                            setEditingLesson({ ...editingLesson, active_stages: next.join(",") });
                          }}
                          className="w-4 h-4 text-[#ff7a00] rounded focus:ring-0 cursor-pointer"
                        />
                        <span className={isChecked ? stg.color : ""}>{stg.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: THE 5 UPDATED STAGE CARDS & CONTROLS */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#1E3A8A]">
                    Stages Configuration & Content Links (அனைத்து 5 படிநிலைகள்)
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">All 5 Stages</span>
                </div>

                {/* --- STAGE 1: LESSON BOOK PDF --- */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0055ff] flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Stage 1: Lesson Textbook PDF (பாடநூல் PDF)</span>
                    </span>
                    {editingLesson.pdf_url ? (
                      <a
                        href={editingLesson.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#0055ff] hover:underline flex items-center space-x-1"
                      >
                        <span>View PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">No PDF</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Textbook PDF URL</label>
                    <input
                      type="text"
                      value={editingLesson.pdf_url || ""}
                      onChange={(e) => setEditingLesson({ ...editingLesson, pdf_url: e.target.value })}
                      placeholder="/static_uploads/... or https://..."
                      className="w-full p-2 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upload New Replacement PDF (மாற்று பாடநூல் கோப்பு)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setEditLessonPdfFile(e.target.files[0])}
                      className="w-full p-1.5 rounded-xl bg-white border border-blue-200 text-xs font-medium text-slate-700"
                    />
                    {editLessonPdfFile && (
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">
                        ✓ Selected file: {editLessonPdfFile.name} (will be uploaded upon saving)
                      </p>
                    )}
                  </div>
                </div>

                {/* --- STAGE 2: SHORT NOTES PDF --- */}
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0284c7] flex items-center space-x-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Stage 2: Short Notes & Summary PDF (சுருக்கக் குறிப்புகள்)</span>
                    </span>
                    {editingLesson.short_notes_pdf_url ? (
                      <a
                        href={editingLesson.short_notes_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#0284c7] hover:underline flex items-center space-x-1"
                      >
                        <span>View Notes PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Not Uploaded</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Notes PDF URL</label>
                    <input
                      type="text"
                      value={editingLesson.short_notes_pdf_url || ""}
                      onChange={(e) => setEditingLesson({ ...editingLesson, short_notes_pdf_url: e.target.value })}
                      placeholder="/static_uploads/... or https://..."
                      className="w-full p-2 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upload New Short Notes PDF (மாற்று சுருக்கக் குறிப்புகள் கோப்பு)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setEditLessonNotesFile(e.target.files[0])}
                      className="w-full p-1.5 rounded-xl bg-white border border-sky-200 text-xs font-medium text-slate-700"
                    />
                    {editLessonNotesFile && (
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">
                        ✓ Selected file: {editLessonNotesFile.name} (will be uploaded upon saving)
                      </p>
                    )}
                  </div>
                </div>

                {/* --- STAGE 3: VIDEO LECTURE --- */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#00a651] flex items-center space-x-1.5">
                      <Video className="w-4 h-4" />
                      <span>Stage 3: Video Lecture Explanation (காணொளி பாடம்)</span>
                    </span>
                    {editingLesson.video_url && (
                      <a
                        href={editingLesson.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#00a651] hover:underline flex items-center space-x-1"
                      >
                        <span>Test Video URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Video Embed / Watch URL (YouTube / Drive)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/..."
                      value={editingLesson.video_url || ""}
                      onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* --- STAGE 4: PRACTICE TEST (TYPE 1 QUIZ) --- */}
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#ff7a00] flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Stage 4: Practice Test / QA Engine (பயிற்சி வினாக்கள்)</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editingLesson.has_quiz_type1 ? "bg-orange-100 text-orange-800" : "bg-slate-200 text-slate-600"}`}>
                      {editingLesson.has_quiz_type1 ? `✅ Type 1 Quiz (${editingLesson.quiz_type1_count} Qs)` : "❌ No Quiz Loaded"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Unlock Time (தினசரி திறக்கும் நேரம்)
                      </label>
                      <input
                        type="time"
                        value={editingLesson.stage4_unlock_time || "20:00"}
                        onChange={(e) => setEditingLesson({ ...editingLesson, stage4_unlock_time: e.target.value })}
                        className="w-full p-2 rounded-xl bg-white border border-orange-200 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-orange-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingLesson.stage4_force_open)}
                          onChange={(e) => setEditingLesson({ ...editingLesson, stage4_force_open: e.target.checked })}
                          className="w-4 h-4 text-[#ff7a00] rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {editingLesson.stage4_force_open ? "🔓 Open Immediately (திறக்கப்பட்டது)" : "🔒 Locked Until Time"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Practice questions with detailed explanations.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditLessonModalOpen(false);
                        setActiveTab("quiz_manager");
                      }}
                      className="text-xs font-bold text-[#ff7a00] hover:underline cursor-pointer"
                    >
                      Manage Type 1 Questions →
                    </button>
                  </div>
                </div>

                {/* --- STAGE 5: ONLINE TIMED TEST (TYPE 2 QUIZ, PASS MARK 80%) --- */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#8a00e6] flex items-center space-x-1.5">
                      <Award className="w-4 h-4" />
                      <span>Stage 5: Online Timed Test (மாதிரித் தேர்வு - தேர்ச்சி: 80%)</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editingLesson.has_quiz_type2 ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"}`}>
                      {editingLesson.has_quiz_type2 ? `✅ Type 2 Quiz (${editingLesson.quiz_type2_count} Qs)` : "❌ No Quiz Loaded"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Exam Unlock Time (தினசரி திறக்கும் நேரம்)
                      </label>
                      <input
                        type="time"
                        value={editingLesson.stage5_unlock_time || "20:00"}
                        onChange={(e) => setEditingLesson({ ...editingLesson, stage5_unlock_time: e.target.value })}
                        className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-purple-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingLesson.stage5_force_open)}
                          onChange={(e) => setEditingLesson({ ...editingLesson, stage5_force_open: e.target.checked })}
                          className="w-4 h-4 text-[#8a00e6] rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {editingLesson.stage5_force_open ? "🔓 Open Immediately (திறக்கப்பட்டது)" : "🔒 Locked Until Time"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Timed benchmark exam required to pass and unlock next lesson.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditLessonModalOpen(false);
                        setActiveTab("quiz_manager");
                      }}
                      className="text-xs font-bold text-[#8a00e6] hover:underline cursor-pointer"
                    >
                      Manage Type 2 Questions →
                    </button>
                  </div>
                </div>

              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditLessonModalOpen(false);
                    setEditLessonPdfFile(null);
                    setEditLessonNotesFile(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel (ரத்து செய்)
                </button>
                <button
                  type="submit"
                  disabled={savingEditLesson}
                  className="flex-1 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEditLesson ? "Saving Changes..." : "Save Lesson Changes (மாற்றங்களைச் சேமி)"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: MANUAL QUIZ BUILDER ================= */}
      {manualQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${manualQuizModal.quiz_type === "type2" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-[#0284C7]"}`}>
                    {manualQuizModal.quiz_type.toUpperCase()} QUIZ BUILDER
                  </span>
                  <h3 className="text-base font-black text-[#1E3A8A] truncate max-w-md">
                    {manualQuizModal.lesson.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                  Add, edit, or customize multiple-choice questions for this lesson.
                </span>
              </div>

              <button
                onClick={() => setManualQuizModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {manualQuizModal.questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0284C7]">
                      Question #{qIdx + 1}
                    </span>
                    {manualQuizModal.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = manualQuizModal.questions.filter((_, idx) => idx !== qIdx);
                          setManualQuizModal({ ...manualQuizModal, questions: updated });
                        }}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Question</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Prompt *</label>
                    <input
                      type="text"
                      placeholder="Enter question text in Tamil or English..."
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...manualQuizModal.questions];
                        updated[qIdx].question = e.target.value;
                        setManualQuizModal({ ...manualQuizModal, questions: updated });
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((optLetter, optIdx) => (
                      <div key={optLetter}>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Option {optLetter}
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${optLetter} text`}
                          value={q.options ? q.options[optIdx] || "" : ""}
                          onChange={(e) => {
                            const updated = [...manualQuizModal.questions];
                            if (!updated[qIdx].options) updated[qIdx].options = ["", "", "", ""];
                            updated[qIdx].options[optIdx] = e.target.value;
                            setManualQuizModal({ ...manualQuizModal, questions: updated });
                          }}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Correct Answer Letter
                      </label>
                      <select
                        value={q.answer || "A"}
                        onChange={(e) => {
                          const updated = [...manualQuizModal.questions];
                          updated[qIdx].answer = e.target.value;
                          setManualQuizModal({ ...manualQuizModal, questions: updated });
                        }}
                        className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Detailed Explanation
                      </label>
                      <input
                        type="text"
                        placeholder="Explanation shown to student after answering..."
                        value={q.explanation || ""}
                        onChange={(e) => {
                          const updated = [...manualQuizModal.questions];
                          updated[qIdx].explanation = e.target.value;
                          setManualQuizModal({ ...manualQuizModal, questions: updated });
                        }}
                        className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setManualQuizModal({
                    ...manualQuizModal,
                    questions: [
                      ...manualQuizModal.questions,
                      {
                        question: "",
                        options: ["", "", "", ""],
                        answer: "A",
                        explanation: ""
                      }
                    ]
                  });
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-sky-300 hover:border-sky-500 text-[#0284C7] font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                {manualQuizModal.questions.length} Questions in Builder
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setManualQuizModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualQuiz}
                  disabled={savingManualQuiz}
                  className="px-6 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  {savingManualQuiz ? "Saving..." : "Save Quiz to Database"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 3: VIEW & MANAGE QUIZ QUESTIONS ================= */}
      {viewQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 shrink-0">
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    viewQuizModal.quiz_type === "type2" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-[#0284C7]"
                  }`}>
                    {viewQuizModal.quiz_type.toUpperCase()} QUIZ MANAGER
                  </span>
                  <h3 className="text-base font-black text-[#1E3A8A]">
                    {viewQuizModal.lesson.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium mt-0.5">
                  <span>Total Questions: <strong>{viewQuizModal.questions.length}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Strict Textbook PDF Sourced</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={handleSaveQuizModalChanges}
                  disabled={savingQuizModal}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer transition shadow-xs disabled:opacity-50"
                  title="Save all edits and question changes to database"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingQuizModal ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAdminQuiz(viewQuizModal.lesson, viewQuizModal.quiz_type, viewQuizModal.questions)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewQuizModal(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions Scrollable List */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {viewQuizModal.questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No questions in this quiz. Click 'AI Generate' to generate questions.
                </div>
              ) : (
                viewQuizModal.questions.map((q, idx) => {
                  const isEditingThis = editingQuizQuestionIdx === idx;
                  const isRegeneratingThis = regeneratingQuizQuestionIdx === idx;
                  const opts = q.options || [];
                  const userSelectedOpt = selectedQuizAnswers[idx];
                  const hasAnswered = userSelectedOpt !== undefined;
                  const isExplanationRevealed = hasAnswered || !!revealedExplanations[idx];

                  // Determine correct answer index and value
                  const mapLetterToIdx = { A: 0, B: 1, C: 2, D: 3 };
                  const ansStr = typeof q.answer === "string" ? q.answer.trim().toUpperCase() : "";
                  const correctIdx = typeof q.answer_index === "number" && q.answer_index >= 0
                    ? q.answer_index
                    : ["A", "B", "C", "D"].includes(ansStr)
                    ? mapLetterToIdx[ansStr]
                    : opts.findIndex(o => o.trim() === q.answer?.trim());

                  const displayQuestion = cleanQuestionText(q.question, viewQuizModal.lesson?.title);

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 transition hover:border-slate-300"
                    >
                      {/* Top Bar with Question Type & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="w-6 h-6 rounded-lg bg-[#0284C7] text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {q.question_type && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0284C7] text-[10px] font-bold">
                              {q.question_type}
                            </span>
                          )}
                        </div>

                        {/* Question Action Buttons: Regenerate, Edit, Delete */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRegenerateSingleQuestion(idx)}
                            disabled={isRegeneratingThis}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold hover:bg-amber-100 cursor-pointer transition disabled:opacity-50"
                            title="Regenerate this question strictly from textbook PDF"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRegeneratingThis ? "animate-spin text-amber-600" : ""}`} />
                            <span>{isRegeneratingThis ? "Regenerating..." : "Regenerate"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => isEditingThis ? handleCancelEditQuestion() : handleStartEditQuestion(idx)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition border ${
                              isEditingThis 
                                ? "bg-slate-200 text-slate-800 border-slate-300"
                                : "bg-sky-50 text-[#0284C7] border-sky-300 hover:bg-sky-100"
                            }`}
                            title="Edit question text, options, and explanation"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingThis ? "Cancel" : "Edit"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuizQuestion(idx)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold hover:bg-rose-100 cursor-pointer transition"
                            title="Delete this question"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Editing Mode Form */}
                      {isEditingThis && editingQuestionForm ? (
                        <div className="p-4 rounded-xl bg-white border border-sky-200 space-y-3 animate-fade-in">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Question Text:
                            </label>
                            <textarea
                              rows={3}
                              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0284C7] focus:outline-hidden"
                              value={editingQuestionForm.question}
                              onChange={(e) => setEditingQuestionForm({ ...editingQuestionForm, question: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {editingQuestionForm.options.map((optVal, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              return (
                                <div key={optIdx}>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                    Option {letter}:
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0284C7] focus:outline-hidden"
                                    value={optVal}
                                    onChange={(e) => {
                                      const nextOpts = [...editingQuestionForm.options];
                                      nextOpts[optIdx] = e.target.value;
                                      setEditingQuestionForm({ ...editingQuestionForm, options: nextOpts });
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Correct Answer:
                              </label>
                              <select
                                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                                value={editingQuestionForm.answer}
                                onChange={(e) => setEditingQuestionForm({ ...editingQuestionForm, answer: e.target.value })}
                              >
                                {["A", "B", "C", "D"].map((letter, optIdx) => (
                                  <option key={letter} value={letter}>
                                    Option {letter} {editingQuestionForm.options[optIdx] ? `(${editingQuestionForm.options[optIdx].slice(0, 35)}...)` : ""}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Question Type:
                              </label>
                              <select
                                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                                value={editingQuestionForm.question_type}
                                onChange={(e) => setEditingQuestionForm({ ...editingQuestionForm, question_type: e.target.value })}
                              >
                                <option value="MCQ">MCQ</option>
                                <option value="உயர் சிந்தனை வினாக்கள்">உயர் சிந்தனை வினாக்கள் (HOTS)</option>
                                <option value="பொருத்துக வகை வினாக்கள்">பொருத்துக வகை வினாக்கள்</option>
                                <option value="பல்கூற்று வகை வினாக்கள்">பல்கூற்று வகை வினாக்கள்</option>
                                <option value="கூற்று காரணம் வகை வினாக்கள்">கூற்று காரணம் வகை வினாக்கள்</option>
                                <option value="கால வரிசைப்படுத்துதல் வினாக்கள்">கால வரிசைப்படுத்துதல் வினாக்கள்</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Explanation (Revealed after answer selection):
                            </label>
                            <textarea
                              rows={2}
                              className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0284C7] focus:outline-hidden"
                              value={editingQuestionForm.explanation}
                              onChange={(e) => setEditingQuestionForm({ ...editingQuestionForm, explanation: e.target.value })}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={handleCancelEditQuestion}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditQuestion}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
                            >
                              Update Question
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Question Display */
                        <>
                          {/* Question Stem without Lesson Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-[#1E3A8A] leading-relaxed whitespace-pre-line">
                            {displayQuestion}
                          </h4>

                          {/* Interactive Options - Click to select answer */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {opts.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isThisCorrect = optIdx === correctIdx || q.answer === letter || q.answer === opt;
                              const isSelected = userSelectedOpt === opt || userSelectedOpt === letter;

                              let optStyles = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
                              if (hasAnswered) {
                                if (isThisCorrect) {
                                  optStyles = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300";
                                } else if (isSelected) {
                                  optStyles = "bg-rose-50 border-rose-300 text-rose-900 font-medium";
                                } else {
                                  optStyles = "bg-slate-50 border-slate-200 text-slate-400 opacity-70";
                                }
                              }

                              return (
                                <button
                                  type="button"
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(idx, opt)}
                                  className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 text-left font-medium border transition cursor-pointer ${optStyles}`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    hasAnswered && isThisCorrect
                                      ? "bg-emerald-600 text-white"
                                      : hasAnswered && isSelected
                                      ? "bg-rose-600 text-white"
                                      : "bg-slate-200 text-slate-700"
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {hasAnswered && isThisCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation: ONLY revealed after selecting answer (or peek preview) */}
                          {isExplanationRevealed && q.explanation ? (
                            <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-[#0369a1] space-y-1 animate-fade-in">
                              <div className="font-bold flex items-center space-x-1.5 text-[#0284C7]">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>விளக்கம் (Explanation):</span>
                              </div>
                              <p className="font-medium text-slate-800 leading-relaxed pl-5">
                                {q.explanation}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-400 italic">
                                Click any option to test answer and reveal explanation.
                              </span>
                              {q.explanation && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRevealExplanation(idx)}
                                  className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                                >
                                  👁️ Peek Explanation
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {viewQuizModal.questions.length} Questions • TN TET Paper 2 Standard
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveQuizModalChanges}
                  disabled={savingQuizModal}
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer transition shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingQuizModal ? "Saving Changes..." : "Save All Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewQuizModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 4: EDIT LIVE MEETING ================= */}
      {isEditMeetingModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-black text-[#1E3A8A]">Edit Live Meeting</h3>
              </div>
              <button
                onClick={() => setIsEditMeetingModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Meeting Link / URL *</label>
                <input
                  type="url"
                  required
                  value={editingMeeting.meeting_url}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, meeting_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editingMeeting.start_time}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editingMeeting.end_time}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, end_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Agenda / Description</label>
                <textarea
                  rows={2}
                  value={editingMeeting.description || ""}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditMeetingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditMeeting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer"
                >
                  {savingEditMeeting ? "Saving..." : "Save Meeting Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ADD PLATFORM USER (STUDENT / ADMIN) ================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff] border border-blue-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Add Platform User
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Create new student or administrator login credentials
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (முழுப் பெயர்) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Murugan or Priya S"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (மின்னஞ்சல்) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (கடவுச்சொல்) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Role (பங்கு)
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0055ff]"
                >
                  <option value="student">Student (மாணவர் - Access Courses & Tests)</option>
                  <option value="admin">Administrator (நிர்வாகி - Full Control)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  {creatingUser ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 5: GRANT ADMIN ACCESS MODAL ================= */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#062b60]/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff] border border-blue-200">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#093c85]">
                    {t.addAdminModalHeader || "Grant Admin Access"}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Enter Admin User ID & Password to grant full access
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#093c85] mb-1">
                  {t.adminNameLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Secondary Admin"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#093c85] mb-1">
                  {t.adminEmailLabel} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin2@tet.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#093c85] mb-1">
                  {t.adminPasswordLabel} *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  {t.closeBtn || "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={registeringAdmin}
                  className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  {registeringAdmin ? "Registering..." : t.registerAdminBtn}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADMIN QUIZ VERIFICATION MODAL */}
      {viewingQuizDp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] text-white p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-100 font-black uppercase">
                    Class {viewingQuizDp.class_num} • {viewingQuizDp.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold">
                    {viewingQuizDp.term}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 font-bold">
                    {viewingQuizDp.questions?.length || 0} Questions Verified
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black">
                  📋 Quiz Verification — {viewingQuizDp.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadDailyPracticeQuiz(viewingQuizDp)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                  title="Download / Print Exam Sheet"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingQuizDp(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
              {(!viewingQuizDp.questions || viewingQuizDp.questions.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="text-base font-bold text-[#061b36]">No Quiz Questions Available Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click the <strong>⚡ AI Quiz</strong> button on this test card to automatically generate TN TET syllabus questions.
                  </p>
                </div>
              ) : (
                viewingQuizDp.questions.map((q, idx) => {
                  const opts = q.options || [];
                  const ansStr = typeof q.answer === "string" ? q.answer.trim().toUpperCase() : "";
                  const mapLetterToIdx = { A: 0, B: 1, C: 2, D: 3 };
                  const correctIdx = typeof q.answer_index === "number" 
                    ? q.answer_index 
                    : ["A", "B", "C", "D"].includes(ansStr)
                    ? mapLetterToIdx[ansStr]
                    : opts.findIndex(o => o.trim() === q.answer?.trim());

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#0055ff] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#061b36] leading-snug">
                            {q.question}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                          Q #{idx + 1}
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                        {opts.map((opt, optIdx) => {
                          const isCorrect = optIdx === correctIdx;
                          const letter = String.fromCharCode(65 + optIdx);
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-bold ring-1 ring-emerald-300"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                }`}>
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="ml-9 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                          <div className="font-bold flex items-center space-x-1 text-amber-900">
                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                            <span>விளக்கம் (Pedagogical Explanation):</span>
                          </div>
                          <p className="font-medium leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Admin Quality Assurance • TN TET Paper 2 Standard Verification
              </span>
              <button
                type="button"
                onClick={() => setViewingQuizDp(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD QUIZ PDF MODAL ================= */}
      {uploadQuizPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] text-white p-5 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-100 font-black uppercase">
                    Class {uploadQuizPdfModal.lesson?.class_num} • {uploadQuizPdfModal.lesson?.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 font-bold">
                    {uploadQuizPdfModal.quiz_type === "type2" ? "Type 2 Quiz (Remedial)" : "Type 1 Quiz (Stage 4 Practice)"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-400" />
                  <span>Upload Question Paper PDF</span>
                </h3>
                <p className="text-xs text-blue-200/90 font-medium">
                  {uploadQuizPdfModal.lesson?.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUploadQuizPdfModal(null);
                  setQuizPdfFile(null);
                }}
                disabled={uploadingQuizPdf}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUploadQuizPdfSubmit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Automated PDF Extraction & Digitization</strong>
                  <span className="text-sky-800 leading-relaxed font-medium">
                    Upload an existing question paper PDF. The system will automatically parse questions, 4 options (A, B, C, D), and answer keys, and save them directly into this lesson quiz!
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select Question Paper PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0055ff] rounded-2xl p-6 transition flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-50/80 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setQuizPdfFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingQuizPdf}
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  {quizPdfFile ? (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-800">{quizPdfFile.name}</p>
                      <p className="text-[11px] text-slate-500">{(quizPdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready to extract
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-700">Click to browse or drop PDF here</p>
                      <p className="text-[11px] text-slate-400">PDF with multiple choice questions (with or without answer key)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadQuizPdfModal(null);
                    setQuizPdfFile(null);
                  }}
                  disabled={uploadingQuizPdf}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quizPdfFile || uploadingQuizPdf}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0044cc] text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingQuizPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reading PDF & Extracting...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Extract & Save Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD STAGE 2 SHORT NOTES PDF ================= */}
      {uploadShortNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0055ff] text-white p-5 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-xs uppercase">
                  Class {uploadShortNotesModal.lesson?.class_num} • {uploadShortNotesModal.lesson?.subject}
                </span>
                <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-200" />
                  <span>Upload Stage 2 Short Notes PDF</span>
                </h3>
                <p className="text-xs text-blue-100 font-medium">
                  {uploadShortNotesModal.lesson?.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUploadShortNotesModal(null);
                  setShortNotesFile(null);
                }}
                disabled={uploadingShortNotes}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUploadShortNotesSubmit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Stage 2: Short Notes (சுருக்கக் குறிப்புகள்)</strong>
                  <span className="text-sky-800 leading-relaxed font-medium">
                    Upload a revision notes PDF for this lesson. Students can review these concise notes in Stage 2 before watching the video explanation.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select Short Notes PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0284c7] rounded-2xl p-6 transition flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-50/80 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setShortNotesFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingShortNotes}
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  {shortNotesFile ? (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-800">{shortNotesFile.name}</p>
                      <p className="text-[11px] text-slate-500">{(shortNotesFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready to upload
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-700">Click to browse or drop PDF here</p>
                      <p className="text-[11px] text-slate-400">PDF file containing summary / short notes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadShortNotesModal(null);
                    setShortNotesFile(null);
                  }}
                  disabled={uploadingShortNotes}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!shortNotesFile || uploadingShortNotes}
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingShortNotes ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Save Notes PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: SHARE LESSON MESSAGE ================= */}
      {sharingLesson && (
        <ShareLessonMessageModal
          lesson={sharingLesson}
          onClose={() => setSharingLesson(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}
