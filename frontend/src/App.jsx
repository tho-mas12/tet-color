import React, { useState } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import MaterialsPage from "./components/MaterialsPage";
import LearningPage from "./components/LearningPage";
import AdminPage from "./components/AdminPage";
import { translations } from "./translations";

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

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tet_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [lang, setLang] = useState("en"); // "en" or "ta"

  const t = translations[lang] || translations.en;

  const handleAuthSuccess = (u) => {
    setUser(u);
    setIsAuthOpen(false);
    try {
      localStorage.setItem("tet_user", JSON.stringify(u));
    } catch (e) {}
    if (u && u.role === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("tet_user");
    } catch (e) {}
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#093c85] font-sans flex flex-col selection:bg-[#0055ff] selection:text-white">
      
      {/* Navigation Bar with Circle Language Switcher in top-right */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Page View */}
      <main className="flex-1 pb-16 md:pb-10">
        {!user ? (
          /* NEAT PUBLIC HOME / LANDING PAGE DIRECTING CANDIDATES TO LOGIN */
          <HomePage
            onOpenLogin={() => setIsAuthOpen(true)}
            onOpenRegister={() => setIsAuthOpen(true)}
            lang={lang}
          />
        ) : (
          /* LOGGED IN VIEWS */
          <ErrorBoundary>
            {activeTab === "dashboard" && (
              <DashboardPage
                user={user}
                onNavigateToLearning={(paperChoice, targetClass) => {
                  if (paperChoice) {
                    localStorage.setItem("tet_paper_choice", paperChoice);
                  }
                  if (targetClass) {
                    localStorage.setItem("tet_selected_class", targetClass);
                  }
                  setActiveTab("learning");
                }}
                onNavigateToMaterials={() => setActiveTab("materials")}
                lang={lang}
              />
            )}

            {activeTab === "materials" && <MaterialsPage lang={lang} />}

            {activeTab === "learning" && <LearningPage user={user} lang={lang} />}

            {activeTab === "admin" && <AdminPage user={user} lang={lang} />}
          </ErrorBoundary>
        )}
      </main>

      {/* Footer (Compact & Streamlined with Logo Right-Aligned) */}
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

          {/* Right Column: Company Details & Logo (Moved to Far Right) */}
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
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
        />
      )}

    </div>
  );
}
