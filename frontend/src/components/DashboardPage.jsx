import React, { useState, useEffect } from "react";
import { 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Bell, 
  Calendar, 
  Globe, 
  FileText, 
  Clock, 
  Trophy, 
  FileCheck,
  HelpCircle,
  Download,
  GraduationCap,
  Library,
  Newspaper,
  BookCheck,
  Languages,
  Video,
  Award,
  ExternalLink,
  X,
  Play,
  Radio,
  Layers,
  ChevronRight,
  Tv,
  Check,
  Share2,
  Lock,
  Smartphone,
  Calculator,
  Eye,
  Receipt
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";
import DailyPracticeModal from "./DailyPracticeModal";
import NewsSection from "./NewsSection";
import MinnalNewsMobile from "./MinnalNewsMobile";
import EnrollmentModal from "./EnrollmentModal";
import IncomeTaxModal from "./IncomeTaxModal";
import WhatsAppJoinModal from "./WhatsAppJoinModal";
import ReceiptModal from "./ReceiptModal";
import { generateReceiptPdf } from "../utils/receiptPdfExport";

export default function DashboardPage({ user, onNavigateToLearning, onNavigateToMaterials, onNavigate, lang = "en" }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [containers, setContainers] = useState([]);
  const [dailyPractices, setDailyPractices] = useState([]);
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [selectedDailyPracticeId, setSelectedDailyPracticeId] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedTetPaper, setSelectedTetPaper] = useState("paper1"); // "paper1" (TET 1) or "paper2" (TET 2)
  const [activeModal, setActiveModal] = useState(null); // "tamil_reading", "english_reading", "online_class", "nmms", "treast", "news"
  const [isEnrolled, setIsEnrolled] = useState(user?.role === "admin");
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [publicSettings, setPublicSettings] = useState({ course_price: 999, original_price: 2499, discount_percent: 60, razorpay_key_id: "" });
  const [showNewsFeed, setShowNewsFeed] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadDashboard();
    loadContainers();
    loadDailyPractices();
    loadActiveMeetings();
    checkEnrollmentStatus();
  }, [user]);

  const checkEnrollmentStatus = async () => {
    let userEnrolled = user?.role === "admin";
    let waLink = "";
    let waTitle = "";
    let waEnabled = false;

    if (user?.email) {
      try {
        const res = await fetchApi(`/enrollments/my-status?email=${encodeURIComponent(user.email)}`);
        if (res && res.is_enrolled) {
          setIsEnrolled(true);
          userEnrolled = true;
          if (res.enrollment) setEnrollmentData(res.enrollment);
          if (res.whatsapp_group_link) waLink = res.whatsapp_group_link;
          if (res.whatsapp_group_title) waTitle = res.whatsapp_group_title;
          if (res.whatsapp_group_enabled !== undefined) waEnabled = res.whatsapp_group_enabled;
        } else if (user?.role === "admin") {
          setIsEnrolled(true);
          userEnrolled = true;
          if (res && res.enrollment) setEnrollmentData(res.enrollment);
        } else {
          setIsEnrolled(false);
          setEnrollmentData(null);
        }
      } catch (e) {
        if (user?.role === "admin") {
          setIsEnrolled(true);
          userEnrolled = true;
        } else {
          setIsEnrolled(false);
          setEnrollmentData(null);
        }
      }
    } else if (user?.role === "admin") {
      setIsEnrolled(true);
      userEnrolled = true;
    }

    // Default admin fallback enrollment data if null
    if (user?.role === "admin") {
      setEnrollmentData((prev) => prev || {
        id: 1001,
        name: user?.name || "Administrator",
        email: user?.email || "admin@tnteachers.in",
        mobile: user?.phone || "—",
        designation: "Administrator",
        course_name: "TNTET Paper 1 & 2 All-in-One Comprehensive Pass",
        amount: 1000,
        status: "active",
        payment_id: "pay_ADMIN_VIP",
        order_id: "order_ADMIN_VIP",
        payment_method: "online",
        created_at: new Date().toISOString()
      });
    }

    try {
      const settings = await fetchApi("/public-settings");
      if (settings) {
        setPublicSettings(settings);
        if (!waLink && settings.whatsapp_group_link) waLink = settings.whatsapp_group_link;
        if (!waTitle && settings.whatsapp_group_title) waTitle = settings.whatsapp_group_title;
        if (settings.whatsapp_group_enabled !== undefined) waEnabled = settings.whatsapp_group_enabled;
      }
    } catch (e) {}

    // Auto pop-out WhatsApp modal for enrolled users if not yet joined
    const hasAnyWaGroup = (settings?.whatsapp_groups && settings.whatsapp_groups.some(g => g.enabled !== false && g.link)) || (waEnabled && waLink);
    if (userEnrolled && hasAnyWaGroup) {
      try {
        const alreadyJoined = localStorage.getItem("tet_wa_joined");
        if (!alreadyJoined) {
          setIsWhatsAppModalOpen(true);
        }
      } catch (e) {}
    }
  };

  const loadContainers = async () => {
    try {
      const data = await fetchApi("/dashboard-containers");
      if (Array.isArray(data) && data.length > 0) {
        setContainers(data);
      } else {
        setContainers(getDefaultContainers());
      }
    } catch (err) {
      console.error("Dashboard containers error:", err);
      setContainers(getDefaultContainers());
    }
  };

  const loadDailyPractices = async () => {
    try {
      const data = await fetchApi("/daily-practice/active");
      if (Array.isArray(data)) {
        setDailyPractices(data);
      }
    } catch (err) {
      console.error("Daily practices error:", err);
    }
  };

  const loadActiveMeetings = async () => {
    try {
      const data = await fetchApi("/meetings/active");
      if (Array.isArray(data)) {
        setActiveMeetings(data);
      }
    } catch (err) {
      console.error("Active meetings error:", err);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const email = user ? user.email : "candidate@tet.com";
      const data = await fetchApi(`/dashboard?email=${encodeURIComponent(email)}`);
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContainers = () => [
    {
      container_key: "tet_1",
      title: "TET - 1",
      subtitle: "Classes 1–8 | தாள் - 1",
      category: "tet",
      description: "1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு & தினசரி பயிற்சிகள்",
      badge_text: "Classes 1-8",
      button_text: "OPEN TET-1 →",
      action_url: "tet_1",
      icon_name: "GraduationCap",
      order_index: 1,
      is_active: true
    },
    {
      container_key: "tet_2_math",
      title: "TET 2 (Math & Sci)",
      subtitle: "Classes 6–12 | தாள் - 2 (கணிதம் & அறிவியல்)",
      category: "tet",
      description: "6 முதல் 12 ஆம் வகுப்பு வரை கணிதம் மற்றும் அறிவியல் பாடங்களுக்கான முழுமையான தயாரிப்பு",
      badge_text: "Classes 6-12",
      button_text: "OPEN MATH & SCI →",
      action_url: "tet_2_math",
      icon_name: "BookOpen",
      order_index: 2,
      is_active: true
    },
    {
      container_key: "tet_2_social",
      title: "TET 2 (Social Science)",
      subtitle: "Classes 6–12 | தாள் - 2 (சமூக அறிவியல்)",
      category: "tet",
      description: "6 முதல் 12 ஆம் வகுப்பு வரை சமூக அறிவியல் பாடத்திற்கான முழுமையான தேர்வு தயாரிப்பு & மாதிரி தேர்வுகள்",
      badge_text: "Classes 6-12",
      button_text: "OPEN SOCIAL SCIENCE →",
      action_url: "tet_2_social",
      icon_name: "BookOpen",
      order_index: 3,
      is_active: true
    },
    {
      container_key: "textbooks",
      title: "TN Textbooks",
      subtitle: "Class 1 to 12 School Books",
      category: "textbooks",
      description: "தமிழ்நாடு அரசு பாடநூல் கழகத்தின் 1 முதல் 12 ஆம் வகுப்பு அனைத்துப் பாடப் புத்தகங்கள் (PDF) & கையேடுகள்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN BOOKS (FREE) →",
      action_url: "textbooks",
      icon_name: "Library",
      order_index: 4,
      is_active: true
    },
    {
      container_key: "news",
      title: "News",
      subtitle: "கல்வி மற்றும் தேர்வு செய்திகள்",
      category: "news",
      description: "TNTET, TRB, அரசுத் தேர்வுகள், பள்ளிக் கல்வித்துறை முக்கிய சுற்றறிக்கைகள் & கல்வி செய்திகள்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN NEWS (FREE) ↗",
      action_url: "news",
      icon_name: "Newspaper",
      order_index: 4,
      is_active: true
    },
    {
      container_key: "tamil_reading",
      title: "Tamil Reading",
      subtitle: "தமிழ் வாசிப்பு & இலக்கணம்",
      category: "tamil_reading",
      description: "செய்யுள் நயம், உரைநடை, இலக்கண விதிகள், பொருள் அறிதல் & சொல்லகராதி பயிற்சிகள்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN TAMIL READING (FREE) →",
      action_url: "tamil_reading",
      icon_name: "BookCheck",
      order_index: 5,
      is_active: true
    },
    {
      container_key: "english_reading",
      title: "English Reading",
      subtitle: "Comprehension & Vocabulary",
      category: "english_reading",
      description: "Daily English comprehension passages, grammar guides, vocabulary exercises & practice tests",
      badge_text: "FREE ACCESS",
      button_text: "OPEN ENGLISH READING (FREE) →",
      action_url: "english_reading",
      icon_name: "Languages",
      order_index: 6,
      is_active: true
    },
    {
      container_key: "online_class",
      title: "Online Class",
      subtitle: "நேரலை வகுப்புகள் & பதிவுகள்",
      category: "online_class",
      description: "சிறப்பு பயிற்றுநர்களின் நேரலை வகுப்புகள், கலந்துரையாடல் மற்றும் முந்தைய வகுப்பு காணொளிகள்",
      badge_text: "Live Meeting",
      button_text: "JOIN CLASS →",
      action_url: "online_class",
      icon_name: "Video",
      order_index: 7,
      is_active: true
    },
    {
      container_key: "income_tax",
      title: "INCOME TAX CALCULATION STATEMENT",
      subtitle: "FY 2025-26 & AY 2026-27 (New Tax Regime)",
      category: "income_tax",
      description: "வருமான வரி கணக்கீட்டு படிவம் (Sheet 3 I PAGE) - உடனடி கணக்கீடு மற்றும் PDF பதிவிறக்கம்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN TAX CALCULATOR (FREE) →",
      action_url: "income_tax",
      icon_name: "Calculator",
      order_index: 8,
      is_active: true
    },
    {
      container_key: "nmms",
      title: "NMMS",
      subtitle: "தேசிய வருவாய் வழி மற்றும் திறன் தேர்வு",
      category: "nmms",
      description: "8-ஆம் வகுப்பு மாணவர்களுக்கான NMMS உதவித்தொகைத் தேர்வு MAT & SAT பாடக்குறிப்புகள் மற்றும் மாதிரி தேர்வுகள்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN NMMS (FREE) →",
      action_url: "nmms",
      icon_name: "Award",
      order_index: 9,
      is_active: true
    },
    {
      container_key: "treast",
      title: "TREAST",
      subtitle: "ஊரகத் திறனாய்வுத் தேர்வு (TRUST / TREAST)",
      category: "treast",
      description: "கிராமப்புற மாணவர்களுக்கான திறனாய்வுத் தேர்வு வழிகாட்டி, வினா-விடை வங்கி மற்றும் பயிற்சித் தேர்வுகள்",
      badge_text: "FREE ACCESS",
      button_text: "OPEN TREAST (FREE) →",
      action_url: "treast",
      icon_name: "Trophy",
      order_index: 10,
      is_active: true
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#0284C7] text-xs font-bold">Loading Dashboard...</p>
      </div>
    );
  }

  const u = dashboardData?.user || user || {};
  const announcements = dashboardData?.announcements || [];

  // Determine active/live meeting notification for Online Class
  const currentLiveMeeting = activeMeetings.find(m => m.is_live) || (activeMeetings.length > 0 ? activeMeetings[0] : null);

  const CONTAINER_THEMES = {
    tet_1: {
      ribbon: "from-blue-600 via-sky-500 to-indigo-600",
      headerBg: "bg-gradient-to-r from-blue-100/90 via-sky-50/70 to-indigo-50/40",
      border: "border-blue-300 hover:border-blue-500 shadow-blue-100",
      iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30",
      titleColor: "text-blue-950 font-black",
      categoryBadge: "bg-blue-600 text-white border-blue-700",
      categoryLabel: "📘 TET • தாள் 1 (வகுப்பு 1-8)",
    },
    tet_2_math: {
      ribbon: "from-purple-600 via-indigo-600 to-violet-700",
      headerBg: "bg-gradient-to-r from-purple-100/90 via-indigo-50/70 to-violet-50/40",
      border: "border-purple-300 hover:border-purple-500 shadow-purple-100",
      iconBg: "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/30",
      titleColor: "text-purple-950 font-black",
      categoryBadge: "bg-purple-700 text-white border-purple-800",
      categoryLabel: "🎓 TET • தாள் 2 (கணிதம் & அறிவியல்)",
    },
    tet_2: {
      ribbon: "from-purple-600 via-indigo-600 to-violet-700",
      headerBg: "bg-gradient-to-r from-purple-100/90 via-indigo-50/70 to-violet-50/40",
      border: "border-purple-300 hover:border-purple-500 shadow-purple-100",
      iconBg: "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/30",
      titleColor: "text-purple-950 font-black",
      categoryBadge: "bg-purple-700 text-white border-purple-800",
      categoryLabel: "🎓 TET • தாள் 2 (கணிதம் & அறிவியல்)",
    },
    tet_2_social: {
      ribbon: "from-indigo-600 via-sky-600 to-teal-700",
      headerBg: "bg-gradient-to-r from-indigo-100/90 via-sky-50/70 to-teal-50/40",
      border: "border-indigo-300 hover:border-indigo-500 shadow-indigo-100",
      iconBg: "bg-gradient-to-br from-indigo-600 to-teal-700 text-white shadow-md shadow-indigo-500/30",
      titleColor: "text-indigo-950 font-black",
      categoryBadge: "bg-indigo-700 text-white border-indigo-800",
      categoryLabel: "🌍 TET • தாள் 2 (சமூக அறிவியல்)",
    },
    textbooks: {
      ribbon: "from-emerald-600 via-teal-500 to-green-600",
      headerBg: "bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-green-50/40",
      border: "border-emerald-300 hover:border-emerald-500 shadow-emerald-100",
      iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30",
      titleColor: "text-emerald-950 font-black",
      categoryBadge: "bg-emerald-600 text-white border-emerald-700",
      categoryLabel: "📚 அரசுப் பாடநூல்கள் (வகுப்பு 1-12)",
    },
    news: {
      ribbon: "from-rose-600 via-red-500 to-orange-600",
      headerBg: "bg-gradient-to-r from-rose-100/90 via-orange-50/70 to-amber-50/40",
      border: "border-rose-300 hover:border-rose-500 shadow-rose-100",
      iconBg: "bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30",
      titleColor: "text-rose-950 font-black",
      categoryBadge: "bg-rose-600 text-white border-rose-700",
      categoryLabel: "⚡ மின்னல் கல்விச் செய்திகள்",
    },
    tamil_reading: {
      ribbon: "from-amber-600 via-orange-500 to-amber-700",
      headerBg: "bg-gradient-to-r from-amber-100/90 via-orange-50/70 to-amber-50/40",
      border: "border-amber-300 hover:border-amber-500 shadow-amber-100",
      iconBg: "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/30",
      titleColor: "text-amber-950 font-black",
      categoryBadge: "bg-amber-600 text-white border-amber-700",
      categoryLabel: "📖 தமிழ் வாசிப்பு & இலக்கணம்",
    },
    english_reading: {
      ribbon: "from-violet-600 via-purple-500 to-fuchsia-600",
      headerBg: "bg-gradient-to-r from-violet-100/90 via-purple-50/70 to-fuchsia-50/40",
      border: "border-violet-300 hover:border-violet-500 shadow-violet-100",
      iconBg: "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30",
      titleColor: "text-violet-950 font-black",
      categoryBadge: "bg-violet-700 text-white border-violet-800",
      categoryLabel: "🔤 English Reading & Grammar",
    },
    online_class: {
      ribbon: "from-pink-600 via-rose-500 to-red-600",
      headerBg: "bg-gradient-to-r from-pink-100/90 via-rose-50/70 to-red-50/40",
      border: "border-rose-300 hover:border-rose-500 shadow-rose-100",
      iconBg: "bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-md shadow-rose-500/30",
      titleColor: "text-rose-950 font-black",
      categoryBadge: "bg-pink-600 text-white border-pink-700",
      categoryLabel: "🔴 நேரலை வகுப்புகள் & பதிவுகள்",
    },
    income_tax: {
      ribbon: "from-teal-600 via-cyan-500 to-emerald-600",
      headerBg: "bg-gradient-to-r from-teal-100/90 via-cyan-50/70 to-emerald-50/40",
      border: "border-teal-300 hover:border-teal-500 shadow-teal-100",
      iconBg: "bg-gradient-to-br from-teal-700 to-cyan-700 text-white shadow-md shadow-teal-500/30",
      titleColor: "text-teal-950 font-black",
      categoryBadge: "bg-teal-700 text-white border-teal-800",
      categoryLabel: "🧮 வருமான வரி படிவம்",
    },
    nmms: {
      ribbon: "from-amber-500 via-yellow-500 to-orange-500",
      headerBg: "bg-gradient-to-r from-amber-100/90 via-yellow-50/70 to-orange-50/40",
      border: "border-amber-300 hover:border-amber-500 shadow-amber-100",
      iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/30",
      titleColor: "text-amber-950 font-black",
      categoryBadge: "bg-amber-600 text-white border-amber-700",
      categoryLabel: "🏆 NMMS தேர்வு (வகுப்பு 8)",
    },
    treast: {
      ribbon: "from-emerald-600 via-teal-500 to-cyan-600",
      headerBg: "bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-cyan-50/40",
      border: "border-teal-300 hover:border-teal-500 shadow-teal-100",
      iconBg: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-500/30",
      titleColor: "text-teal-950 font-black",
      categoryBadge: "bg-teal-700 text-white border-teal-800",
      categoryLabel: "🏅 TRUST / TREAST ஊரகத் தேர்வு",
    }
  };

  const renderWhiteIcon = (iconName) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="w-5 h-5 text-white" />;
      case "BookOpen": return <BookOpen className="w-5 h-5 text-white" />;
      case "Library": return <Library className="w-5 h-5 text-white" />;
      case "Newspaper": return <Newspaper className="w-5 h-5 text-white" />;
      case "BookCheck": return <BookCheck className="w-5 h-5 text-white" />;
      case "Languages": return <Languages className="w-5 h-5 text-white" />;
      case "Video": return <Video className="w-5 h-5 text-white" />;
      case "Award": return <Award className="w-5 h-5 text-white" />;
      case "Trophy": return <Trophy className="w-5 h-5 text-white" />;
      case "Sparkles": return <Trophy className="w-5 h-5 text-white" />;
      case "Calculator": return <Calculator className="w-5 h-5 text-white" />;
      default: return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="w-5 h-5 text-[#0055ff]" />;
      case "BookOpen": return <BookOpen className="w-5 h-5 text-[#0055ff]" />;
      case "Library": return <Library className="w-5 h-5 text-emerald-600" />;
      case "Newspaper": return <Newspaper className="w-5 h-5 text-sky-600" />;
      case "BookCheck": return <BookCheck className="w-5 h-5 text-indigo-600" />;
      case "Languages": return <Languages className="w-5 h-5 text-violet-600" />;
      case "Video": return <Video className="w-5 h-5 text-rose-600" />;
      case "Award": return <Award className="w-5 h-5 text-amber-600" />;
      case "Trophy": return <Trophy className="w-5 h-5 text-teal-600" />;
      case "Sparkles": return <Trophy className="w-5 h-5 text-teal-600" />;
      case "Calculator": return <Calculator className="w-5 h-5 text-emerald-600" />;
      default: return <BookOpen className="w-5 h-5 text-[#0055ff]" />;
    }
  };

  const handleContainerAction = (c) => {
    const key = c.container_key || c.category;
    const LOCKED_KEYS = ["tet_1", "tet_2", "tet_2_math", "tet_2_social", "online_class"];

    // Check if module is locked
    if (LOCKED_KEYS.includes(key) && !isEnrolled && user?.role !== "admin") {
      setIsEnrollmentModalOpen(true);
      return;
    }

    if (key === "tet_1") {
      onNavigateToLearning("paper1", 1);
    } else if (key === "tet_2_math" || key === "tet_2") {
      onNavigateToLearning("paper2", 6, "math_sci");
    } else if (key === "tet_2_social") {
      onNavigateToLearning("paper2", 6, "social");
    } else if (key === "textbooks") {
      if (onNavigateToMaterials) onNavigateToMaterials();
    } else if (key === "news") {
      window.open("/news", "_blank");
    } else if (key === "online_class") {
      if (currentLiveMeeting && currentLiveMeeting.meeting_link) {
        window.open(currentLiveMeeting.meeting_link, "_blank");
      } else {
        setActiveModal("online_class");
      }
    } else if (key === "income_tax") {
      if (onNavigate) {
        onNavigate("/income-tax");
      } else {
        setActiveModal("income_tax");
      }
    } else if (key === "tamil_reading") {
      setActiveModal("tamil_reading");
    } else if (key === "english_reading") {
      setActiveModal("english_reading");
    } else if (key === "nmms") {
      setActiveModal("nmms");
    } else if (key === "treast") {
      setActiveModal("treast");
    } else {
      if (c.action_url && c.action_url.startsWith("http")) {
        window.open(c.action_url, "_blank");
      }
    }
  };

  // Reusable component for the Embedded Daily Task Completion Status
  const renderDailyTaskPanel = (isTargetActive, paperCode) => {
    return (
      <div className={`mt-3.5 p-4 rounded-2xl border transition-all ${
        isTargetActive 
          ? "bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border-blue-200 shadow-xs" 
          : "bg-slate-50/60 border-slate-200/70"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isTargetActive ? "text-[#0055ff]" : "text-slate-400"}`} />
            <span className="text-xs font-black uppercase tracking-wider text-[#061b36]">
              {t.dailyTaskTitle || "Daily Task Completion Status"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isTargetActive ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0055ff] text-white tracking-wide">
                Active Selection
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTetPaper(paperCode);
                }}
                className="text-[11px] font-bold text-[#0055ff] hover:underline cursor-pointer"
              >
                Select this course →
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & percentage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-bold">
              {u.daily_tasks_done || 0} / {u.daily_tasks_total || 4} {t.tasksDone || "Tasks Done"}
            </span>
            <span className="font-black text-[#0055ff]">
              {u.progress_percent || 0}% Completed
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(8, u.progress_percent || 0))}%` }}
            />
          </div>
        </div>

        {/* 5 Stages Sequential Learning Progress Indicators */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 text-[11px]">
          <div className="px-2 py-1 rounded-lg bg-blue-50 text-[#0055ff] border border-blue-200 flex items-center justify-center space-x-1 font-bold">
            <BookOpen className="w-3 h-3 text-[#0055ff]" />
            <span>1. Book PDF</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-sky-50 text-[#0284c7] border border-sky-200 flex items-center justify-center space-x-1 font-bold">
            <FileCheck className="w-3 h-3 text-[#0284c7]" />
            <span>2. Notes</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-emerald-50 text-[#00a651] border border-emerald-200 flex items-center justify-center space-x-1 font-bold">
            <Video className="w-3 h-3 text-[#00a651]" />
            <span>3. Video</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-orange-50 text-[#ff7a00] border border-orange-200 flex items-center justify-center space-x-1 font-bold">
            <HelpCircle className="w-3 h-3 text-[#ff7a00]" />
            <span>4. Practice</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-purple-50 text-[#8a00e6] border border-purple-200 flex items-center justify-center space-x-1 font-bold col-span-2 sm:col-span-1">
            <Award className="w-3 h-3 text-[#8a00e6]" />
            <span>5. Exam 80%</span>
          </div>
        </div>

        {/* Daily Streak indicator */}
        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{t.dailyStreakTitle || "Daily Streak"}:</span>
            <span className="font-black text-[#061b36]">{u.streak_count || 0} {t.streakDays || "Days"}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {u.streak_count > 0 ? "🔥 Streak Active" : "Start your streak today!"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6 animate-fade-in text-[#071c38]">
      
      {/* PROFILE WELCOME CARD */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-[#0055ff] rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-[#061b36] via-[#092d62] to-[#0055ff] shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="TN Teacher Emblem"
                className="w-full h-full object-cover rounded-full border-2 border-white"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#061b36] tracking-tight">
                  {t.welcomeBack}, {u.name}!
                </h1>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-lg bg-slate-50 text-[#061b36] border border-slate-200 flex items-center space-x-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#0055ff]" />
                  <span>{t.academicYear}</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TN Teacher Active Account</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            {isEnrolled && (
              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-blue-200 font-extrabold text-xs flex items-center space-x-2 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={lang === "ta" ? "கட்டண ரசீது (PDF)" : "Payment Receipt (PDF)"}
              >
                <FileText className="w-4 h-4 text-[#0055ff]" />
                <span>{lang === "ta" ? "கட்டண ரசீது" : "Fee Receipt (PDF)"}</span>
              </button>
            )}
            <a
              href="/TNTET_App.apk"
              download="TNTET_App.apk"
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold text-xs flex items-center space-x-2 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Download Android Mobile App (.apk)"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>{lang === "ta" ? "மொபைல் செயலி (.apk)" : "Download App (.apk)"}</span>
            </a>
          </div>

        </div>
      </div>

      {/* ================= PAYMENT RECEIPT CARD FOR ENROLLED MEMBERS ================= */}
      {isEnrolled && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#061b36] to-[#0055ff] text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PAID VERIFIED ✓
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {enrollmentData?.payment_id ? `Txn: ${enrollmentData.payment_id}` : `Receipt #${enrollmentData?.id || "REC-1001"}`}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#061b36] mt-0.5">
                {lang === "ta" ? "அதிகாரப்பூர்வ கட்டண ரசீது & வரி விலைப்பட்டியல்" : "Official Fee Payment Receipt & Tax Invoice"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {enrollmentData?.course_name || "TNTET Paper 1 & 2 All-in-One Pass"} • ₹{enrollmentData?.amount || 1000} Paid via Razorpay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{lang === "ta" ? "ரசீதைப் பார்க்க" : "View Receipt"}</span>
            </button>
            <button
              onClick={() => {
                if (enrollmentData) {
                  generateReceiptPdf(enrollmentData);
                } else {
                  setIsReceiptModalOpen(true);
                }
              }}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs shadow-blue-500/20 hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "ta" ? "PDF பதிவிறக்குக" : "Download PDF Receipt"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= VIP WHATSAPP COMMUNITY BANNER FOR ENROLLED MEMBERS ================= */}
      {isEnrolled && (publicSettings?.whatsapp_group_enabled || (publicSettings?.whatsapp_groups && publicSettings?.whatsapp_groups.length > 0)) && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 border-2 border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-lg shadow-emerald-600/20 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-white" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-900/60 border border-emerald-300/40 text-emerald-100 shadow-2xs">
                  VIP COMMUNITY
                </span>
                <span className="text-[11px] text-emerald-100 font-bold">
                  {publicSettings?.whatsapp_groups && publicSettings.whatsapp_groups.length > 1
                    ? (lang === "ta" ? "3 அதிகாரப்பூர்வ வாட்ஸ்அப் குழுக்கள் (தாள் 1, கணிதம் & அறிவியல், சமூகம்)" : "3 Official WhatsApp Groups (Paper 1, Paper 2 M&S, Paper 2 Social)")
                    : (publicSettings?.whatsapp_group_title || (lang === "ta" ? "TET VIP ஆசிரியர்கள் வாட்ஸ்அப் குழு" : "TET VIP Teachers Community"))}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight mt-0.5">
                {lang === "ta" 
                  ? "அங்கீகரிக்கப்பட்ட ஆசிரியர்களுக்கான அதிகாரப்பூர்வ வாட்ஸ்அப் குழுக்கள்" 
                  : "Official Enrolled Teachers WhatsApp VIP Groups"}
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {lang === "ta" 
                  ? "உங்கள் பாடப் பிரிவிற்கான வாட்ஸ்அப் குழுவில் (TET Paper 1, TET 2 MA & SC, TET 2 S.SC) இணைந்து நேரலை வகுப்புகள் மற்றும் சுருக்கக் குறிப்புகளைப் பெறவும்." 
                  : "Join your track group (TET Paper 1, TET 2 MA & SC, TET 2 S.SC) to receive daily Google Meet links and study notes."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-emerald-700" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
              <span>{lang === "ta" ? "குழுவில் இணையுங்கள் ↗" : "Join WhatsApp Group ↗"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= PLATFORM ANNOUNCEMENTS (MARQUEE TICKER) ================= */}
      {announcements && announcements.length > 0 && (
        <div className="bg-gradient-to-r from-[#061b36] via-[#092d62] to-[#0055ff] border border-[#0055ff]/40 rounded-2xl p-2 sm:p-2.5 shadow-sm text-white overflow-hidden relative flex items-center gap-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs shrink-0 z-10 backdrop-blur-md shadow-2xs">
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="uppercase tracking-wider">
              {lang === "ta" ? "முக்கிய அறிவிப்பு:" : "Notice:"}
            </span>
          </div>

          <div className="overflow-hidden flex-1 relative cursor-pointer group">
            <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
              {[...announcements, ...announcements].map((ann, idx) => (
                <div
                  key={`${ann.id}-${idx}`}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="flex items-center space-x-2 text-xs font-semibold hover:text-amber-200 transition-colors cursor-pointer"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/40 text-blue-200 border border-blue-400/30">
                    NOTICE
                  </span>
                  <span className="font-bold text-white group-hover:text-amber-100">{ann.title}:</span>
                  <span className="text-slate-200/90 max-w-md truncate">{ann.content}</span>
                  <span className="text-[10px] text-blue-300/80">({ann.date})</span>
                  <span className="text-amber-400/70 ml-4 font-bold">⚡</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedAnnouncement(announcements[0])}
            className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-blue-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all shrink-0 cursor-pointer"
            title="Read Full Notice"
          >
            <span>{lang === "ta" ? "பார்வை" : "View"}</span>
            <span>↗</span>
          </button>
        </div>
      )}

      {/* ================= DAILY PRACTICE TESTS SECTION ================= */}
      {dailyPractices && dailyPractices.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#061b36] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#ff7a00]" />
              <span>⚡ Today's Daily Practice Tests (இன்றைய மாதிரிப் பயிற்சித் தேர்வுகள்)</span>
            </h3>
            <span className="text-xs sm:text-sm text-slate-500 font-semibold">Class-wise tests with custom stages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dailyPractices.map((dp) => (
              <div
                key={dp.id}
                className="bg-white border-2 border-orange-200/80 hover:border-orange-400 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-[#ff7a00] border border-orange-200">
                      Class {dp.class_num} • {dp.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                      {dp.term}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#061b36] tracking-tight leading-snug">
                      {dp.title}
                    </h3>
                    {dp.description && (
                      <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">
                        {dp.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Included Stages:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(dp.active_stages) ? dp.active_stages : (typeof dp.active_stages === "string" ? dp.active_stages.split(",").map(Number).filter(n => !isNaN(n)) : [1, 3, 4])).map((stg) => {
                        const stageConfigs = {
                          1: { label: "Stage 1: Book PDF", icon: BookOpen, color: "text-[#0055ff] bg-blue-50 border-blue-200" },
                          2: { label: "Stage 2: Short Notes", icon: FileCheck, color: "text-[#0284c7] bg-sky-50 border-sky-200" },
                          3: { label: "Stage 3: Video Class", icon: Video, color: "text-[#00a651] bg-emerald-50 border-emerald-200" },
                          4: { label: "Stage 4: Practice MCQs", icon: HelpCircle, color: "text-[#ff7a00] bg-orange-50 border-orange-200" },
                          5: { label: "Stage 5: Online Test (80%)", icon: Award, color: "text-[#8a00e6] bg-purple-50 border-purple-200" }
                        };
                        const conf = stageConfigs[stg] || { label: `Stage ${stg}`, icon: CheckCircle2, color: "text-slate-700 bg-slate-50 border-slate-200" };
                        const StageIcon = conf.icon;
                        return (
                          <span
                            key={stg}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center space-x-1 ${conf.color}`}
                          >
                            <StageIcon className="w-3 h-3" />
                            <span>{conf.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-semibold">
                    <span>{dp.quiz_questions_count || dp.test_questions_count || 20} Qs</span>
                    <span className="mx-1.5">•</span>
                    <span>{dp.time_limit_mins || 20} Mins</span>
                  </div>

                  <button
                    onClick={() => setSelectedDailyPracticeId(dp.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-white font-black text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer min-h-[40px]"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= DASHBOARD LEARNING & RESOURCE CONTAINERS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#061b36] flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-[#0055ff]" />
              <span>TN Teachers Educational Portal & Learning Hub</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Select any learning module, textbook, scholarship exam, or live class below
            </p>
          </div>
        </div>

        {/* Dynamic Responsive Container Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {containers.map((c) => {
            const key = c.container_key || c.category;
            const isTet1 = key === "tet_1";
            const isTet2 = key === "tet_2" || key === "tet_2_math" || key === "tet_2_social";
            const isOnlineClass = key === "online_class";
            const hasLiveAlert = isOnlineClass && Boolean(currentLiveMeeting);
            const LOCKED_KEYS = ["tet_1", "tet_2", "tet_2_math", "tet_2_social", "online_class"];
            const isLocked = LOCKED_KEYS.includes(key) && !isEnrolled && user?.role !== "admin";
            const isFree = !LOCKED_KEYS.includes(key);

            const theme = CONTAINER_THEMES[key] || {
              ribbon: "from-blue-600 via-indigo-600 to-blue-700",
              headerBg: "bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white",
              border: "border-blue-200/90 hover:border-blue-500",
              iconBg: "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25",
              titleColor: "text-blue-950 font-black",
              categoryBadge: "bg-blue-100 text-blue-900 border-blue-300",
              categoryLabel: c.badge_text || "Module",
            };

            return (
              <div
                key={c.id || c.container_key}
                className={`bg-white border-2 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative ${
                  isLocked
                    ? "border-amber-300 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/20"
                    : hasLiveAlert 
                    ? "border-rose-400 ring-2 ring-rose-200/70" 
                    : theme.border
                }`}
              >
                {/* Top Colorful Accent Ribbon Stripe */}
                <div className={`h-2 w-full bg-gradient-to-r ${theme.ribbon}`} />

                {/* Distinct Tinted Card Header */}
                <div className={`${theme.headerBg} p-4 sm:p-5 border-b border-slate-100/90`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 shadow-sm ${
                          isLocked
                            ? "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-amber-300"
                            : theme.iconBg
                        }`}>
                          {renderWhiteIcon(c.icon_name)}
                        </div>
                        {isLocked && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                        {!isLocked && isFree && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white" title="Free Access">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-block mb-1 shadow-2xs border ${theme.categoryBadge}`}>
                          {theme.categoryLabel}
                        </span>
                        <h2 className={`text-base sm:text-lg font-black tracking-tight leading-snug ${theme.titleColor}`}>
                          {c.title}
                        </h2>
                        {c.subtitle && (
                          <span className="text-[11px] font-bold text-slate-600 block leading-tight mt-0.5">
                            {c.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    {isLocked ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1 shadow-xs shrink-0">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>LOCKED</span>
                      </span>
                    ) : LOCKED_KEYS.includes(key) && isEnrolled ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 shadow-xs shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : hasLiveAlert ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white flex items-center space-x-1 animate-pulse shadow-xs shrink-0">
                        <Radio className="w-3 h-3 animate-ping" />
                        <span>LIVE NOW</span>
                      </span>
                    ) : isFree ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-1.5 shadow-xs shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <span>100% FREE</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {c.badge_text || "Available"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body & Actions */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {c.description}
                    </p>

                    {/* SPECIAL EMBEDDED NOTIFICATION FOR ONLINE CLASS */}
                    {isOnlineClass && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${hasLiveAlert ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                          <span className="text-xs font-black uppercase tracking-wider text-rose-900">
                            {hasLiveAlert ? "🔴 Live Class Notification" : "🔔 Live Meeting Portal"}
                          </span>
                        </div>
                        {hasLiveAlert && currentLiveMeeting ? (
                          <div>
                            <p className="text-xs font-black text-[#061b36] line-clamp-1">
                              {currentLiveMeeting.title}
                            </p>
                            <p className="text-[11px] text-slate-600 font-semibold">
                              Scheduled: {currentLiveMeeting.start_time || "Now Streaming"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 font-medium">
                            No active live stream right now. Click below to view scheduled classes or join upcoming meetings.
                          </p>
                        )}
                      </div>
                    )}

                    {/* EMBEDDED DAILY TASK COMPLETION STATUS FOR TET 1 & TET 2 */}
                    {!isLocked && isTet1 && renderDailyTaskPanel(selectedTetPaper === "paper1", "paper1")}
                    {!isLocked && isTet2 && renderDailyTaskPanel(selectedTetPaper === "paper2", "paper2")}

                    {/* SPECIAL NEWS PREVIEW WHEN NEWS CONTAINER */}
                    {key === "news" && (
                      <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 flex items-center space-x-1">
                          <Newspaper className="w-3.5 h-3.5" />
                          <span>Daily Flash News Feed</span>
                        </span>
                        <p className="text-xs text-slate-600 font-medium">
                          Instant updates on TNTET, TRB Hall Tickets, Exam Schedules & GOs.
                        </p>
                      </div>
                    )}
                  </div>

                {/* Container Action Button */}
                <div className="pt-3 border-t border-slate-100">
                  {isLocked ? (
                    <button
                      onClick={() => setIsEnrollmentModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer group min-h-[44px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Lock className="w-4 h-4" />
                      <span>UNLOCK (TET 1, 2 & LIVE) 🔒</span>
                    </button>
                  ) : isFree ? (
                    <button
                      onClick={() => handleContainerAction(c)}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer group min-h-[44px] bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:to-green-700 text-white border-2 border-emerald-400/90 shadow-emerald-600/30 animate-green-blink"
                    >
                      <span className="relative flex h-2.5 w-2.5 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                      <span>
                        {key === "news"
                          ? "OPEN NEWS (FREE) ↗"
                          : key === "textbooks"
                          ? "OPEN BOOKS (FREE) →"
                          : key === "tamil_reading"
                          ? "OPEN TAMIL READING (FREE) →"
                          : key === "english_reading"
                          ? "OPEN ENGLISH READING (FREE) →"
                          : key === "income_tax"
                          ? "OPEN TAX CALCULATOR (FREE) →"
                          : key === "nmms"
                          ? "OPEN NMMS (FREE) →"
                          : key === "treast"
                          ? "OPEN TREAST (FREE) →"
                          : (c.button_text?.includes("FREE") ? c.button_text : `OPEN ${c.title.toUpperCase()} (FREE) →`)}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContainerAction(c)}
                      className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-2 cursor-pointer group min-h-[44px] ${
                        hasLiveAlert
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                          : "bg-slate-50 hover:bg-[#0055ff] text-[#061b36] hover:text-white border border-slate-200/90 hover:border-[#0055ff]"
                      }`}
                    >
                      <span>
                        {hasLiveAlert 
                          ? "JOIN LIVE CLASS NOW ↗" 
                          : (c.button_text || `OPEN ${c.title} →`)}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* ================= ENROLLMENT & PAYMENT MODAL ================= */}
      {isEnrollmentModalOpen && (
        <EnrollmentModal
          isOpen={isEnrollmentModalOpen}
          onClose={() => setIsEnrollmentModalOpen(false)}
          user={user}
          coursePrice={publicSettings.course_price || 999}
          originalPrice={publicSettings.original_price || 2499}
          discountPercent={publicSettings.discount_percent || 60}
          razorpayKey={publicSettings.razorpay_key_id || ""}
          lang={lang}
          onEnrollmentSuccess={() => {
            setIsEnrolled(true);
          }}
        />
      )}

      {/* ================= WHATSAPP VIP COMMUNITY POP-OUT MODAL ================= */}
      <WhatsAppJoinModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        whatsappGroups={publicSettings?.whatsapp_groups || []}
        whatsappGroupLink={publicSettings?.whatsapp_group_link}
        whatsappGroupTitle={publicSettings?.whatsapp_group_title}
        lang={lang}
      />

      {/* ================= MODAL: TAMIL READING ================= */}
      {activeModal === "tamil_reading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                  <BookCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#061b36]">தமிழ் வாசிப்பு & இலக்கணப் பயிற்சி</h3>
                  <span className="text-xs text-slate-500 font-bold">Tamil Reading Comprehension & Grammar</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="text-xs font-black text-amber-900 uppercase">📖 வாசிப்புப் பகுதி (மாதிரி 1 - சிலப்பதிகாரம் நயம்):</span>
                <p className="italic text-slate-800">
                  "திங்களைப் போற்றுதும் திங்களைப் போற்றுதும்!<br />
                  கொங்கலர்தார்க் சென்னி குளிர்வெண் குடைபோன்று<br />
                  இங்கண் உலகுஅளித்த லான்!"
                </p>
                <div className="pt-2 border-t border-amber-200/80 text-xs">
                  <span className="font-bold text-[#061b36]">சொற்பொருள்:</span> திங்கள் - நிலவு; கொங்கு - மகரந்தம்; அலர் - மலர்தல்; சென்னி - சோழ மன்னன்.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-[#0055ff] uppercase">💡 முக்கிய இலக்கணக் குறிப்புகள்:</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  <li><strong>போற்றுதும்</strong> - தன்மைப் பன்மை வினைமுற்று</li>
                  <li><strong>கொங்கலர்</strong> - இரண்டாம் வேற்றுமை உருபும் பயனும் உடன் தொக்க தொகை</li>
                  <li><strong>குளிர்வெண்குடை</strong> - பண்புத்தொகை (குளிர்மை + வெண்மை + குடை)</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-semibold">1 முதல் 12 ஆம் வகுப்பு பாடப்பகுதிகள் இணைக்கப்பட்டுள்ளன</span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigateToLearning("paper2", 6);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <span>பாடவாரியாக படிக்க →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENGLISH READING ================= */}
      {activeModal === "english_reading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#061b36]">English Reading & Grammar Hub</h3>
                  <span className="text-xs text-slate-500 font-bold">Comprehension Passages & Vocabulary Exercises</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <span className="text-xs font-black text-blue-900 uppercase">📚 Daily Passage (Practice 1):</span>
                <p className="text-slate-800">
                  "Education is the most powerful weapon which you can use to change the world. Reading broadens one's horizons, enhances critical thinking, and fosters empathy across cultures. For teachers preparing for competitive exams, consistent passage reading directly sharpens accuracy and comprehension speed."
                </p>
                <div className="pt-2 border-t border-blue-200/80 text-xs">
                  <span className="font-bold text-[#061b36]">Vocabulary Focus:</span> <strong>Enhances</strong> (improves), <strong>Horizons</strong> (scope of knowledge), <strong>Empathy</strong> (understanding others).
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-[#0055ff] uppercase">✍️ Key TNTET Grammar Topics:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>• Active & Passive Voice</div>
                  <div>• Direct & Indirect Speech</div>
                  <div>• Tenses & Concord Agreement</div>
                  <div>• Degrees of Comparison</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-semibold">Classes 6 to 12 English syllabus modules</span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigateToLearning("paper2", 6);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Practice Questions →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONLINE CLASS ================= */}
      {activeModal === "online_class" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#061b36]">Live Online Classes & Schedule</h3>
                  <span className="text-xs text-slate-500 font-bold">Live Interaction & Video Recordings</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {activeMeetings.length > 0 ? (
                activeMeetings.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#061b36]">{m.title}</span>
                      {m.is_live && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Time: {m.start_time} {m.end_time ? `to ${m.end_time}` : ""}
                    </p>
                    {m.meeting_link && (
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs"
                      >
                        <span>Join Live Session</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 space-y-2">
                  <Tv className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold">No live class sessions are currently active.</p>
                  <p className="text-[11px]">When an instructor schedules a meeting, notifications will appear here instantly.</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NMMS ================= */}
      {activeModal === "nmms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#061b36]">NMMS தேர்வு வழிகாட்டி & மாதிரி தேர்வுகள்</h3>
                  <span className="text-xs text-slate-500 font-bold">National Means-cum-Merit Scholarship (8th Standard)</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="text-xs font-black text-amber-900 uppercase">🎯 தேர்வு அமைப்பு (Exam Pattern):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-[#061b36] block">பகுதி 1: MAT (மனத்திறன் தேர்வு)</span>
                    <span className="text-slate-500">90 வினாக்கள் • 90 மதிப்பெண்கள் (எண் தொடர், ஒப்புமை, பகுப்பாய்வு)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-[#061b36] block">பகுதி 2: SAT (படிப்பறிவுத் திறன் தேர்வு)</span>
                    <span className="text-slate-500">90 வினாக்கள்: அறிவியல் (35), சமூக அறிவியல் (35), கணிதம் (20)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-[#0055ff] uppercase">📌 உதவித்தொகை விவரம்:</h4>
                <p className="text-xs text-slate-600">
                  தேர்வில் தேர்ச்சி பெறும் மாணவர்களுக்கு 9-ஆம் வகுப்பு முதல் 12-ஆம் வகுப்பு வரை மாதம் ₹1,000 வீதம் ஆண்டுக்கு ₹12,000 உதவித்தொகை மத்திய அரசால் வழங்கப்படுகிறது.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-semibold">8-ஆம் வகுப்பு பாடத் திட்டத்தின் அடிப்படையில் வினாக்கள்</span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigateToLearning("paper1", 8);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <span>8-ஆம் வகுப்பு வினா வங்கி →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TREAST ================= */}
      {activeModal === "treast" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#061b36]">ஊரகத் திறனாய்வுத் தேர்வு (TRUST / TREAST)</h3>
                  <span className="text-xs text-slate-500 font-bold">Tamil Nadu Rural Students Talent Search Examination</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <h4 className="text-xs font-black text-teal-900 uppercase">🌟 தேர்வின் முக்கியத்துவம்:</h4>
                <p className="text-xs text-slate-700">
                  தமிழ்நாடு அரசுத் தேர்வுகள் இயக்ககத்தால் கிராமப்புற அரசு மற்றும் அரசு உதவிபெறும் பள்ளி மாணவர்களின் திறனை ஊக்குவிக்க ஆண்டுதோறும் நடத்தப்படும் மிக முக்கியத் தேர்வு ஆகும்.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 text-center">
                    <span className="font-bold text-[#061b36] block">கணிதம்</span>
                    <span className="text-slate-500">25 வினாக்கள்</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 text-center">
                    <span className="font-bold text-[#061b36] block">அறிவியல்</span>
                    <span className="text-slate-500">25 வினாக்கள்</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-200 text-center">
                    <span className="font-bold text-[#061b36] block">சமூக அறிவியல்</span>
                    <span className="text-slate-500">25 வினாக்கள்</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-[#0055ff] uppercase">📋 தகுதி & உதவித்தொகை:</h4>
                <p className="text-xs text-slate-600">
                  ஒவ்வொரு மாவட்டத்திலும் தலா 50 மாணவர் மற்றும் 50 மாணவிகள் தேர்ந்தெடுக்கப்பட்டு 4 ஆண்டுகளுக்கு ஆண்டுக்கு ₹1,000 உதவித்தொகை வழங்கப்படுகிறது.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-semibold">9 & 10 ஆம் வகுப்பு பாடத்திட்டம்</span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigateToLearning("paper2", 9);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <span>9 & 10 பாடக்குறிப்புகள் →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-blue-100 text-[#0055ff] border border-blue-200">
                  NOTICE
                </span>
                <span className="text-xs text-slate-400 font-semibold">{selectedAnnouncement.date}</span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#061b36] mb-2">{selectedAnnouncement.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {selectedAnnouncement.content}
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAILY PRACTICE MODAL RUNNER */}
      {selectedDailyPracticeId && (
        <DailyPracticeModal
          practiceId={selectedDailyPracticeId}
          onClose={() => setSelectedDailyPracticeId(null)}
          user={user}
          lang={lang}
        />
      )}

      {/* INCOME TAX CALCULATION STATEMENT MODAL */}
      <IncomeTaxModal
        isOpen={activeModal === "income_tax"}
        onClose={() => setActiveModal(null)}
        user={user}
      />

      {/* OFFICIAL PAYMENT RECEIPT MODAL */}
      {isReceiptModalOpen && enrollmentData && (
        <ReceiptModal
          enrollment={enrollmentData}
          onClose={() => setIsReceiptModalOpen(false)}
          lang={lang}
        />
      )}

    </div>
  );
}
