import React, { useState, useEffect } from "react";
import { Zap, Bell, ChevronRight, X, Volume2 } from "lucide-react";
import { fetchApi } from "../api";

export default function TopNotificationBar({ onOpenNews, lang = "ta" }) {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const list = [];

    // 1. Fetch latest news
    try {
      const news = await fetchApi("/news");
      if (Array.isArray(news) && news.length > 0) {
        list.push({
          type: "news",
          badge: lang === "ta" ? "⚡ முக்கியச் செய்தி" : "⚡ BREAKING NEWS",
          badgeColor: "bg-[#ff5722] text-white",
          text: news[0].title,
          action: "news"
        });
      }
    } catch (e) {
      // fallback news item
      list.push({
        type: "news",
        badge: lang === "ta" ? "⚡ நேரலை" : "⚡ LIVE",
        badgeColor: "bg-[#ff5722] text-white",
        text: "TET 2026 தேர்வுக்கான விரிவான 5-நிலை பாடத்திட்டம் & பயிற்சித் தேர்வுகள் நேரலை!",
        action: "news"
      });
    }

    // 2. Fetch latest announcement
    try {
      const annRes = await fetchApi("/admin/announcements");
      if (Array.isArray(annRes) && annRes.length > 0) {
        const topAnn = annRes[0];
        list.push({
          type: "announcement",
          badge: lang === "ta" ? "📢 முக்கிய அறிவிப்பு" : "📢 ANNOUNCEMENT",
          badgeColor: "bg-[#0055ff] text-white",
          text: `${topAnn.title} - ${topAnn.content?.substring(0, 80) || ""}`,
          action: "announcement"
        });
      }
    } catch (e) {
      list.push({
        type: "announcement",
        badge: lang === "ta" ? "📢 அறிவிப்பு" : "📢 NOTICE",
        badgeColor: "bg-[#0055ff] text-white",
        text: "TNTET 2026 பாடத்திட்டம் - 1 முதல் 12 ஆம் வகுப்பு பாடப்புத்தகங்கள் மற்றும் வினா விடைகள் பதிவேற்றம் செய்யப்பட்டுள்ளது.",
        action: "announcement"
      });
    }

    if (list.length > 0) {
      setItems(list);
    }
  };

  // Auto-cycle between news and announcements every 6 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (dismissed || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleClick = () => {
    if (currentItem.action === "news" && onOpenNews) {
      onOpenNews();
    } else if (onOpenNews) {
      onOpenNews();
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#0a192f] via-[#061b36] to-[#0a192f] text-white border-b border-sky-900/60 text-xs py-1.5 px-3 sm:px-6 relative z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left Badge & Animated Headline */}
        <div 
          onClick={handleClick}
          className="flex items-center space-x-2.5 overflow-hidden flex-1 cursor-pointer group"
        >
          <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-xs flex items-center space-x-1 ${currentItem.badgeColor}`}>
            <span>{currentItem.badge}</span>
          </span>

          <p className="font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate text-[11px] sm:text-xs">
            {currentItem.text}
          </p>

          <span className="hidden sm:inline-flex items-center space-x-0.5 text-[11px] font-bold text-sky-400 group-hover:underline shrink-0">
            <span>{lang === "ta" ? "முழு விபரம்" : "View"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 shrink-0 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
