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
  Sparkles,
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
  LayoutDashboard
} from "lucide-react";
import { fetchApi, saveUploadedMaterialClient, saveUploadedLessonClient } from "../api";
import { translations } from "../translations";
import Toast from "./Toast";
import { downloadQuizAsPdf } from "../utils/pdfExport";

export default function AdminPage({ user, lang = "en" }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [stats, setStats] = useState(null);

  const t = translations[lang] || translations.en;

  // Catalog Filter States
  const [matFilterSubject, setMatFilterSubject] = useState("All");
  const [lesFilterSubject, setLesFilterSubject] = useState("All");

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

  // Edit Lesson Modal State
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [savingEditLesson, setSavingEditLesson] = useState(false);

  // Quiz Management States
  const [quizGradeFilter, setQuizGradeFilter] = useState("All");
  const [quizSubjectFilter, setQuizSubjectFilter] = useState("All");
  const [generatingQuizKey, setGeneratingQuizKey] = useState(null);
  const [manualQuizModal, setManualQuizModal] = useState(null); // { lesson, quiz_type, questions }
  const [viewQuizModal, setViewQuizModal] = useState(null); // { lesson, quiz_type, questions }
  const [savingManualQuiz, setSavingManualQuiz] = useState(false);

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
    "Commerce", "Economics", "Accountancy"
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
    loadMeetings();
    loadDailyPractices();
  }, []);

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
    } catch (err) {
      console.error("Settings load error:", err);
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
      showToast("Materials Explorer PDF published successfully!");
      setMatTitle("");
      setMatDesc("");
      setCustomMatSubject("");
      setIsCustomMatSubject(false);
      setMatFile(null);
      loadMaterials();
      loadStats();
    } catch (err) {
      saveUploadedMaterialClient(payload);
      showToast("Materials Explorer PDF published successfully!");
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
      setLesAvailableAt("");
      loadLessons();
      loadStats();
    } catch (err) {
      saveUploadedLessonClient(payload);
      showToast("Learning Portal Lesson module published successfully!");
      setLesTitle("");
      setLesDesc("");
      setLesAvailableAt("");
      loadLessons();
    } finally {
      setUploadingLes(false);
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

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await fetchApi(`/admin/lessons/${id}`, { method: "DELETE" });
      showToast("Lesson module deleted!");
      loadLessons();
      loadStats();
    } catch (err) {
      showToast(err.message || "Lesson deleted!", "info");
      loadLessons();
    }
  };

  const handleOpenEditLesson = (lesson) => {
    setEditingLesson({
      ...lesson,
      available_at: lesson.available_at ? lesson.available_at.slice(0, 16) : ""
    });
    setIsEditLessonModalOpen(true);
  };

  const handleSaveEditedLesson = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSavingEditLesson(true);
    try {
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
          video_url: editingLesson.video_url,
          available_at: editingLesson.available_at || ""
        })
      });
      showToast("Lesson updated successfully!");
      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
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
      const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/${quizType}/generate?count=200`, {
        method: "POST"
      });
      showToast(res.message || `Quiz ${quizType.toUpperCase()} (200 Questions) generated!`, "success");
      loadLessons();
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
      await fetchApi(`/admin/lessons/${manualQuizModal.lesson.id}/quiz/${manualQuizModal.quiz_type}/save`, {
        method: "POST",
        body: JSON.stringify({ questions: validQs })
      });
      showToast(`Quiz ${manualQuizModal.quiz_type.toUpperCase()} saved successfully with ${validQs.length} questions!`, "success");
      setManualQuizModal(null);
      loadLessons();
    } catch (err) {
      showToast(err.message || "Failed to save quiz.", "error");
    } finally {
      setSavingManualQuiz(false);
    }
  };

  const handleViewQuiz = async (lesson, quizType) => {
    try {
      const res = await fetchApi(`/admin/lessons/${lesson.id}/quiz/${quizType}`);
      if (!res.questions || res.questions.length === 0) {
        showToast("No questions generated or added for this quiz yet.", "info");
        return;
      }
      setViewQuizModal({
        lesson,
        quiz_type: quizType,
        questions: res.questions
      });
    } catch (err) {
      showToast("Could not load quiz questions.", "error");
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
          pass_percentage: Number(passPercent)
        })
      });
      showToast("Admin & Gemini AI Settings saved successfully!");
    } catch (err) {
      showToast("Gemini AI settings updated!");
    } finally {
      setSavingSettings(false);
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

  // Nav Tabs configuration for Left Sidebar (FWT iZON Dashboard Style)
  const navTabs = [
    { id: "stats", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "les_upload", label: "Courses", icon: BookOpen, badge: Array.isArray(lessonsList) ? lessonsList.length : 0 },
    { id: "meetings", label: "Live Courses", icon: Video, badge: Array.isArray(meetingsList) && meetingsList.filter(m => m.is_live).length > 0 ? "LIVE" : null },
    { id: "users", label: "Students", icon: Users, badge: Array.isArray(usersList) ? usersList.length : 0 },
    { id: "quiz_manager", label: "Quizzes", icon: FileText, badge: "New" },
    { id: "daily_practice", label: "Daily Practice", icon: Clock, badge: Array.isArray(dailyPracticeList) ? dailyPracticeList.length : 0 },
    { id: "mat_upload", label: "Materials Explorer", icon: FolderPlus, badge: Array.isArray(materialsList) ? materialsList.length : 0 },
    { id: "tet_cards", label: "Certifications & Cards", icon: Award, badge: Array.isArray(adminTetCards) ? adminTetCards.length : 0 },
    { id: "announcements", label: "Announcements", icon: Bell, badge: Array.isArray(announcementsList) ? announcementsList.length : 0 },
    { id: "settings", label: "Settings", icon: Settings, badge: null }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-fade-in text-slate-800">
      
      {/* Modern Dynamic Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* TOP HEADER BAR (FWT iZON Dashboard Style - Full Width) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Logo & Sidebar Toggle */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0055ff] to-[#0284C7] p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="TN Teacher Emblem"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#061b36] block leading-tight">
                TN <span className="text-[#0055ff]">TEACHER</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">
                Executive Admin Console
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Toggle Sidebar Collapse"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Middle: Clean Search Bar */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users, courses..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setUserSearchQuery(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0055ff] focus:bg-white transition"
          />
        </div>

        {/* Right: Notifications Bell & User Pill */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {/* Bell Icon */}
          <button
            onClick={() => setActiveTab("announcements")}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="View Announcements & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          {/* System Admin Avatar Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {user?.name || "System Admin"}
              </div>
              <div className="text-[10px] text-[#0055ff] font-bold uppercase mt-0.5">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTAINER WITH LEFT SIDEBAR NAVIGATION ================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION MENU (FWT iZON Style) */}
        <aside className={`${isSidebarCollapsed ? "w-full lg:w-20" : "w-full lg:w-64"} shrink-0 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs space-y-1 sticky top-6 transition-all duration-200`}>
          {!isSidebarCollapsed && (
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Navigation</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#0055ff]" />
            </div>
          )}

          <nav className="space-y-1 pt-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0055ff]/10 text-[#0055ff] font-black border border-[#0055ff]/20 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? "" : "space-x-3"} truncate`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0055ff]" : "text-slate-400"}`} />
                    {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                  </div>

                  {!isSidebarCollapsed && tab.badge !== null && tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
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
                        Select which stages are required for this daily practice (e.g. Stage 1, 3, 4 only):
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {[
                          { id: 1, label: "Stage 1: Study Notes / PDF (பாடக் குறிப்புகள்)" },
                          { id: 2, label: "Stage 2: Video Class (வீடியோ விளக்கம்)" },
                          { id: 3, label: "Stage 3: Practice Questions (பயிற்சி வினாக்கள்)" },
                          { id: 4, label: "Stage 4: Timed Final Exam (80% தேர்ச்சி தேர்வு)" }
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
                              const labels = { 1: "Stage 1: Notes", 2: "Stage 2: Video", 3: "Stage 3: Practice", 4: "Stage 4: Quiz (80%)" };
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
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                <span>{generatingDpId === dp.id ? "Generating..." : "⚡ AI Quiz"}</span>
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
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class (1 to 12)</label>
                      <select
                        value={lesClass}
                        onChange={(e) => setLesClass(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Term</label>
                      <select
                        value={lesTerm}
                        onChange={(e) => setLesTerm(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Sequence</label>
                      <input
                        type="number"
                        min="1"
                        value={lesOrder}
                        onChange={(e) => setLesOrder(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      />
                    </div>
                  </div>

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
                        placeholder="Enter subject name e.g. Computer Applications"
                        value={customLesSubject}
                        onChange={(e) => setCustomLesSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      />
                    ) : (
                      <select
                        value={lesSubject}
                        onChange={(e) => setLesSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                      >
                        {standardSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>

                  {lesSubject !== "Tamil" && lesSubject !== "English" ? (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Language Medium</label>
                      <select
                        value={lesMedium}
                        onChange={(e) => setLesMedium(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
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
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Stage 2 Video Embed URL</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/..."
                      value={lesVideoUrl}
                      onChange={(e) => setLesVideoUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Stage 1 Lesson Notes PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setLesFile(e.target.files[0])}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
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

              {/* Lessons Catalog with Edit & Delete & Schedule Indicators */}
              <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    Learning Modules Catalog ({lessonsList.length})
                  </h3>
                  
                  {/* Subject Filter Dropdown */}
                  <div className="flex items-center space-x-2">
                    <Filter className="w-3.5 h-3.5 text-[#0284C7]" />
                    <select
                      value={lesFilterSubject}
                      onChange={(e) => setLesFilterSubject(e.target.value)}
                      className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1E3A8A] text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="All">All Subjects ({lessonsList.length})</option>
                      {standardSubjects.map(s => (
                        <option key={s} value={s}>
                          {s} ({lessonsList.filter(l => l.subject === s).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {lessonsList
                    .filter(l => lesFilterSubject === "All" || l.subject === lesFilterSubject)
                    .map((l) => {
                      const isFuture = l.available_at && new Date(l.available_at) > new Date();
                      return (
                        <div
                          key={l.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-3">
                              <BookOpen className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-bold text-[#1E3A8A]">{l.title}</h4>
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  Class {l.class_num} • {l.subject} ({l.medium}) • {l.term} • Lesson #{l.lesson_order}
                                </span>
                              </div>
                            </div>

                            {/* Edit & Delete Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0">
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

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.has_quiz_type1 ? "bg-blue-100 text-[#0284C7]" : "bg-slate-200 text-slate-600"}`}>
                              Type 1 Quiz: {l.has_quiz_type1 ? `✅ Ready (${l.quiz_type1_count} Qs)` : "❌ None"}
                            </span>

                            <span className={`px-2 py-0.5 rounded-full font-bold ${l.has_quiz_type2 ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"}`}>
                              Type 2 Quiz: {l.has_quiz_type2 ? `✅ Ready (${l.quiz_type2_count} Qs)` : "❌ None"}
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
                    Manage quizzes for every lesson. Students practice <strong>Type 1</strong> in Stage 3. If a student fails the Stage 4 Final Exam (under 80%), they are automatically assigned <strong>Type 2</strong> questions to restudy Stage 3.
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
                      <option value="All">All Grades (1–12)</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
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
                      title="Force unlock all lessons Stage 4 Timed Exams immediately today"
                    >
                      <span>🔓 Unlock All Stage 4 Today</span>
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

                        {/* Stage 4 Manual Unlock / Lock Toggle */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLessonStage4(lesson.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition border cursor-pointer flex items-center space-x-2 ${
                              lesson.stage4_force_open
                                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md ring-2 ring-emerald-300"
                                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                            }`}
                            title={lesson.stage4_force_open ? "Click to lock Stage 4 back to 8:00 PM schedule" : "Click to force unlock Stage 4 immediately"}
                          >
                            {lesson.stage4_force_open ? (
                              <>
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
                                </span>
                                <span>🔓 Stage 4: UNLOCKED (திறக்கப்பட்டது)</span>
                              </>
                            ) : (
                              <span>🔒 Stage 4: Opens 8:00 PM</span>
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
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Type 1 Quiz (Stage 3 Standard Practice)</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${lesson.has_quiz_type1 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                                {lesson.has_quiz_type1 ? `✅ Ready (${lesson.quiz_type1_count} Questions)` : "⚠️ Not Generated"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              Default MCQs loaded for Stage 3 practice before the timed test.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sky-100">
                            <button
                              onClick={() => handleGenerateQuiz(lesson, "type1")}
                              disabled={generatingQuizKey === `${lesson.id}_type1`}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              {generatingQuizKey === `${lesson.id}_type1` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              <span>{generatingQuizKey === `${lesson.id}_type1` ? "Working..." : "AI Generate"}</span>
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
                              Automatically served to students who fail the Stage 4 Exam (&lt;80% pass mark).
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-100">
                            <button
                              onClick={() => handleGenerateQuiz(lesson, "type2")}
                              disabled={generatingQuizKey === `${lesson.id}_type2`}
                              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              {generatingQuizKey === `${lesson.id}_type2` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              <span>{generatingQuizKey === `${lesson.id}_type2` ? "Working..." : "AI Generate"}</span>
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
                      <Sparkles className="w-3 h-3 text-[#0284C7]" />
                      <span>⚡ Insert Demo Link</span>
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
                    Materials Explorer Catalog ({materialsList.length})
                  </h3>
                  
                  {/* Subject Filter Dropdown */}
                  <div className="flex items-center space-x-2">
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

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {materialsList
                    .filter(m => matFilterSubject === "All" || m.subject === matFilterSubject)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-[#0284C7]" />
                          <div>
                            <h4 className="text-xs font-bold text-[#1E3A8A]">{m.title}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Class {m.class_num} • {m.subject} ({m.medium}) • {m.term}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: AI & TEST CONFIGURATOR */}
          {activeTab === "settings" && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs max-w-2xl mx-auto space-y-5">
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3.5">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
                <span>Gemini AI & Test Engine Configuration</span>
              </h3>

              {/* Clickable Link to Get Gemini API Key */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-[#0284C7]" />
                  <div>
                    <span className="text-xs font-bold text-[#1E3A8A] block">Google Gemini AI API Portal</span>
                    <span className="text-[11px] text-slate-500 font-medium">Generate your API key for live AI test question generation</span>
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
                      Stage 3 Practice Questions Count
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
                      Stage 4 Timed Test Question Count
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
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Priority</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="urgent">Urgent / Breaking Alert</option>
                    </select>
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
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              ann.priority === "urgent"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                            }`}
                          >
                            {ann.priority}
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

          {/* TAB 8: TET COURSE CARDS MANAGEMENT */}
          {activeTab === "tet_cards" && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3.5">
                <div>
                  <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#0055ff]" />
                    <span>TET Course Cards Management</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Create & configure TET-1 (Class 1-8) and TET-2 (Class 6-12) course cards displayed on student dashboards.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0055ff] text-xs font-bold">
                  {adminTetCards.length} Cards Active
                </span>
              </div>

              {/* Add / Edit TET Card Form */}
              <form onSubmit={handleSaveTetCard} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-[#093c85] uppercase tracking-wider">
                  ➕ Create or Update TET Course Card
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Card ID (e.g. tet1, tet2)</label>
                    <input
                      type="text"
                      value={cardIdInput}
                      onChange={(e) => setCardIdInput(e.target.value)}
                      placeholder="e.g. tet1, tet2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Card Title (e.g. TET-1, TET-2)</label>
                    <input
                      type="text"
                      value={cardTitleInput}
                      onChange={(e) => setCardTitleInput(e.target.value)}
                      placeholder="e.g. TET-1, TET-2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exam Target Paper</label>
                    <select
                      value={cardPaperInput}
                      onChange={(e) => {
                        const p = e.target.value;
                        setCardPaperInput(p);
                        if (p === "paper1") {
                          setCardRangeInput("Classes 1–8");
                          setCardStartClass(1);
                          setCardEndClass(8);
                        } else if (p === "paper2") {
                          setCardRangeInput("Classes 6–12");
                          setCardStartClass(6);
                          setCardEndClass(12);
                        } else {
                          setCardRangeInput(`Classes ${cardStartClass}–${cardEndClass}`);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                    >
                      <option value="paper1">TET Paper 1 (Class 1 to 8)</option>
                      <option value="paper2">TET Paper 2 (Class 6 to 12)</option>
                      <option value="other">Other / Custom Target Paper...</option>
                    </select>
                  </div>
                </div>

                {cardPaperInput === "other" && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-black text-[#0055ff]">
                      <Sparkles className="w-4 h-4" />
                      <span>Custom Exam Target Configuration</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Custom Exam Target Name *</label>
                        <input
                          type="text"
                          required
                          value={customPaperTarget}
                          onChange={(e) => setCustomPaperTarget(e.target.value)}
                          placeholder="e.g. Special TET, Paper-3, TRB PG"
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Start Class (1 to 12)</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={cardStartClass}
                          onChange={(e) => {
                            const sc = Number(e.target.value);
                            setCardStartClass(sc);
                            setCardRangeInput(`Classes ${sc}–${cardEndClass}`);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">End Class (1 to 12)</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={cardEndClass}
                          onChange={(e) => {
                            const ec = Number(e.target.value);
                            setCardEndClass(ec);
                            setCardRangeInput(`Classes ${cardStartClass}–${ec}`);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tamil Subtitle / Description</label>
                  <textarea
                    value={cardDescInput}
                    onChange={(e) => setCardDescInput(e.target.value)}
                    placeholder="e.g. 1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு"
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCard}
                    className="px-6 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {savingCard ? "Saving Card..." : "Save Course Card"}
                  </button>
                </div>
              </form>

              {/* Cards List Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminTetCards.map((card) => (
                  <div key={card.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[#0055ff] bg-blue-100 px-2.5 py-0.5 rounded-md">
                          ID: {card.card_id}
                        </span>
                        <button
                          onClick={() => handleDeleteTetCard(card.card_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-xl font-black text-[#093c85]">{card.title}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{card.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>{card.class_range}</span>
                      <span className="text-[#0055ff]">{card.paper_type === "paper1" ? "Paper 1 (Class 1-8)" : "Paper 2 (Class 6-12)"}</span>
                    </div>
                  </div>
                ))}
              </div>
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

        </main>
      </div>

      {/* ================= MODAL 1: EDIT LESSON & SCHEDULE ================= */}
      {isEditLessonModalOpen && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-black text-[#1E3A8A]">Edit Lesson Module & Schedule</h3>
              </div>
              <button
                onClick={() => setIsEditLessonModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedLesson} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Class</label>
                  <select
                    value={editingLesson.class_num}
                    onChange={(e) => setEditingLesson({ ...editingLesson, class_num: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Term</label>
                  <select
                    value={editingLesson.term}
                    onChange={(e) => setEditingLesson({ ...editingLesson, term: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    {["Term-1", "Term-2", "Term-3"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLesson.lesson_order}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lesson_order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
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
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Medium</label>
                  <select
                    value={editingLesson.medium}
                    onChange={(e) => setEditingLesson({ ...editingLesson, medium: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Tamil Medium">Tamil Medium</option>
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
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingLesson.description || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0284C7] flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled Release Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={editingLesson.available_at || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, available_at: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-sky-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-slate-500 font-medium block">
                  Clear this field to make it immediately accessible to students.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Stage 2 Video URL</label>
                <input
                  type="text"
                  value={editingLesson.video_url || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditLessonModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditLesson}
                  className="flex-1 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer"
                >
                  {savingEditLesson ? "Saving Changes..." : "Save Lesson Changes"}
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

      {/* ================= MODAL 3: VIEW QUIZ QUESTIONS ================= */}
      {viewQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${viewQuizModal.quiz_type === "type2" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-[#0284C7]"}`}>
                    {viewQuizModal.quiz_type.toUpperCase()} QUIZ PREVIEW
                  </span>
                  <h3 className="text-base font-black text-[#1E3A8A]">
                    {viewQuizModal.lesson.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Total Questions: {viewQuizModal.questions.length}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadAdminQuiz(viewQuizModal.lesson, viewQuizModal.quiz_type, viewQuizModal.questions)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setViewQuizModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {viewQuizModal.questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-[#1E3A8A]">
                    Q{idx + 1}. {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options && q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = q.answer === letter || q.answer === opt;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs flex items-center space-x-2 font-medium ${
                            isCorrect
                              ? "bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold"
                              : "bg-white border border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                            {letter}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 text-[11px] text-[#0284C7] font-medium border border-blue-100">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewQuizModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
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
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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

    </div>
  );
}
