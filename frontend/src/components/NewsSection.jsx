import React, { useState, useEffect } from "react";
import { 
  Zap, 
  RefreshCw, 
  Share2, 
  ExternalLink, 
  Clock, 
  X, 
  ChevronUp, 
  ChevronDown, 
  BookOpen, 
  Newspaper,
  Maximize2,
  Sparkles
} from "lucide-react";
import { fetchApi } from "../api";

export default function NewsSection({ lang = "ta" }) {
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFullNews, setActiveFullNews] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const DRIVE_API = "https://script.google.com/macros/s/AKfycbxMexRa77406z3_CmqK55FPxeP9QHkbJDmCgC1A7eA2omJ8MJDwJ8t_GKs-grA9DpgvkA/exec?action=news&_=";

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (currentFilter === "all") {
      setFilteredNews(newsList);
    } else {
      setFilteredNews(newsList.filter(n => (n.category || "").toLowerCase() === currentFilter.toLowerCase()));
    }
  }, [currentFilter, newsList]);

  const loadNews = async () => {
    setLoading(true);
    try {
      let data = await fetchApi("/news");
      if (Array.isArray(data) && data.length > 0) {
        setNewsList(data);
      } else {
        const res = await fetch(DRIVE_API + Date.now(), { cache: "no-store" });
        const driveData = await res.json();
        if (driveData && driveData.ok && Array.isArray(driveData.news)) {
          setNewsList(driveData.news);
        }
      }
    } catch (err) {
      console.warn("News load fallback:", err);
      setNewsList(getDefaultNews());
    } finally {
      setLoading(false);
    }
  };

  const handleLiveAiRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetchApi("/news/ai-live", { method: "POST" });
      if (res && res.news && Array.isArray(res.news)) {
        setNewsList(prev => [...res.news, ...prev.filter(p => !res.news.some(n => n.id === p.id))]);
      } else {
        await loadNews();
      }
    } catch (err) {
      await loadNews();
    } finally {
      setRefreshing(false);
    }
  };

  const getDefaultNews = () => [
    {
      id: "def_1",
      title: "TN TET Paper 2 - மாதிரித் தேர்வு வினா விடைகள் & வழிகாட்டுதல்கள் வெளியீடு",
      description: "தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு (TNTET Paper 2) தயாரிப்பில் ஈடுபட்டுள்ள பட்டதாரி ஆசிரியர்களுக்கான மாதிரித் தேர்வுகள் மற்றும் 80% தேர்ச்சி மதிப்பெண் வழிகாட்டுதல்கள் வெளியிடப்பட்டுள்ளன. பாடவாரியான மாதிரி வினாத்தாள்களை போர்ட்டலில் இருந்து நேரடியாக PDF வடிவில் பதிவிறக்கம் செய்து பயிலலாம்.",
      category: "education",
      source: "TN TET தேர்வு மையம்",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
      link: "#",
      pubDate: new Date().toISOString()
    },
    {
      id: "def_2",
      title: "ஆசிரியர் தேர்வு வாரியம் (TRB) - பட்டதாரி ஆசிரியர் காலிப்பணியிடங்கள் பாடத்திட்ட சுற்றறிக்கை",
      description: "பள்ளி கல்வித்துறை சார்பில் ஆசிரியர் தேர்வு வாரியம் வழியாக நிரப்பப்பட உள்ள காலிப்பணியிடங்களுக்கு 6 முதல் 12 ஆம் வகுப்பு வரையிலான தமிழ்நாடு அரசு சமச்சீர் கல்வி பாடப்புத்தகங்களின் முக்கியத்துவம் மீண்டும் வலியுறுத்தப்பட்டுள்ளது. மாதிரிப் பயிற்சிகள் மூலம் ஆசிரியர்கள் தேர்ச்சி பெற வாய்ப்பு.",
      category: "education",
      source: "பள்ளிக் கல்வித்துறை",
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
      link: "#",
      pubDate: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const handleShare = (news) => {
    const text = `${news.title}\n\n${news.description || ""}\n\n- மின்னல் செய்திகள் (TN Teacher Platform)`;
    if (navigator.share) {
      navigator.share({ title: news.title, text, url: window.location.href }).catch(() => null);
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + window.location.href)}`;
      window.open(waUrl, "_blank");
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "சமீபத்தில்";
    try {
      const d = new Date(dateStr);
      const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMins < 60) return `${Math.max(1, diffMins)} நிமிடம் முன்பு`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} மணிநேரம் முன்பு`;
      return `${Math.floor(diffHours / 24)} நாள் முன்பு`;
    } catch {
      return "சமீபத்தில்";
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5722] to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black text-[#061b36] tracking-tight">
                மின்னல் செய்திகள்
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-950 border border-orange-200">
                LIVE NEWS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              கல்வித்துறை, TET/TRB அறிவிப்புகள் மற்றும் உடனுக்குடன் நேரலைச் செய்திகள்
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCurrentFilter("all")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                currentFilter === "all" ? "bg-white text-[#ff5722] shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              அனைத்தும்
            </button>
            <button
              onClick={() => setCurrentFilter("education")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                currentFilter === "education" ? "bg-white text-[#ff5722] shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              கல்வி & TET
            </button>
          </div>

          <button
            onClick={handleLiveAiRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff5722] text-xs font-bold border border-orange-200 transition cursor-pointer"
            title="AI நேரலை செய்திகளைப் புதுப்பிக்க"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">AI Update</span>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#ff5722] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">செய்திகள் ஏற்றப்படுகின்றன...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">
          செய்திகள் எதுவும் கிடைக்கவில்லை.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredNews.slice(0, 6).map((news, idx) => (
            <div
              key={news.id || idx}
              className="group flex flex-col justify-between bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div>
                {/* News Image */}
                {news.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => setFullScreenImage(news.imageUrl)}
                      loading="lazy"
                    />
                    <button
                      onClick={() => setFullScreenImage(news.imageUrl)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 transition"
                      title="முழுத்திரை"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/70 text-white backdrop-blur-xs">
                      {news.source || "மின்னல் செய்தி"}
                    </span>
                  </div>
                )}

                {/* News Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{formatTimeAgo(news.pubDate)}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#061b36] line-clamp-2 leading-snug group-hover:text-[#ff5722] transition-colors">
                    {news.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed text-justify font-medium">
                    {news.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-white/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveFullNews(news)}
                  className="text-xs font-bold text-[#ff5722] hover:text-orange-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>முழுவதும் படிக்க</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleShare(news)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                  title="பகிர்க"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL NEWS MODAL (Inshorts Style Reader) */}
      {activeFullNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#111] text-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/50">
              <span className="text-xs font-bold text-orange-400 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 fill-orange-400" />
                <span>{activeFullNews.source || "மின்னல் செய்திகள்"}</span>
              </span>
              <button
                onClick={() => setActiveFullNews(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {activeFullNews.imageUrl && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-white/5">
                  <img
                    src={activeFullNews.imageUrl}
                    alt={activeFullNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{formatTimeAgo(activeFullNews.pubDate)}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                  {activeFullNews.category || "கல்வி"}
                </span>
              </div>

              <h2 className="text-lg font-black leading-snug text-white">
                {activeFullNews.title}
              </h2>

              <p className="text-sm text-white/80 leading-relaxed text-justify whitespace-pre-line font-medium">
                {activeFullNews.description}
              </p>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
              <span className="text-xs text-white/50">TN Teacher Platform - Live Feed</span>
              <button
                onClick={() => handleShare(activeFullNews)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>பகிர்க (Share)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULL SCREEN IMAGE OVERLAY */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullScreenImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}

    </div>
  );
}
