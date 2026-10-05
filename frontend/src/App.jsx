import React, { useState } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import DashboardPage from "./components/DashboardPage";
import MaterialsPage from "./components/MaterialsPage";
import LearningPage from "./components/LearningPage";
import AdminPage from "./components/AdminPage";
import { translations } from "./translations";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null); // Default null to force Login screen first!
  const [lang, setLang] = useState("en"); // "en" or "ta"

  const t = translations[lang] || translations.en;

  const handleAuthSuccess = (u) => {
    setUser(u);
    if (u && u.role === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
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
      <main className="flex-1 pb-20 md:pb-10">
        {!user ? (
          /* INITIAL LANDING / LOGIN SCREEN WHEN NOT LOGGED IN */
          <div className="min-h-[80vh] flex items-center justify-center p-4">
            <AuthModal
              isOpen={true}
              onClose={null} // Cannot close initial login screen until logged in!
              onAuthSuccess={handleAuthSuccess}
              lang={lang}
            />
          </div>
        ) : (
          /* LOGGED IN VIEWS */
          <>
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
                lang={lang}
              />
            )}

            {activeTab === "materials" && <MaterialsPage lang={lang} />}

            {activeTab === "learning" && <LearningPage user={user} lang={lang} />}

            {activeTab === "admin" && <AdminPage user={user} lang={lang} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mb-14 md:mb-0 text-xs sm:text-sm text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Column: Platform Branding */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
            <span className="font-bold text-[#061b36]">© 2026 TET Platform — {t.brandSubtitle}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Tamil Nadu School Education Portal</span>
          </div>

          {/* Right Column: Company Details & Logo (Clickable link to https://frontierwox.in/) */}
          <a 
            href="https://frontierwox.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Visit FrontierWox Tech Private Limited (https://frontierwox.in/)"
            className="flex items-center space-x-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-blue-50 hover:to-indigo-50/60 border border-slate-200/90 hover:border-[#0055ff]/40 px-4 py-2.5 rounded-2xl shadow-xs transition-all duration-200 group cursor-pointer"
          >
            <div className="text-right">
              <span className="block text-xs sm:text-sm font-black text-[#061b36] group-hover:text-[#0055ff] transition-colors tracking-tight">
                FrontierWox Tech Private Limited
              </span>
              <span className="block text-xs font-bold text-[#0055ff] uppercase tracking-wider">
                Empowering Innovation ↗
              </span>
            </div>
            
            <img 
              src="/company_logo.jpg" 
              alt="FrontierWox Tech Private Limited" 
              className="h-10 sm:h-11 w-auto object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xs group-hover:scale-105 transition-transform" 
            />
          </a>

        </div>
      </footer>

      {/* Explicit Auth Modal triggered from navbar when logged in */}
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
