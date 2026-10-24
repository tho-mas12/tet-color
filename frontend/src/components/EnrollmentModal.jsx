import React, { useState } from "react";
import { 
  X, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  CreditCard,
  AlertCircle,
  Loader2,
  Tag,
  Sparkles,
  Percent,
  BookOpen,
  Check
} from "lucide-react";
import { fetchApi } from "../api";

export default function EnrollmentModal({ 
  isOpen, 
  onClose, 
  user, 
  onEnrollmentSuccess, 
  coursePrice = 999, 
  originalPrice = 2499,
  discountPercent = 60,
  razorpayKey = "", 
  lang = "en" 
}) {
  const isTa = lang === "ta";

  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [designation, setDesignation] = useState("TET Aspirant");
  const [selectedCourse, setSelectedCourse] = useState("TET 1 and TET 2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activatedWhatsApp, setActivatedWhatsApp] = useState(null);

  if (!isOpen) return null;

  const courseBasePrice = coursePrice || 999;
  const courseOriginalPrice = originalPrice || 2499;

  // Load Razorpay Script dynamically if needed
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(isTa ? "உங்கள் பெயரை உள்ளிடவும்" : "Please enter your full name");
      return;
    }
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      setError(isTa ? "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்" : "Please enter a valid 10-digit mobile number");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(isTa ? "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்" : "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Register Enrollment Lead
      const res = await fetchApi("/enrollments/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim().toLowerCase(),
          designation,
          amount: courseBasePrice,
          coupon_code: null,
          course_name: selectedCourse
        })
      });

      if (res && res.already_active) {
        if (onEnrollmentSuccess) onEnrollmentSuccess();
        const hasGrp = (res.whatsapp_groups && res.whatsapp_groups.length > 0) || (res.whatsapp_group_link && res.whatsapp_group_enabled !== false);
        if (hasGrp) {
          setActivatedWhatsApp({
            groups: res.whatsapp_groups || [],
            link: res.whatsapp_group_link,
            title: res.whatsapp_group_title || "TET VIP Teachers Community"
          });
          return;
        }
        setSuccessMsg(isTa ? "உங்கள் சேர்க்கை ஏற்கனவே செயலில் உள்ளது!" : "Your access is already active!");
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
        return;
      }

      const activeRazorpayKey = res.razorpay_key || razorpayKey;

      // 2. If Razorpay Key is provided and configured
      if (activeRazorpayKey && activeRazorpayKey.startsWith("rzp_")) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError(isTa ? "பணம் செலுத்தும் நுழைவாயிலை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Failed to load payment gateway. Please try again.");
          setLoading(false);
          return;
        }

        const payablePaise = Math.round((res.amount !== undefined ? res.amount : courseBasePrice) * 100);

        const options = {
          key: activeRazorpayKey,
          amount: payablePaise, // in paise
          currency: res.currency || "INR",
          name: "TN Teachers Eligibility Benchmark Portal",
          description: "All-in-One Pass: TET 1 + TET 2 + Live Interactive Classes",
          image: "/favicon.png",
          order_id: res.order_id || undefined,
          handler: async function (response) {
            try {
              setLoading(true);
              const verifyRes = await fetchApi("/enrollments/verify-payment", {
                method: "POST",
                body: JSON.stringify({
                  enrollment_id: res.enrollment_id,
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id || res.order_id,
                  signature: response.razorpay_signature
                })
              });
              if (onEnrollmentSuccess) onEnrollmentSuccess();

              const hasVerifyGrp = (verifyRes?.whatsapp_groups && verifyRes.whatsapp_groups.length > 0) || (verifyRes?.whatsapp_group_link && verifyRes?.whatsapp_group_enabled !== false);
              if (hasVerifyGrp) {
                setActivatedWhatsApp({
                  groups: verifyRes.whatsapp_groups || [],
                  link: verifyRes.whatsapp_group_link,
                  title: verifyRes.whatsapp_group_title || "TET VIP Teachers Community"
                });
              } else {
                setSuccessMsg(isTa ? "கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது! அனைத்து தொகுதிகளும் திறக்கப்பட்டன." : "Payment successful! All modules have been unlocked.");
                setTimeout(() => {
                  if (onClose) onClose();
                }, 1800);
              }
            } catch (err) {
              setError(err.message || (isTa ? "கட்டண சரிபார்ப்பில் பிழை ஏற்பட்டது." : "Payment verification failed."));
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: name.trim(),
            email: email.trim(),
            contact: cleanMobile
          },
          theme: {
            color: "#0055ff"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (failResponse) {
          setError(failResponse.error?.description || (isTa ? "கட்டணம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : "Payment failed. Please try again."));
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
      } else {
        // Razorpay API key is not yet configured by admin or test mode
        setSuccessMsg(
          isTa 
            ? "உங்கள் விவரங்கள் வெற்றிகரமாக பதிவு செய்யப்பட்டன! நிர்வாகி சரிபார்த்து அணுகலை உடனே செயல்படுத்துவார்."
            : "Enrollment details registered successfully! Administrator will verify and activate your access shortly."
        );
        setTimeout(() => {
          if (onEnrollmentSuccess) onEnrollmentSuccess();
          if (onClose) onClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.message || (isTa ? "பதிவு செய்வதில் பிழை ஏற்பட்டது." : "Failed to register enrollment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      {activatedWhatsApp ? (
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border-2 border-emerald-400 flex flex-col max-h-[95vh] relative animate-scale-in">
          {/* Top Celebration Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white p-6 relative text-center">
            <button
              onClick={() => {
                if (onEnrollmentSuccess) onEnrollmentSuccess();
                if (onClose) onClose();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white/20 border border-white/30 text-white mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>{isTa ? "கட்டணம் வெற்றிகரமாக பெறப்பட்டது!" : "Payment Verified & Activated!"}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {isTa ? "🎉 வாழ்த்துகள்! அனைத்து தொகுதிகளும் திறக்கப்பட்டன" : "🎉 Congratulations! Full Pass Activated"}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1.5 leading-relaxed">
              {isTa 
                ? "TET 1, TET 2 மற்றும் ஆன்லைன் நேரலை வகுப்புகள் அனைத்தும் இப்போது உங்கள் கணக்கில் முழுமையாக பயன்பாட்டிற்கு வந்துள்ளன!"
                : "TET Paper 1, Paper 2, and Online Live Classes are now fully active on your account!"}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>TET 1 (CLASSES 1-8) UNLOCKED</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>TET 2 (CLASSES 6-12) UNLOCKED</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-400/40 text-emerald-100 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>LIVE CLASSES ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <svg className="w-9 h-9 fill-white" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                </svg>
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
                  {isTa ? "பிரத்யேக ஆசிரியர்கள் குழு" : "Official WhatsApp Community"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {activatedWhatsApp.title || "TET 2026 VIP Study Group"}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed px-2">
                {isTa 
                  ? "தினசரி தேர்வு அறிவிப்புகள், நேரலை வகுப்புகளுக்கான கூகுள் மீட் இணைப்புகள் மற்றும் சுருக்கக் குறிப்புகளை உடனுக்குடன் பெற கீழே உள்ள பட்டனைத் தொட்டு உடனே வாட்ஸ்அப் குழுவில் இணையுங்கள்!"
                  : "Join the VIP WhatsApp group to get daily Google Meet class links, timely practice tests, important circulars & short notes directly!"}
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

            <div className="space-y-2 pt-1">
              {activatedWhatsApp.groups && activatedWhatsApp.groups.filter(g => g.enabled !== false && g.link).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1">
                    {isTa ? "உங்கள் பாடப்பிரிவு வாட்ஸ்அப் குழுவில் இணையவும்:" : "Choose your subject track to join WhatsApp:"}
                  </p>
                  {activatedWhatsApp.groups.filter(g => g.enabled !== false && g.link).map((grp, idx) => (
                    <button
                      key={grp.key || idx}
                      onClick={() => {
                        try {
                          localStorage.setItem("tet_wa_joined", "true");
                        } catch (e) {}
                        window.open(grp.link, "_blank", "noopener,noreferrer");
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5 text-left">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                        <div>
                          <div className="font-black text-sm">{grp.title}</div>
                          <div className="text-[10px] text-emerald-100 font-medium">
                            {grp.badge || (grp.key === "paper1" ? "Classes 1-5" : grp.key === "paper2_math" ? "Math & Science" : "Social Science")}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] bg-white/20 px-3 py-1.5 rounded-xl font-bold border border-white/20 shrink-0">
                        Join ↗
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem("tet_wa_joined", "true");
                    } catch (e) {}
                    window.open(activatedWhatsApp.link || "https://chat.whatsapp.com/", "_blank", "noopener,noreferrer");
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h-.18zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                  </svg>
                  <span>{isTa ? "வாட்ஸ்அப் குழுவில் இப்போதே இணையுங்கள் ↗" : "Join VIP WhatsApp Group ↗"}</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (onEnrollmentSuccess) onEnrollmentSuccess();
                  if (onClose) onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {isTa ? "டேஷ்போர்டிற்குத் செல்லவும் (Continue to Dashboard)" : "Continue to Dashboard"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
            {isTa 
              ? "குறிப்பு: குழு உறுப்பினர் வரம்புக்கேற்ப இணைப்புகள் நிர்வாகியால் உடனுக்குடன் புதுப்பிக்கப்படும்."
              : "Note: Group links are dynamically managed by administrators."}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] relative animate-scale-in">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#061b36] via-[#003db3] to-[#0055ff] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400 text-slate-900 flex items-center space-x-1 shadow-xs">
              <Award className="w-3 h-3" />
              <span>ALL-IN-ONE PASS</span>
            </span>
            <span className="text-sky-200 text-xs font-semibold">TET 2026 Batch</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {isTa ? "முழுமையான ஆசிரியர் தகுதித் தேர்வு அணுகல்" : "Unlock Complete TNTET Comprehensive Pass"}
          </h2>
          <p className="text-xs text-sky-100 font-medium mt-1 leading-relaxed">
            {isTa 
              ? "ஒருமுறை சேர்த்தால் TET 1, TET 2 மற்றும் நேரலை வகுப்புகள் ஆகிய 3 பிரிவுகளும் முழுமையாக திறக்கப்படும்!"
              : "Pay for any one module to unlock all 3: TET Paper 1, TET Paper 2, and Online Live Classes!"}
          </p>
        </div>

        {/* Benefits Highlights Strip */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-5 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-bold text-slate-700">
          <div className="flex items-center space-x-1.5 text-blue-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>TET Paper 1 (1–8)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>TET Paper 2 (6–12)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-900 col-span-2 sm:col-span-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Online Live Classes</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center space-x-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "முழு பெயர் (Full Name)" : "Full Name"} *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTa ? "உங்கள் பெயரை உள்ளிடவும்" : "e.g. S. Murugan"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "மொபைல் எண் (WhatsApp Mobile)" : "Mobile Number"} *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "மின்னஞ்சல் முகவரி (Email Address)" : "Email Address"} *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Target Course / Primary Preparation Goal */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "முதன்மை தேர்வு / கற்றல் தேவை (Target Course)" : "Select Target Course"} *</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#061b36] focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="TET 1">TET 1 (Classes 1 to 8 — Paper 1)</option>
                <option value="TET 2">TET 2 (Classes 6 to 12 — Paper 2)</option>
                <option value="TET 1 and TET 2">TET 1 and TET 2 (Both Papers)</option>
              </select>
              <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center space-x-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isTa 
                    ? "முழு அணுகல்: நீங்கள் எதைத் தேர்ந்தெடுத்தாலும், ஒரே கட்டணத்தில் TET 1, TET 2 மற்றும் அனைத்து சிறப்பு வகுப்புகளும் திறக்கப்படும்." 
                    : "Complete Access: Enrolling gives you full access to TET 1, TET 2, and all live & special modules."}
                </span>
              </p>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "பதவி / விவரம் (Designation)" : "Current Designation"}</span>
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="TET Aspirant">TET Aspirant / B.Ed / D.El.Ed Candidate</option>
                <option value="Secondary Grade Teacher (SGT)">Secondary Grade Teacher (SGT)</option>
                <option value="B.T. Assistant Teacher">B.T. Assistant Teacher</option>
                <option value="Post Graduate Teacher (PG)">Post Graduate Teacher (PG)</option>
                <option value="Private School Teacher">Private School Teacher</option>
                <option value="Other">Other / Self Learner</option>
              </select>
            </div>

            {/* Price Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Course MRP</span>
                <span className="line-through text-slate-400">₹{courseOriginalPrice}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Standard Portal Fee</span>
                <span className="font-bold text-slate-700">₹{courseBasePrice}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {isTa ? "செலுத்த வேண்டிய தொகை (Total Payable)" : "Total Investment"}
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-[#061b36]">₹{courseBasePrice}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {isTa ? "(முழு அணுகல்)" : "(One-Time Full Access)"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-[#0055ff] border border-blue-200">
                    {Math.round(((courseOriginalPrice - courseBasePrice) / courseOriginalPrice) * 100)}% Launch Offer
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0055ff] to-[#0284c7] hover:from-[#0047d4] hover:to-[#0274b0] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isTa ? "செயலாக்குகிறது..." : "Processing Enrollment..."}</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isTa 
                      ? `பாதுகாப்பான கட்டணம் செலுத்த தொடர்க (₹${courseBasePrice})`
                      : `PROCEED TO SECURE PAYMENT (₹${courseBasePrice})`}
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center font-medium">
            🔒 Secured via 256-bit SSL encryption. Instant activation upon verification.
          </p>
        </div>
      </div>
    )}
  </div>
);
}
