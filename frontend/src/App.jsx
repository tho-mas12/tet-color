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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E3A8A] font-sans flex flex-col selection:bg-[#0284C7] selection:text-white">
      
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
      <main className="flex-1 pb-16">
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
                onNavigateToLearning={() => setActiveTab("learning")}
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
      <footer className="border-t border-sky-100 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Column: Platform Branding */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
            <span className="font-semibold text-[#1E3A8A]">© 2026 TET Platform — {t.brandSubtitle}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-400 font-medium">Tamil Nadu School Education Portal</span>
          </div>

          {/* Right Column: Company Details & Logo (Medium Size in Right Corner) */}
          <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs">
            <div className="text-right">
              <span className="block text-[11px] font-black text-[#1E3A8A] tracking-tight">
                FrontierWox Tech Private Limited
              </span>
              <span className="block text-[9px] font-bold text-[#0284C7] uppercase tracking-wider">
                Empowering Innovation
              </span>
            </div>
            
            <img 
              src="/company_logo.jpg" 
              alt="FrontierWox Tech Private Limited" 
              className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1" 
            />
          </div>

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
