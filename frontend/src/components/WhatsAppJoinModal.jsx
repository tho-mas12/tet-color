import React from "react";
import { X, CheckCircle2, Award, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";

export default function WhatsAppJoinModal({
  isOpen,
  onClose,
  whatsappGroupLink,
  whatsappGroupTitle,
  isPaymentSuccess = false,
  lang = "ta"
}) {
  if (!isOpen) return null;

  const isTa = lang === "ta";
  const title = whatsappGroupTitle || (isTa ? "TET VIP ஆசிரியர்கள் வாட்ஸ்அப் குழு" : "TET VIP Teachers Community");
  const link = whatsappGroupLink || "https://chat.whatsapp.com/";

  const handleJoinClick = () => {
    try {
      localStorage.setItem("tet_wa_joined", "true");
    } catch (e) {}
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border-2 border-emerald-300 flex flex-col max-h-[95vh] relative animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white p-6 relative overflow-hidden text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Sparkles / Confetti Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white/20 border border-white/30 text-white mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>
              {isPaymentSuccess 
                ? (isTa ? "கட்டணம் வெற்றிகரமாக பெறப்பட்டது!" : "Payment Verified Successfully!")
                : (isTa ? "விஐபி ஆசிரியர் சமூகம்" : "VIP Teacher Community")}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {isPaymentSuccess
              ? (isTa ? "🎉 வாழ்த்துகள்! உங்கள் கணக்கு செயல்படுத்தப்பட்டது" : "🎉 Congratulations! Full Pass Activated")
              : (isTa ? "ஆசிரியர்களுக்கான பிரத்யேக வாட்ஸ்அப் குழு" : "Join Official VIP WhatsApp Group")}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
            {isTa
              ? "TET 1, TET 2 மற்றும் நேரலை வகுப்புகள் அனைத்தும் உங்கள் கணக்கில் திறக்கப்பட்டுள்ளன!"
              : "Complete access to TET Paper 1, Paper 2, and Online Live Classes is now active."}
          </p>

          {/* Unlocked Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>TET 1 + 2 UNLOCKED</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>LIVE CLASSES ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Modal Body: WhatsApp Community Invitation */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 text-center space-y-3">
            
            {/* Glowing WhatsApp Icon */}
            <div className="w-16 h-16 rounded-3xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <svg className="w-9 h-9 fill-white" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
                {isTa ? "பிரத்யேக ஆசிரியர்கள் குழு" : "Official WhatsApp Group"}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed px-2">
              {isTa 
                ? "தினசரி தேர்வு அறிவிப்புகள், நேரலை வகுப்புகளுக்கான கூகுள் மீட் இணைப்புகள் மற்றும் சுருக்கக் குறிப்புகளை உடனுக்குடன் பெற கீழே உள்ள பட்டனைத் தொட்டு உடனே வாட்ஸ்அப் குழுவில் இணையுங்கள்!"
                : "Join the official group to get daily live Google Meet links, timely practice tests, important circulars & short notes directly!"}
            </p>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-emerald-900 font-bold flex items-center justify-center space-x-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isTa 
                  ? "கட்டணம் செலுத்திய சரிபார்க்கப்பட்ட ஆசிரியர்களுக்கான பாதுகாப்பான குழு"
                  : "Verified & private community for enrolled teachers only"}
              </span>
            </div>
          </div>

          {/* Big Action Button */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleJoinClick}
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
              <span>{isTa ? "வாட்ஸ்அப் குழுவில் இப்போதே இணையுங்கள் ↗" : "Join VIP WhatsApp Group ↗"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {isTa ? "டேஷ்போர்டிற்குத் செல்லவும் (Continue to Dashboard)" : "Continue to Dashboard"}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
          {isTa 
            ? "நிர்வாகியால் குழு உறுப்பினர் வரம்புக்கேற்ப புதிய இணைப்புகள் உடனுக்குடன் புதுப்பிக்கப்படும்."
            : "Group links are dynamically updated by administrators as member limits are reached."}
        </div>
      </div>
    </div>
  );
}
