import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  RefreshCw, 
  Share2, 
  Clock, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Maximize2, 
  ExternalLink,
  Download,
  Copy,
  Check,
  Newspaper,
  BookOpen
} from "lucide-react";
import { fetchApi } from "../api";

export default function MinnalNewsMobile({ onClose, isModal = true, lang = "ta" }) {
  const [newsData, setNewsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFullNews, setActiveFullNews] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(null); // news index
  const [toastMsg, setToastMsg] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const scrollBoxRef = useRef(null);
  const DRIVE_API = "https://script.google.com/macros/s/AKfycbxMexRa77406z3_CmqK55FPxeP9QHkbJDmCgC1A7eA2omJ8MJDwJ8t_GKs-grA9DpgvkA/exec";

  // Helper Date & Time formatters
  const formatDateShort = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("en-IN", { 
        timeZone: "Asia/Kolkata", 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
      }).format(d);
    } catch {
      return "";
    }
  };

  const formatExactTime = (value) => {
    if (!value) return "நேரம் தெரியவில்லை";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "நேரம் தெரியவில்லை";
      return new Intl.DateTimeFormat("en-IN", { 
        timeZone: "Asia/Kolkata", 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true 
      }).format(d).toLowerCase();
    } catch {
      return "நேரம் தெரியவில்லை";
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  // Data fetching
  const loadNews = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      // 1. Try Google Apps Script Drive API
      const res = await fetch(`${DRIVE_API}?action=news&_=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.news) && data.news.length > 0) {
        processNews(data.news);
        return;
      }
    } catch (e) {
      console.warn("Drive API fetch failed, trying backend fallback...", e);
    }

    try {
      // 2. Fallback to local backend /api/news
      const fallback = await fetchApi("/news");
      if (Array.isArray(fallback) && fallback.length > 0) {
        processNews(fallback);
        return;
      }
    } catch (e) {
      console.warn("Backend news fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const processNews = (rawList) => {
    // Deduplicate and sort
    const unique = [];
    const seenTitles = new Set();
    for (const item of rawList) {
      const titleKey = (item.title || "").trim().toLowerCase();
      if (!titleKey || seenTitles.has(titleKey)) continue;
      seenTitles.add(titleKey);
      unique.push({
        ...item,
        category: (item.category || "general").toLowerCase()
      });
    }

    unique.sort((a, b) => {
      const da = new Date(a.pubDate || 0);
      const db = new Date(b.pubDate || 0);
      return db - da;
    });

    setNewsData(unique);
    setLoading(false);
  };

  useEffect(() => {
    loadNews(true);
  }, []);

  // Filter application
  useEffect(() => {
    let result = newsData;
    if (currentFilter === "education") {
      result = newsData.filter(n => n.category === "education" || (n.title || "").includes("TET") || (n.title || "").includes("பள்ளி") || (n.title || "").includes("தேர்வு") || (n.title || "").includes("கல்வி"));
    }
    setFilteredData(result);
    setCurrentIndex(0);
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = 0;
    }
  }, [currentFilter, newsData]);

  // Track scroll position to update current card index
  const handleScroll = () => {
    if (!scrollBoxRef.current) return;
    const box = scrollBoxRef.current;
    const height = box.clientHeight;
    if (height <= 0) return;
    const idx = Math.round(box.scrollTop / height);
    if (idx !== currentIndex && idx >= 0 && idx < filteredData.length) {
      setCurrentIndex(idx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeFullNews || fullScreenImage) {
        if (e.key === "Escape") {
          setActiveFullNews(null);
          setFullScreenImage(null);
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      } else if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredData.length, activeFullNews, fullScreenImage]);

  const scrollToIndex = (idx) => {
    if (idx < 0 || idx >= filteredData.length || !scrollBoxRef.current) return;
    const box = scrollBoxRef.current;
    const targetY = idx * box.clientHeight;
    box.scrollTo({ top: targetY, behavior: "smooth" });
    setCurrentIndex(idx);
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadNews(false);
    showToast("செய்திகள் புதுப்பிக்கப்பட்டன");
    setRefreshing(false);
  };

  // Share handlers
  const handleWhatsAppShare = (news) => {
    const shareText = `${news.title}\n\n${news.description || ""}\n\n- மின்னல் செய்திகள் (https://tnteachers.in)`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  const handleFacebookShare = (news) => {
    const shareUrl = encodeURIComponent(news.link || window.location.href);
    const quote = encodeURIComponent(`${news.title}\n\n${news.description || ""}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`, "_blank");
  };

  const handleCopyText = (news, index) => {
    const text = `${news.title}\n\n${news.description || ""}\n\n- மின்னல் செய்திகள் (https://tnteachers.in)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showToast("உரை நகலெடுக்கப்பட்டது");
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleDownloadText = (news) => {
    const text = `மின்னல் செய்திகள்\n\n${news.title}\n\n${news.fullText || news.description || ""}\n\nமூலம்: ${news.source || "மின்னல்"}\nதேதி: ${news.pubDate || ""}\nhttps://tnteachers.in`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minnal-news-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("செய்தி கோப்பு பதிவிறக்கப்பட்டது");
  };

  return (
    <div className={`relative ${isModal ? "fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" : "w-full h-screen"}`}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-2xl z-[100] animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* PHONE FRAME CONTAINER (Matching minnal-news-mobile (1).html) */}
      <div className="w-full h-full max-w-[480px] sm:max-h-[92vh] sm:rounded-3xl bg-[#0a0a0a] text-white relative flex flex-col overflow-hidden shadow-2xl border border-white/10">
        
        {/* TOP BAR */}
        <div className="h-12 px-3 sm:px-4 flex items-center justify-between bg-black/90 backdrop-blur-md border-b border-white/10 z-30 shrink-0">
          
          {/* App Title */}
          <div className="flex items-center space-x-1.5 cursor-pointer font-black text-xs sm:text-sm text-[#ff5722] tracking-wide select-none">
            <Zap className="w-4 h-4 fill-[#ff5722]" />
            <span>மின்னல் செய்திகள்</span>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentFilter("all")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentFilter === "all"
                  ? "bg-[#ff5722] text-white shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              ALL News
            </button>

            <button
              onClick={() => setCurrentFilter("education")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentFilter === "education"
                  ? "bg-[#ff5722] text-white shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              கல்வி
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff5722] to-[#e64a19] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="புதுப்பிக்க (Refresh)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Close Modal Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-1"
                title="மூடு (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* VERTICAL SCROLL SNAP CONTAINER */}
        <div
          ref={scrollBoxRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="w-10 h-10 border-3 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-200">செய்திகள் ஏற்றப்படுகின்றன...</p>
              <p className="text-xs text-slate-500">இன்றைய நேரலை மின்னல் செய்திகள்</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
              <Newspaper className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-bold">இந்த வகையில் இன்று செய்திகள் இல்லை</p>
              <p className="text-xs text-slate-600">புதுப்பிக்க Refresh பட்டனை அழுத்தவும்.</p>
            </div>
          ) : (
            filteredData.map((news, index) => {
              const imgUrl = news.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80";
              const safeTitle = news.title || "செய்தி";
              const descText = news.description || news.fullText || "";

              return (
                <div
                  key={news.id || `${news.title}-${index}`}
                  className="w-full h-full snap-start flex flex-col justify-between bg-[#111] overflow-hidden relative"
                  style={{ minHeight: "100%" }}
                >
                  {/* TOP IMAGE SECTION (46% - 50% Height) */}
                  <div className="w-full h-[46%] bg-[#1a1a1a] relative overflow-hidden shrink-0">
                    <img
                      src={imgUrl}
                      alt={safeTitle}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setFullScreenImage(imgUrl)}
                      onError={(e) => {
                        e.target.style.opacity = "0.3";
                      }}
                    />
                    
                    {/* Bottom Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />

                    {/* Expand Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenImage(imgUrl);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center text-xs backdrop-blur-xs cursor-pointer hover:bg-black/80 transition-all"
                      title="முழுத்திரையில் காண"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* BOTTOM CONTENT SECTION (50% - 54% Height) */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-[#111] overflow-hidden">
                    
                    {/* Title & 12-Line Clamped Description */}
                    <div className="space-y-2 overflow-hidden">
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-3">
                        {safeTitle}
                      </h2>

                      <p 
                        className="text-xs sm:text-[13px] text-[#ccc] leading-relaxed text-justify"
                        style={{ 
                          textAlign: "justify",
                          display: "-webkit-box",
                          WebkitLineClamp: 12,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {descText}
                      </p>

                      <button
                        onClick={() => setActiveFullNews(news)}
                        className="text-xs font-bold text-[#4fc3f7] hover:text-[#81d4fa] inline-flex items-center space-x-1 pt-1 cursor-pointer"
                      >
                        <span>முழு செய்தியைப் படிக்க</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* FOOTER BAR (Single Line Locked) */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-1.5 text-xs text-slate-400 shrink-0">
                      
                      {/* Time Ago */}
                      <div className="flex items-center space-x-1 truncate min-w-0 pr-1">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-[11px] truncate text-slate-400">
                          {formatDateShort(news.pubDate)} · {formatExactTime(news.pubDate)}
                        </span>
                      </div>

                      {/* Right Control Group */}
                      <div className="flex items-center space-x-1.5 shrink-0 relative">
                        {/* Page count pill */}
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ff5722]/15 text-[#ffab91]">
                          {index + 1}/{filteredData.length}
                        </span>

                        {/* WhatsApp Share Button */}
                        <div className="relative">
                          <button
                            onClick={() => setShowShareMenu(showShareMenu === index ? null : index)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] shadow-xs cursor-pointer transition-all"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>பகிர்</span>
                          </button>

                          {/* Share Options Popup Menu */}
                          {showShareMenu === index && (
                            <div className="absolute bottom-9 right-0 bg-[#1e1e1e] border border-white/20 rounded-xl p-1.5 min-w-[140px] shadow-2xl z-40 space-y-1 animate-fade-in">
                              <button
                                onClick={() => {
                                  setShowShareMenu(null);
                                  handleWhatsAppShare(news);
                                }}
                                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#25D366] hover:bg-white/10 text-left cursor-pointer"
                              >
                                <span>WhatsApp</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowShareMenu(null);
                                  handleFacebookShare(news);
                                }}
                                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1877F2] hover:bg-white/10 text-left cursor-pointer"
                              >
                                <span>Facebook</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowShareMenu(null);
                                  handleCopyText(news, index);
                                }}
                                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10 text-left cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedIndex === index ? "நகலெடுக்கப்பட்டது!" : "உரை நகலெடு"}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowShareMenu(null);
                                  handleDownloadText(news);
                                }}
                                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-white/10 text-left cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>பதிவிறக்கு</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Navigation Chevron Arrows */}
                        <div className="flex items-center space-x-1">
                          <button
                            disabled={index === 0}
                            onClick={() => scrollToIndex(index - 1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#ff5722]/80 text-white flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="முந்தைய செய்தி (Previous)"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            disabled={index === filteredData.length - 1}
                            onClick={() => scrollToIndex(index + 1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#ff5722]/80 text-white flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="அடுத்த செய்தி (Next)"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ================= FULL NEWS OVERLAY READER (Slide-Up) ================= */}
      {activeFullNews && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col animate-fade-in text-white">
          {/* Header */}
          <div className="bg-[#141414]/95 border-b border-white/15 px-4 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <span className="text-sm font-bold text-[#ff5722] flex items-center space-x-2">
              <Newspaper className="w-4 h-4" />
              <span>{activeFullNews.source || "மின்னல் செய்திகள்"}</span>
            </span>

            <button
              onClick={() => setActiveFullNews(null)}
              className="px-3.5 py-1.5 rounded-lg bg-[#ff5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              <span>மூடு</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full pb-10">
            {activeFullNews.imageUrl && (
              <div className="w-full h-64 bg-black relative overflow-hidden">
                <img
                  src={activeFullNews.imageUrl}
                  alt={activeFullNews.title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setFullScreenImage(activeFullNews.imageUrl)}
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
              </div>
            )}

            <div className="p-5 sm:p-7 space-y-4">
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {activeFullNews.title}
              </h1>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded-md bg-[#ff5722] text-white font-bold">
                  {activeFullNews.source || "மின்னல்"}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateShort(activeFullNews.pubDate)} · {formatExactTime(activeFullNews.pubDate)}</span>
                </span>
              </div>

              {/* Full Article Text */}
              <div className="text-sm sm:text-base text-[#e0e0e0] leading-relaxed space-y-3 font-normal" style={{ textAlign: "justify", whiteSpace: "pre-line" }}>
                {activeFullNews.fullText ? (
                  activeFullNews.fullText.split(/\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>{activeFullNews.description || "முழு விவரம் கிடைக்கவில்லை."}</p>
                )}
              </div>

              {activeFullNews.link && activeFullNews.link !== "#" && (
                <div className="pt-4 border-t border-white/10">
                  <a
                    href={activeFullNews.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#4fc3f7] hover:underline"
                  >
                    <span>முழு செய்தியைப் படிக்க</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN IMAGE MODAL ================= */}
      {fullScreenImage && (
        <div
          onClick={() => setFullScreenImage(null)}
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-2 cursor-pointer animate-fade-in"
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={fullScreenImage}
            alt="முழுத்திரைப் படம்"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
