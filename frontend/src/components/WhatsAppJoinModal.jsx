import React, { useState } from "react";
import { X, CheckCircle2, Award, ExternalLink, Sparkles, ShieldCheck, BookOpen, Layers, Users } from "lucide-react";

export default function WhatsAppJoinModal({
  isOpen,
  onClose,
  whatsappGroups = [],
  whatsappGroupLink,
  whatsappGroupTitle,
  isPaymentSuccess = false,
  lang = "ta"
}) {
  if (!isOpen) return null;

  const isTa = lang === "ta";
  const [joinedMap, setJoinedMap] = useState({});

  // Build the list of groups
  let groupsToDisplay = [];
  if (Array.isArray(whatsappGroups) && whatsappGroups.length > 0) {
    groupsToDisplay = whatsappGroups.filter(g => g.enabled !== false);
  }

  // Fallback to single group if no specialized groups are defined
  if (groupsToDisplay.length === 0) {
    groupsToDisplay = [
      {
        id: "default",
        title: whatsappGroupTitle || (isTa ? "TET VIP ஆசிரியர்கள் வாட்ஸ்அப் குழு" : "TET VIP Teachers Community"),
        link: whatsappGroupLink || "https://chat.whatsapp.com/",
        track: "All TET Aspirants (Paper 1 & Paper 2)",
        track_ta: "அனைத்து TET தேர்வர்கள் (தாள் 1 & 2)",
        badge_color: "emerald"
      }
    ];
  }

  const handleJoin = (group) => {
    try {
      localStorage.setItem("tet_wa_joined", "true");
      setJoinedMap(prev => ({ ...prev, [group.id]: true }));
    } catch (e) {}
    const targetLink = group.link || whatsappGroupLink || "https://chat.whatsapp.com/";
    window.open(targetLink, "_blank", "noopener,noreferrer");
  };

  const getCardStyle = (idx) => {
    switch (idx % 3) {
      case 0:
        return {
          bg: "bg-blue-50/70 hover:bg-blue-50",
          border: "border-blue-200 hover:border-blue-400",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          btn: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/20",
          iconBg: "bg-blue-600 text-white"
        };
      case 1:
        return {
          bg: "bg-emerald-50/70 hover:bg-emerald-50",
          border: "border-emerald-200 hover:border-emerald-400",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          btn: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/20",
          iconBg: "bg-emerald-600 text-white"
        };
      case 2:
      default:
        return {
          bg: "bg-purple-50/70 hover:bg-purple-50",
          border: "border-purple-200 hover:border-purple-400",
          badge: "bg-purple-100 text-purple-800 border-purple-200",
          btn: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/20",
          iconBg: "bg-purple-600 text-white"
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border-2 border-emerald-300 flex flex-col max-h-[95vh] relative animate-scale-in my-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white p-5 sm:p-6 relative overflow-hidden text-center shrink-0">
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
                ? (isTa ? "கட்டணம் பெறப்பட்டது • விஐபி சமூகம்" : "Payment Verified • VIP Community")
                : (isTa ? "அதிகாரப்பூர்வ வாட்ஸ்அப் குழுக்கள்" : "Official Subject WhatsApp Groups")}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {isTa ? "வாட்ஸ்அப் குழுவில் இணையுங்கள்" : "Join Official WhatsApp Groups"}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
            {isTa
              ? "உங்கள் தேர்வு பாடப்பிரிவுக்குரிய (Paper 1, Paper 2 Maths & Science, Paper 2 Social Science) பிரத்யேக குழுவில் உடனே இணையுங்கள்!"
              : "Select your specific preparation track to join live discussions, daily Google Meet classes & exam circulars directly!"}
          </p>

          {/* Unlocked Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>3 SPECIALIZED GROUPS</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>LIVE GOOGLE MEET LINKS</span>
            </span>
          </div>
        </div>

        {/* Modal Body: 3 Subject WhatsApp Groups */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-[#071c38]">
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
            <span>{isTa ? "பாடப்பிரிவு வாரியான குழுக்கள்:" : "Choose your preparation stream:"}</span>
            <span className="text-[11px] text-emerald-700 font-black">
              {groupsToDisplay.length} {isTa ? "குழுக்கள் செயல்பாட்டில்" : "Groups Active"}
            </span>
          </div>

          <div className="space-y-3">
            {groupsToDisplay.map((grp, idx) => {
              const styles = getCardStyle(idx);
              const isJoined = joinedMap[grp.id];

              return (
                <div
                  key={grp.id || idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${styles.bg} ${styles.border}`}
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${styles.badge}`}>
                          {isTa ? (grp.track_ta || grp.track || "TET VIP") : (grp.track || "TET VIP")}
                        </span>
                        {isJoined && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isTa ? "திறக்கப்பட்டது" : "Opened"}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                        {grp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isTa 
                          ? "நேரலை வகுப்பு கூகுள் மீட் இணைப்பு & தினசரி சுருக்கக் குறிப்புகள்" 
                          : "Live Google Meet classes & chapter study materials"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoin(grp)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                    </svg>
                    <span>{isTa ? "குழுவில் இணைக ↗" : "Join Group ↗"}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isTa 
                ? "நீங்கள் ஒன்று அல்லது அனைத்து குழுக்களிலும் தாராளமாக இணைந்து பயன்பெறலாம்."
                : "You can join one or all 3 groups relevant to your TET examination tracks."}
            </span>
          </div>

          {/* Close Action Button */}
          <div className="pt-2">
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
            : "Group links are dynamically managed by administrators in real-time."}
        </div>
      </div>
    </div>
  );
}
