import React, { useState, useEffect } from "react";
import { Bell, X, Zap, ChevronRight, Check, AlertCircle, Smartphone, ExternalLink, Volume2 } from "lucide-react";
import { fetchApi } from "../api";

export default function PhoneNotificationModal({ isOpen, onClose, onNavigateNews, lang = "ta" }) {
  const isTa = lang === "ta";
  const [activeSubTab, setActiveSubTab] = useState("all"); // 'all', 'announcements', 'news'
  const [announcements, setAnnouncements] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState("default"); // 'granted', 'denied', 'default', 'unsupported'

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    } else {
      setPushStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, newsRes] = await Promise.allSettled([
        fetchApi("/admin/announcements"),
        fetchApi("/news")
      ]);

      if (annRes.status === "fulfilled" && Array.isArray(annRes.value)) {
        setAnnouncements(annRes.value);
      }
      if (newsRes.status === "fulfilled" && Array.isArray(newsRes.value)) {
        setNewsList(newsRes.value);
      }
    } catch (e) {
      console.warn("Failed to load notifications data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!("Notification" in window)) {
      alert(isTa ? "உங்கள் உலாவி புஷ் அறிவிப்புகளை ஆதரிக்கவில்லை." : "Your browser does not support push notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission === "granted") {
        // Send a native welcome phone notification
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(isTa ? "கல்வி தளம் அறிவிப்புகள்" : "Education Platform Notifications", {
            body: isTa ? "மொபைல் அறிவிப்புகள் வெற்றிகரமாக செயல்படுத்தப்பட்டன! தேர்வு மற்றும் செய்தி அறிவிப்புகளை உங்கள் போனில் உடனுக்குடன் பெறுவீர்கள்." : "Mobile phone notifications activated! You will receive timely exam and news alerts on your phone.",
            icon: "/icon-192.png",
            badge: "/favicon.png",
            vibrate: [200, 100, 200]
          });
        } else {
          new Notification(isTa ? "கல்வி தளம்" : "Education Platform", {
            body: isTa ? "அறிவிப்புகள் வெற்றிகரமாக இயக்கப்பட்டன!" : "Phone notifications activated!",
            icon: "/icon-192.png"
          });
        }
      }
    } catch (err) {
      console.error("Push permission error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] relative animate-slide-up sm:animate-scale-in"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#061b36] via-[#0a2540] to-[#061b36] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner border border-white/10">
              <Bell className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-1.5">
                <span>{isTa ? "அறிவிப்பு மையம்" : "Notification Center"}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-900">
                  Phone
                </span>
              </h3>
              <p className="text-[11px] text-sky-200">
                {isTa ? "தேர்வு அறிவிப்புகள் & முக்கியச் செய்திகள்" : "Official Announcements & Breaking News"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Phone Push Notification Status Banner */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/60 border-b border-blue-100 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Smartphone className="w-4 h-4 text-[#0055ff] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {pushStatus === "granted" 
                  ? (isTa ? "மொபைல் அறிவிப்புகள்: இயக்கப்பட்டது ✓" : "Phone Notifications: Active ✓")
                  : (isTa ? "போன் அறிவிப்புகளை இயக்கவும்" : "Get Alerts on Your Phone")}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {pushStatus === "granted"
                  ? (isTa ? "உங்கள் போனின் முகப்புத் திரையில் புதிய அறிவிப்புகள் வரும்" : "You will receive timely alerts on your device lockscreen")
                  : (isTa ? "தேர்வு மற்றும் முக்கிய செய்திகளை உடனுக்குடன் பெற" : "Enable native phone notifications for exams and news")}
              </span>
            </div>
          </div>

          {pushStatus !== "granted" && pushStatus !== "unsupported" && (
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-[11px] font-black shrink-0 shadow-xs cursor-pointer transition hover:scale-105 active:scale-95"
            >
              {isTa ? "இயக்கு 🔔" : "Enable 🔔"}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-3 py-1 rounded-xl transition cursor-pointer ${
              activeSubTab === "all" 
                ? "bg-[#061b36] text-white" 
                : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            {isTa ? "அனைத்தும்" : "All"} ({announcements.length + newsList.length})
          </button>
          <button
            onClick={() => setActiveSubTab("announcements")}
            className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
              activeSubTab === "announcements" 
                ? "bg-[#0055ff] text-white" 
                : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>📢 {isTa ? "அறிவிப்புகள்" : "Announcements"}</span>
            <span className="text-[10px] opacity-80">({announcements.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("news")}
            className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
              activeSubTab === "news" 
                ? "bg-[#ff5722] text-white" 
                : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>⚡ {isTa ? "செய்திகள்" : "News"}</span>
            <span className="text-[10px] opacity-80">({newsList.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs">
              {isTa ? "அறிவிப்புகளை ஏற்றுகிறது..." : "Loading notifications..."}
            </div>
          ) : (
            <>
              {/* Announcements Section */}
              {(activeSubTab === "all" || activeSubTab === "announcements") && announcements.map((a) => (
                <div key={`ann-${a.id}`} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0055ff] border border-blue-200">
                      📢 {isTa ? "அலுவலக அறிவிப்பு" : "ANNOUNCEMENT"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#061b36] leading-snug">
                    {a.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {a.content}
                  </p>
                </div>
              ))}

              {/* Breaking News Section */}
              {(activeSubTab === "all" || activeSubTab === "news") && newsList.map((n) => (
                <div 
                  key={`news-${n.id}`} 
                  onClick={() => {
                    if (onNavigateNews) {
                      onNavigateNews();
                      onClose();
                    }
                  }}
                  className="pt-3 first:pt-0 space-y-1.5 cursor-pointer group hover:bg-slate-50/60 p-2 rounded-xl transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#ff5722] border border-orange-200">
                      ⚡ {isTa ? "மின்னல் செய்தி" : "BREAKING NEWS"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString() : "")}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#061b36] group-hover:text-[#0055ff] transition-colors leading-snug">
                    {n.title}
                  </h4>
                  {n.summary && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {n.summary}
                    </p>
                  )}
                  <div className="flex items-center space-x-1 text-[11px] font-black text-[#0055ff] pt-0.5">
                    <span>{isTa ? "முழு செய்தியை படிக்க" : "Read Full Story"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}

              {announcements.length === 0 && newsList.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                  {isTa ? "தற்போது புதிய அறிவிப்புகள் எதுவும் இல்லை." : "No new notifications at this time."}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              if (onNavigateNews) onNavigateNews();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>{isTa ? "மின்னல் செய்திகள் பக்கத்திற்கு செல்ல" : "View Minnal Seithigal News Feed"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
