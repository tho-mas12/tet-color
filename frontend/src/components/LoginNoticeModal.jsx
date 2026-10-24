import React from "react";
import { X, ExternalLink, Bell, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginNoticeModal({
  isOpen,
  onClose,
  popupSettings,
  lang = "ta"
}) {
  if (!isOpen || !popupSettings || !popupSettings.popup_enabled) return null;

  const isTa = lang === "ta";
  const {
    popup_type = "image_text",
    popup_title = "",
    popup_content = "",
    popup_image_url = "",
    popup_button_text = "",
    popup_button_link = ""
  } = popupSettings;

  const handleActionClick = () => {
    if (popup_button_link && popup_button_link.trim()) {
      window.open(popup_button_link.trim(), "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  const isImageOnly = popup_type === "image";
  const isTextOnly = popup_type === "text";
  const isImageAndText = popup_type === "image_text" || (!isImageOnly && !isTextOnly);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95"
          title={isTa ? "மூடு" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>

        {/* IMAGE ONLY MODE */}
        {isImageOnly && popup_image_url && (
          <div className="relative overflow-y-auto">
            {popup_button_link ? (
              <a 
                href={popup_button_link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={onClose}
                className="block cursor-pointer group"
              >
                <img
                  src={popup_image_url}
                  alt={popup_title || "Notice"}
                  className="w-full h-auto object-contain max-h-[80vh] group-hover:opacity-95 transition-opacity"
                />
              </a>
            ) : (
              <img
                src={popup_image_url}
                alt={popup_title || "Notice"}
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            )}
            
            {/* Optional Bottom Dismiss Bar */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
              {popup_button_text && popup_button_link ? (
                <button
                  onClick={handleActionClick}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>{popup_button_text}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center"
                >
                  {isTa ? "மூடு (Close)" : "Close"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TEXT ONLY OR COMBINED IMAGE + TEXT MODE */}
        {!isImageOnly && (
          <div className="flex flex-col overflow-y-auto">
            {/* Header Image if combined */}
            {isImageAndText && popup_image_url && (
              <div className="w-full max-h-56 sm:max-h-64 overflow-hidden relative bg-slate-100">
                <img
                  src={popup_image_url}
                  alt={popup_title || "Notice Banner"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}

            {/* Content Container */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Top Accent Badge */}
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0055ff] border border-blue-200 flex items-center space-x-1.5 shadow-2xs">
                  <Bell className="w-3 h-3 text-[#0055ff]" />
                  <span>{isTa ? "முக்கிய அறிவிப்பு" : "Notice / Announcement"}</span>
                </span>
              </div>

              {/* Title */}
              {popup_title && (
                <h3 className="text-base sm:text-lg font-black text-[#061b36] tracking-tight leading-snug">
                  {popup_title}
                </h3>
              )}

              {/* Message / Description */}
              {popup_content && (
                <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  {popup_content}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                {popup_button_text && (
                  <button
                    onClick={handleActionClick}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{popup_button_text}</span>
                    {popup_button_link && <ExternalLink className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className={`${popup_button_text ? "px-4" : "w-full"} py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center`}
                >
                  {isTa ? "மூடு" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
