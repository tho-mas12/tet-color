import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = "success" } = toast;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slide-in">
      <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start space-x-3 transition-all ${
        type === "error"
          ? "bg-red-900/90 text-white border-red-700"
          : "bg-[#1E3A8A]/95 text-white border-[#0284C7]/40"
      }`}>
        <div className="shrink-0 mt-0.5">
          {type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-300" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-sky-300" />
          )}
        </div>

        <div className="flex-1 text-xs font-semibold leading-relaxed">
          {message}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
