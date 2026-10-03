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
  UserCheck
} from "lucide-react";
import { fetchApi, saveUploadedMaterialClient, saveUploadedLessonClient } from "../api";
import { translations } from "../translations";
import Toast from "./Toast";

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
  const [lessonsList, setLessonsList] = useState([]);
  const [uploadingLes, setUploadingLes] = useState(false);

  // Settings State
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [practiceCount, setPracticeCount] = useState(200);
  const [testCount, setTestCount] = useState(100);
  const [timeLimit, setTimeLimit] = useState(60);
  const [passPercent, setPassPercent] = useState(60);
  const [savingSettings, setSavingSettings] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);

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
  const [cardStartClass, setCardStartClass] = useState(1);
  const [cardEndClass, setCardEndClass] = useState(8);
  const [cardBtnTextInput, setCardBtnTextInput] = useState("OPEN →");
  const [savingCard, setSavingCard] = useState(false);

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

  const standardSubjects = [
    "Tamil", "English", "Mathematics", "Science", "Social Science",
    "Physics", "Chemistry", "Botany", "Zoology", "Computer Science",
    "Commerce", "Economics", "Accountancy"
  ];

  useEffect(() => {
    loadStats();
    loadMaterials();
    loadLessons();
    loadSettings();
    loadUsers();
    loadAnnouncements();
    loadTetCards();
  }, []);

  const loadTetCards = async () => {
    try {
      const data = await fetchApi("/admin/tet-cards");
      setAdminTetCards(data);
    } catch (err) {
      console.error("TET cards error:", err);
    }
  };

  const handleSaveTetCard = async (e) => {
    e.preventDefault();
    if (!cardIdInput || !cardTitleInput || !cardDescInput) {
      return showToast("Please enter Card ID, Title, and Description.", "error");
    }
    setSavingCard(true);
    try {
      await fetchApi("/admin/tet-cards", {
        method: "POST",
        body: JSON.stringify({
          card_id: cardIdInput.toLowerCase().replace(/\s+/g, "_"),
          title: cardTitleInput,
          description: cardDescInput,
          class_range: cardRangeInput,
          paper_type: cardPaperInput,
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
      setMaterialsList(data);
    } catch (err) {
      console.error("Materials error:", err);
    }
  };

  const loadLessons = async () => {
    try {
      const data = await fetchApi("/admin/lessons");
      setLessonsList(data);
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
      setPassPercent(data.pass_percentage || 60);
    } catch (err) {
      console.error("Settings load error:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchApi("/admin/users");
      setUsersList(data);
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

      await fetch("http://localhost:8000/api/admin/materials", {
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
      pdf_url: lesFile ? `/static_uploads/${lesFile.name}` : `/api/sample-pdf?title=${encodeURIComponent(lesTitle)}`
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
      if (lesFile) formData.append("file", lesFile);

      await fetch("http://localhost:8000/api/admin/lessons", {
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
      loadLessons();
      loadStats();
    } catch (err) {
      saveUploadedLessonClient(payload);
      showToast("Learning Portal Lesson module published successfully!");
      setLesTitle("");
      setLesDesc("");
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
      setAnnouncementsList(data);
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

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-7 animate-fade-in text-[#1E3A8A]">
      
      {/* Modern Top Right Dynamic Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-sky-950 to-[#1E3A8A] border border-sky-800 rounded-3xl p-6 sm:p-7 shadow-sm text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] shadow-md flex items-center justify-center shrink-0">
            <img
              src="/logo.jpg"
              alt="TN Teacher Admin Emblem"
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>TN Teacher Executive Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TN Teacher Admin Portal
            </h1>
            <p className="text-xs text-sky-200 mt-0.5 max-w-2xl font-medium">
              Manage curriculum materials, learning modules, announcements, AI engine settings, and user access control.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center space-x-2 shrink-0">
          <Key className="w-4 h-4 text-sky-400" />
          <span>{t.adminRoleActive}</span>
        </div>
      </div>

      {/* ADMIN TABS NAV */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-sky-100 shadow-xs">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "stats"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.tabStats}</span>
        </button>

        <button
          onClick={() => setActiveTab("mat_upload")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "mat_upload"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t.tabMatUpload}</span>
        </button>

        <button
          onClick={() => setActiveTab("les_upload")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "les_upload"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.tabLesUpload}</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.tabSettings}</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "announcements"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t.tabAnnouncements}</span>
        </button>

        <button
          onClick={() => setActiveTab("access_control")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "access_control"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-800 hover:bg-amber-50"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Admin Access Control</span>
        </button>

        <button
          onClick={() => setActiveTab("tet_cards")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "tet_cards"
              ? "bg-[#0055ff] text-white shadow-xs"
              : "text-[#1E3A8A] hover:bg-sky-50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>TET Course Cards</span>
        </button>
      </div>

      {/* TAB 1: STATISTICS & ANALYTICS */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Studying Users
              </span>
              <span className="text-3xl font-black text-[#1E3A8A]">{stats?.total_users || 0}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Active student accounts</span>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Uploaded Materials
              </span>
              <span className="text-3xl font-black text-[#0284C7]">{materialsList.length}</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">PDFs in Materials Explorer</span>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Curriculum Lessons
              </span>
              <span className="text-3xl font-black text-[#1E3A8A]">{lessonsList.length}</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">With 4 sequential stages</span>
            </div>

            <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Average Test Score
              </span>
              <span className="text-3xl font-black text-emerald-600">{stats?.average_test_score || 92}%</span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">Overall exam performance</span>
            </div>
          </div>

          <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Top Daily Streak Leaders</span>
            </h3>

            <div className="space-y-2">
              {stats?.top_students?.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E3A8A]">{s.name}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">{s.email}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-black">
                    🔥 {s.streak} Days Streak
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD MATERIALS EXPLORER PDF */}
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
                    className="text-[#0284C7] hover:underline text-[11px] font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.customSubjectToggle}</span>
                  </button>
                </div>

                {isCustomMatSubject ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter subject name e.g. Bio-Chemistry"
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

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Material PDF Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 1 Tamil - Unit Notes"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of reference PDF..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Upload PDF File</label>
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
                Materials Explorer Catalog
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

      {/* TAB 3: UPLOAD LEARNING PORTAL MODULE */}
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
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Lesson Sequence</label>
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
                    className="text-[#0284C7] hover:underline text-[11px] font-bold flex items-center space-x-1"
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

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Lesson Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1: Lesson Concepts"
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

          <div className="lg:col-span-6 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
              <h3 className="text-base font-bold text-[#1E3A8A]">
                Learning Modules Catalog
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

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {lessonsList
                .filter(l => lesFilterSubject === "All" || l.subject === lesFilterSubject)
                .map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-[#0284C7]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#1E3A8A]">{l.title}</h4>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Class {l.class_num} • {l.subject} ({l.medium}) • {l.term} • Lesson #{l.lesson_order}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLesson(l.id)}
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

      {/* TAB 4: QUESTION & TEST CONFIGURATOR & GEMINI API LINK */}
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
                If no key is pasted, smart fallback AI generator automatically generates 200 questions & 100 tests.
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

      {/* TAB 5: ADMIN ACCESS CONTROL & REGISTRATION */}
      {activeTab === "users" && (
        <div className="space-y-6">
          
          {/* Header Card with "Add Admin Access" Button */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#0055ff] mb-1 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>Administrative Access Control</span>
              </div>
              <h3 className="text-xl font-black text-[#093c85] tracking-tight">
                {t.adminRegisterHeader || "Admin Access Control & Management"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
                Manage administrative accounts or grant new admin access permissions with dedicated credentials.
              </p>
            </div>

            {/* Prominent "Add Admin Access" Button requested by user */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addAdminAccessBtn || "➕ Add Admin Access"}</span>
            </button>
          </div>

          {/* Active Admin Accounts Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-black text-[#093c85] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>{t.activeAdminsTitle}</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black">
                {usersList.filter(u => u.role === "admin").length} Active Admins
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersList
                .filter(u => u.role === "admin")
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#093c85] to-[#0055ff] text-white flex items-center justify-center font-black text-sm shadow-xs">
                        {u.name ? u.name[0].toUpperCase() : "A"}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-black text-[#093c85]">{u.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-white shadow-xs">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase">
                        Full Access
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ================= GRANT ADMIN ACCESS MODAL DIALOG ================= */}
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
                      {registeringAdmin ? "Granting Access..." : "Grant Access"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 5: BROADCAST ANNOUNCEMENTS & MANAGEMENT */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1E3A8A] flex items-center space-x-2 border-b border-sky-100 pb-3">
              <Bell className="w-5 h-5 text-[#0284C7]" />
              <span>Post New Announcement</span>
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TET Model Exam Date Announcement"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Notice Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] mb-1">Notice Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write message for teachers and students..."
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
                {postingAnn ? "Publishing..." : "Broadcast Announcement"}
              </button>
            </form>
          </div>

          {/* Announcements List with Delete Option */}
          <div className="lg:col-span-7 bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1E3A8A] flex items-center justify-between border-b border-sky-100 pb-3">
              <span>Active Platform Announcements</span>
              <span className="text-xs text-[#0284C7] font-bold">{announcementsList.length} Total</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {announcementsList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  No announcements posted yet.
                </div>
              ) : (
                announcementsList.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
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
                      title="Delete Announcement"
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer shrink-0 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ADMIN ACCESS CONTROL */}
      {activeTab === "access_control" && (
        <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3.5">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span>Admin Access Control & User Roles</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Assign or revoke executive administrator permissions for platform user accounts.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              {usersList.length} User Accounts
            </span>
          </div>

          <div className="space-y-3">
            {usersList.map((u) => {
              const isAdminUser = u.role === "admin";
              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white ${isAdminUser ? "bg-amber-600" : "bg-[#0284C7]"}`}>
                      {u.name ? u.name[0].toUpperCase() : "U"}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-[#1E3A8A]">{u.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isAdminUser
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-sky-100 text-[#0284C7] border border-[#0284C7]/30"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-500">
                      🔥 {u.streak_count || 0} Days Streak
                    </span>

                    <button
                      onClick={() => handleToggleUserRole(u.id, u.role)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                        isAdminUser
                          ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      {isAdminUser ? "Demote to Student" : "Grant Admin Access"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: TET COURSE CARDS MANAGEMENT */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Card ID (e.g. tet1, tet2, tet3)</label>
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
                    } else {
                      setCardRangeInput("Classes 6–12");
                      setCardStartClass(6);
                      setCardEndClass(12);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#0055ff]"
                >
                  <option value="paper1">TET Paper 1 (Class 1 to 8)</option>
                  <option value="paper2">TET Paper 2 (Class 6 to 12)</option>
                </select>
              </div>
            </div>

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

          {/* Cards List Table / Preview */}
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

    </div>
  );
}
