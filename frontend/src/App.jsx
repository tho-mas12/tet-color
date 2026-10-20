import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import MaterialsPage from "./components/MaterialsPage";
import LearningPage from "./components/LearningPage";
import AdminPage from "./components/AdminPage";
import MinnalNewsMobile from "./components/MinnalNewsMobile";
import { translations } from "./translations";
import { CheckCircle2, Share2, Info } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-red-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
          <h3 className="text-base font-bold text-slate-800">Something went wrong in this view</h3>
          <p className="text-xs text-slate-500">{this.state.error?.message || "Please refresh or try again."}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Reload Platform
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Route resolution helper for URL parsing
 */
function resolveRoute(pathname, search, currentUser) {
  const cleanPath = (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(search || "");
  const classParam = params.get("class");
  const parsedClass = classParam ? parseInt(classParam, 10) : null;
  const targetClass = (parsedClass && parsedClass >= 1 && parsedClass <= 12) ? parsedClass : null;

  // 0. Direct Lesson Study Link: e.g. /learning/lesson/1, /lesson/1 or ?lesson=1
  const lessonMatch = cleanPath.match(/^(?:\/learning)?\/lesson\/(\d+)/i);
  const queryLesson = params.get("lesson");
  if (lessonMatch || queryLesson) {
    const lessonId = parseInt(lessonMatch ? lessonMatch[1] : queryLesson, 10);
    const stageParam = params.get("stage");
    const stageNum = stageParam ? parseInt(stageParam, 10) : 1;
    const stage = [1, 2, 3, 4].includes(stageNum) ? stageNum : 1;
    return {
      tab: "learning",
      requiresAuth: true,
      directLessonId: lessonId,
      directStage: stage,
      targetClass,
      title: `Lesson ${lessonId} • Stage ${stage}`
    };
  }

  // 1. Textbooks / Materials (Publicly accessible without login)
  if (cleanPath === "/materials" || cleanPath === "/books" || cleanPath === "/textbooks") {
    return {
      tab: "materials",
      requiresAuth: false,
      targetClass,
      title: "Textbooks & Materials"
    };
  }

  // 2. TET Course 1
  if (cleanPath === "/course/tet-1" || cleanPath === "/tet-1" || cleanPath === "/tet1") {
    return {
      tab: "learning",
      tetPaper: "paper1",
      requiresAuth: true,
      targetClass: targetClass || 1,
      title: "TET Paper 1 Preparation"
    };
  }

  // 3. TET Course 2
  if (cleanPath === "/course/tet-2" || cleanPath === "/tet-2" || cleanPath === "/tet2") {
    return {
      tab: "learning",
      tetPaper: "paper2",
      requiresAuth: true,
      targetClass: targetClass || 6,
      title: "TET Paper 2 Preparation"
    };
  }

  // 4. Generic Course / Learning
  if (cleanPath === "/learning" || cleanPath === "/course") {
    const paperParam = params.get("paper");
    const paper = paperParam === "paper2" ? "paper2" : "paper1";
    return {
      tab: "learning",
      tetPaper: paper,
      requiresAuth: true,
      targetClass: targetClass || (paper === "paper2" ? 6 : 1),
      title: paper === "paper2" ? "TET Paper 2 Preparation" : "TET Paper 1 Preparation"
    };
  }

  // 5. Admin Portal
  if (cleanPath === "/admin") {
    return {
      tab: "admin",
      requiresAuth: true,
      requiresAdmin: true,
      title: "Admin Portal"
    };
  }

  // 5.5. Minnal News Live Mobile (/news or /minnal-news)
  if (cleanPath === "/news" || cleanPath === "/minnal-news") {
    return {
      tab: "news",
      requiresAuth: false,
      title: "மின்னல் செய்திகள் • TN Teachers"
    };
  }

  // 6. Student Dashboard (/student or /dashboard)
  if (cleanPath === "/student" || cleanPath === "/dashboard") {
    if (currentUser && currentUser.role === "admin") {
      return {
        tab: "admin",
        requiresAuth: true,
        requiresAdmin: true,
        title: "Admin Portal"
      };
    }
    return {
      tab: "dashboard",
      requiresAuth: true,
      title: "Student Dashboard"
    };
  }

  // 7. Explicit /home
  if (cleanPath === "/home") {
    return {
      tab: "home",
      requiresAuth: false,
      title: "TN Teachers Eligibility Benchmark Portal"
    };
  }

  // 8. Root ("/")
  if (currentUser) {
    if (currentUser.role === "admin") {
      return {
        tab: "admin",
        requiresAuth: true,
        requiresAdmin: true,
        title: "Admin Portal"
      };
    }
    return {
      tab: "dashboard",
      requiresAuth: false,
      title: "Candidate Dashboard"
    };
  }

  return {
    tab: "home",
    requiresAuth: false,
    title: "TN Teachers Eligibility Benchmark Portal"
  };
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tet_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [lang, setLang] = useState("en"); // "en" or "ta"
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize route from current browser URL
  const initialRoute = resolveRoute(window.location.pathname, window.location.search, user);

  // Open AuthModal immediately if user is not authenticated on a protected URL
  const [isAuthOpen, setIsAuthOpen] = useState(() => {
    if (initialRoute.requiresAuth && !user) {
      const full = window.location.pathname + window.location.search;
      try {
        sessionStorage.setItem("intended_redirect", full);
        localStorage.setItem("intended_redirect", full);
      } catch (e) {}
      return true;
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (initialRoute.requiresAuth && !user) {
      return "home";
    }
    return initialRoute.tab;
  });

  const [directLesson, setDirectLesson] = useState(
    initialRoute.directLessonId && user
      ? { lessonId: initialRoute.directLessonId, stage: initialRoute.directStage || 1 } 
      : null
  );

  const t = translations[lang] || translations.en;

  // Show Toast helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Update document title dynamically
  useEffect(() => {
    let title = "TN Teachers Eligibility Benchmark Portal";
    if (activeTab === "dashboard") {
      title = (lang === "ta" ? "டாஷ்போர்டு | " : "Dashboard | ") + "TN Teachers Portal";
    } else if (activeTab === "materials") {
      title = (lang === "ta" ? "பாடப்புத்தகங்கள் & வழிகாட்டிகள் | " : "Textbooks & Materials | ") + "TN Teachers Portal";
    } else if (activeTab === "learning") {
      const paper = localStorage.getItem("tet_paper_choice") || "paper1";
      const paperName = paper === "paper2" ? "TET Paper 2" : "TET Paper 1";
      title = `${paperName} | TN Teachers Portal`;
    } else if (activeTab === "admin") {
      title = "Admin Portal | TN Teachers Portal";
    }
    document.title = title;
  }, [activeTab, lang]);

  // Navigate function that pushes/replaces browser history and updates view
  const navigateTo = useCallback((url, replace = false) => {
    try {
      const parser = document.createElement("a");
      parser.href = url;
      const pathname = parser.pathname || "/";
      const search = parser.search || "";
      const fullUrl = pathname + search;

      const route = resolveRoute(pathname, search, user);

      // Check authentication requirement
      if (route.requiresAuth && !user) {
        sessionStorage.setItem("intended_redirect", fullUrl);
        localStorage.setItem("intended_redirect", fullUrl);
        setIsAuthOpen(true);
        showToast(lang === "ta" ? "இப்பக்கத்தை அணுக உள்நுழைக" : "Please sign in to access this page");
        return;
      }

      // Check admin requirement
      if (route.requiresAdmin && user && user.role !== "admin") {
        navigateTo("/student", true);
        showToast("Admin privileges required.");
        return;
      }

      // Update browser history
      if (replace) {
        window.history.replaceState(null, "", fullUrl);
      } else {
        window.history.pushState(null, "", fullUrl);
      }

      // Update state
      if (route.tetPaper) {
        localStorage.setItem("tet_paper_choice", route.tetPaper);
      }
      if (route.targetClass) {
        localStorage.setItem("tet_selected_class", route.targetClass.toString());
      }
      if (route.directLessonId) {
        setDirectLesson({ lessonId: route.directLessonId, stage: route.directStage || 1 });
      } else {
        setDirectLesson(null);
      }
      setActiveTab(route.tab);
    } catch (err) {
      console.error("Navigation error:", err);
    }
  }, [user, lang, showToast]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = resolveRoute(window.location.pathname, window.location.search, user);
      if (route.requiresAuth && !user) {
        const full = window.location.pathname + window.location.search;
        sessionStorage.setItem("intended_redirect", full);
        localStorage.setItem("intended_redirect", full);
        setIsAuthOpen(true);
        setActiveTab("home");
      } else {
        if (route.tetPaper) {
          localStorage.setItem("tet_paper_choice", route.tetPaper);
        }
        if (route.targetClass) {
          localStorage.setItem("tet_selected_class", route.targetClass.toString());
        }
        if (route.directLessonId) {
          setDirectLesson({ lessonId: route.directLessonId, stage: route.directStage || 1 });
        } else {
          setDirectLesson(null);
        }
        setActiveTab(route.tab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);

  // On initial mount: if URL is protected and user is not logged in, prompt login
  useEffect(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    const route = resolveRoute(pathname, search, user);

    if (route.requiresAuth && !user) {
      const full = pathname + search;
      sessionStorage.setItem("intended_redirect", full);
      localStorage.setItem("intended_redirect", full);
      setIsAuthOpen(true);
      showToast(lang === "ta" ? "பாடத்திற்குச் செல்ல உள்நுழையவும்" : "Please sign in to view this shared lesson");
    } else {
      if (route.directLessonId) {
        setDirectLesson({ lessonId: route.directLessonId, stage: route.directStage || 1 });
      }
      if (route.targetClass) {
        localStorage.setItem("tet_selected_class", route.targetClass.toString());
        if (route.tetPaper) {
          localStorage.setItem("tet_paper_choice", route.tetPaper);
        }
      }
    }
  }, []); // Run once on mount

  // Successful Login Handler with Redirection
  const handleAuthSuccess = (u) => {
    setUser(u);
    setIsAuthOpen(false);
    try {
      localStorage.setItem("tet_user", JSON.stringify(u));
    } catch (e) {}

    // When admin signs in, redirect directly only to https://tnteachers.in/admin
    if (u && u.role === "admin") {
      sessionStorage.removeItem("intended_redirect");
      localStorage.removeItem("intended_redirect");
      if (window.location.hostname.includes("tnteachers.in")) {
        window.location.href = "https://tnteachers.in/admin";
      } else {
        window.location.href = "/admin";
      }
      return;
    }

    // Check if user came from a specific shared / deep-link URL (e.g. /learning/lesson/3?stage=2)
    const intended = sessionStorage.getItem("intended_redirect") || localStorage.getItem("intended_redirect");
    sessionStorage.removeItem("intended_redirect");
    localStorage.removeItem("intended_redirect");

    const isSpecificDeepLink = intended && 
      intended !== "/" && 
      intended !== "/home" && 
      intended !== "/admin" && 
      intended !== "/student" && 
      intended !== "/dashboard";

    if (isSpecificDeepLink) {
      showToast(lang === "ta" ? "பாடத்திற்குச் செல்கிறது..." : "Redirecting to your lesson...");
      if (window.location.hostname.includes("tnteachers.in")) {
        window.location.href = `https://tnteachers.in${intended.startsWith("/") ? "" : "/"}${intended}`;
      } else {
        window.location.href = intended;
      }
      return;
    }

    // Normal student login: redirect strictly only to https://tnteachers.in/student
    if (window.location.hostname.includes("tnteachers.in")) {
      window.location.href = "https://tnteachers.in/student";
    } else {
      window.location.href = "/student";
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("tet_user");
    } catch (e) {}
    navigateTo("/", true);
    showToast(lang === "ta" ? "வெற்றிகரமாக வெளியேறினீர்கள்" : "Signed out successfully");
  };

  // Native share / clipboard copy handler
  const handleSharePage = () => {
    const currentUrl = window.location.href;
    const pageTitle = document.title;

    if (navigator.share) {
      navigator.share({
        title: pageTitle,
        text: "TN Teachers Eligibility Benchmark Portal - Official Exam Preparation & Textbooks",
        url: currentUrl
      }).catch(() => {
        // Fallback to clipboard if share dialog dismissed
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast(lang === "ta" ? "இணைப்பு நகலெடுக்கப்பட்டது! ஆசிரியர்களுடன் பகிரவும் 📋" : "Page link copied to clipboard! Share with teachers & students 📋");
      });
    } else {
      // Manual fallback
      const el = document.createElement("input");
      el.value = currentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("Link copied to clipboard! 📋");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#093c85] font-sans flex flex-col selection:bg-[#0055ff] selection:text-white relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-bounce sm:animate-fade-in bg-[#061b36] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center space-x-2.5 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigateTo}
        onShare={handleSharePage}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16 md:pb-10">
        <ErrorBoundary>
          {/* Public / Unauthenticated Views */}
          {!user ? (
            activeTab === "materials" ? (
              /* Public Access to Textbooks Explorer */
              <div className="space-y-4">
                <div className="bg-blue-50 border-b border-blue-200 py-2.5 px-4 text-center text-xs text-[#061b36] font-semibold flex items-center justify-center space-x-2">
                  <Info className="w-4 h-4 text-[#0055ff]" />
                  <span>
                    {lang === "ta" 
                      ? "அனைத்து பாடப்புத்தகங்களும் பொதுப் பார்வைக்கு கிடைக்கின்றன. மாதிரித் தேர்வுகள் எழுத உள்நுழையவும்."
                      : "Official textbooks & materials are publicly accessible. Sign in to take timed benchmark quizzes."}
                  </span>
                  <button
                    onClick={() => {
                      sessionStorage.setItem("intended_redirect", window.location.pathname + window.location.search);
                      setIsAuthOpen(true);
                    }}
                    className="ml-2 underline text-[#0055ff] font-extrabold cursor-pointer hover:text-blue-800"
                  >
                    {lang === "ta" ? "இப்போது உள்நுழைக" : "Sign In Now"}
                  </button>
                </div>
                <MaterialsPage lang={lang} onShare={handleSharePage} />
              </div>
            ) : activeTab === "news" ? (
              <div className="w-full flex justify-center py-2 sm:py-6 animate-fade-in">
                <MinnalNewsMobile onClose={() => navigateTo("/")} isModal={false} lang={lang} />
              </div>
            ) : (
              /* Landing / Home Page */
              <HomePage
                onOpenLogin={() => setIsAuthOpen(true)}
                onOpenRegister={() => setIsAuthOpen(true)}
                onNavigateMaterials={() => navigateTo("/materials")}
                lang={lang}
              />
            )
          ) : (
            /* Authenticated User Views */
            <>
              {activeTab === "dashboard" && (
                <DashboardPage
                  user={user}
                  onNavigateToLearning={(paperChoice, targetClass) => {
                    const paper = paperChoice || "paper1";
                    const path = `/course/${paper === "paper2" ? "tet-2" : "tet-1"}${targetClass ? `?class=${targetClass}` : ""}`;
                    navigateTo(path);
                  }}
                  onNavigateToMaterials={() => navigateTo("/materials")}
                  lang={lang}
                />
              )}

              {activeTab === "materials" && (
                <MaterialsPage lang={lang} onShare={handleSharePage} />
              )}

              {activeTab === "learning" && (
                <LearningPage user={user} lang={lang} onShare={handleSharePage} />
              )}

              {activeTab === "news" && (
                <div className="w-full flex justify-center py-2 sm:py-6 animate-fade-in">
                  <MinnalNewsMobile 
                    onClose={() => navigateTo(user.role === "admin" ? "/admin" : "/student")} 
                    isModal={false} 
                    lang={lang} 
                  />
                </div>
              )}

              {activeTab === "admin" && (
                <AdminPage user={user} lang={lang} />
              )}

              {activeTab === "home" && (
                <HomePage
                  onOpenLogin={() => setIsAuthOpen(true)}
                  onOpenRegister={() => setIsAuthOpen(true)}
                  onNavigateMaterials={() => navigateTo("/materials")}
                  lang={lang}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 sm:py-3.5 mb-14 md:mb-0 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left Column: Platform Branding */}
          <div className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-2 text-center sm:text-left text-xs">
            <span className="font-bold text-[#061b36]">© 2026 TET Platform</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-500 font-medium">{t.brandSubtitle}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-400">Tamil Nadu School Education Portal</span>
          </div>

          {/* Right Column: Company Details & Logo */}
          <div className="sm:ml-auto flex items-center justify-end">
            <a 
              href="https://frontierwox.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Visit FrontierWox Tech Private Limited (https://frontierwox.in/)"
              className="flex items-center space-x-2.5 bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-blue-50 hover:to-indigo-50/60 border border-slate-200/90 hover:border-[#0055ff]/40 px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200 group cursor-pointer"
            >
              <div className="text-right">
                <span className="block text-xs font-black text-[#061b36] group-hover:text-[#0055ff] transition-colors tracking-tight">
                  FrontierWox Tech Private Limited
                </span>
                <span className="block text-[10px] font-bold text-[#0055ff] uppercase tracking-wider">
                  Empowering Innovation ↗
                </span>
              </div>
              
              <img 
                src="/company_logo.jpg" 
                alt="FrontierWox Tech Private Limited" 
                className="h-8 sm:h-9 w-auto object-contain rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform shrink-0" 
              />
            </a>
          </div>

        </div>
      </footer>

      {/* Auth Modal overlay */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            const route = resolveRoute(window.location.pathname, window.location.search, user);
            if (route.requiresAuth && !user) {
              navigateTo("/home", true);
            }
          }}
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
        />
      )}

    </div>
  );
}
