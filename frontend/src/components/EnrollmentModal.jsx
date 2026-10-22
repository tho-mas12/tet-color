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
  BookOpen
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

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  if (!isOpen) return null;

  const courseBasePrice = selectedCourse === "TET 1 and TET 2" ? (coursePrice || 999) : 499;
  const courseOriginalPrice = selectedCourse === "TET 1 and TET 2" ? (originalPrice || 2499) : 1499;

  const effectivePrice = appliedCoupon ? appliedCoupon.final_amount : courseBasePrice;
  const couponSavings = appliedCoupon ? appliedCoupon.discount_amount : 0;

  // Handle Coupon Validation
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError(isTa ? "கூப்பன் குறியீட்டை உள்ளிடவும்" : "Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetchApi("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code: cleanCode,
          amount: courseBasePrice,
          email: email.trim().toLowerCase()
        })
      });

      if (res && res.valid) {
        setAppliedCoupon(res);
        setCouponSuccess(res.message || (isTa ? `கூப்பன் '${res.code}' வெற்றிகரமாக பயன்படுத்தப்பட்டது!` : `Coupon '${res.code}' applied successfully!`));
        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setCouponError(res?.message || (isTa ? "தவறான அல்லது காலாவதியான கூப்பன் குறியீடு" : "Invalid or expired coupon code"));
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message || (isTa ? "கூப்பனை சரிபார்க்க முடியவில்லை" : "Failed to validate coupon code"));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

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
      // 1. Register Enrollment Lead with Applied Coupon
      const res = await fetchApi("/enrollments/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim().toLowerCase(),
          designation,
          amount: effectivePrice,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          course_name: selectedCourse
        })
      });

      if (res && res.already_active) {
        setSuccessMsg(isTa ? "உங்கள் சேர்க்கை ஏற்கனவே செயலில் உள்ளது!" : "Your access is already active!");
        setTimeout(() => {
          if (onEnrollmentSuccess) onEnrollmentSuccess();
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

        const payablePaise = Math.round((res.amount !== undefined ? res.amount : effectivePrice) * 100);

        const options = {
          key: activeRazorpayKey,
          amount: payablePaise, // in paise
          currency: res.currency || "INR",
          name: "TN Teachers Eligibility Benchmark Portal",
          description: appliedCoupon 
            ? `TET All-in-One Pass (Coupon: ${appliedCoupon.code})`
            : "All-in-One Pass: TET 1 + TET 2 + Live Interactive Classes",
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
              setSuccessMsg(isTa ? "கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது! அனைத்து தொகுதிகளும் திறக்கப்பட்டன." : "Payment successful! All modules have been unlocked.");
              setTimeout(() => {
                if (onEnrollmentSuccess) onEnrollmentSuccess();
                if (onClose) onClose();
              }, 1800);
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

            {/* Target Course Dropdown: TET 1, TET 2, TET 1 and TET 2 */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{isTa ? "தேர்வுப் பிரிவு (Target Course)" : "Select Target Course"} *</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#061b36] focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="TET 1">TET 1 (Classes 1 to 8) — ₹499</option>
                <option value="TET 2">TET 2 (Classes 6 to 12) — ₹499</option>
                <option value="TET 1 and TET 2">TET 1 and TET 2 (All-in-One Combo) — ₹{coursePrice || 999}</option>
              </select>
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

            {/* ================= PROMO / COUPON CODE SECTION ================= */}
            <div className="pt-1">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#0055ff]" />
                  <span>{isTa ? "தள்ளுபடி கூப்பன் குறியீடு (Promo / Coupon Code)" : "Promo / Coupon Code"}</span>
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-600 font-black flex items-center space-x-0.5">
                    <Check className="w-3 h-3" />
                    <span>Applied</span>
                  </span>
                )}
              </label>

              {!appliedCoupon ? (
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder={isTa ? "எ.கா. TET2026, SAVE50" : "e.g. TET2026, SAVE50"}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-black transition cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    {validatingCoupon ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <span>{isTa ? "பயன்படுத்து" : "Apply"}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      %
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-emerald-950 tracking-wider uppercase">
                          {appliedCoupon.code}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-emerald-900">
                          {appliedCoupon.discount_type === "percent" ? `${appliedCoupon.discount_value}% OFF` : `₹${appliedCoupon.discount_value} OFF`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        {isTa ? `₹${couponSavings} தள்ளுபடி பெறப்பட்டது!` : `You saved ₹${couponSavings} on this course!`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-[11px] font-black cursor-pointer transition"
                  >
                    {isTa ? "நீக்கு ✕" : "Remove ✕"}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Price Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{selectedCourse === "TET 1 and TET 2" ? "Combo MRP" : "Course MRP"}</span>
                <span className="line-through text-slate-400">₹{courseOriginalPrice}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>{selectedCourse === "TET 1 and TET 2" ? "Combo Access (TET 1 & 2)" : `Single Course Pass (${selectedCourse})`}</span>
                <span className="font-bold text-slate-700">₹{courseBasePrice}</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold border-t border-dashed border-emerald-200 pt-1.5">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                  </span>
                  <span className="font-black">-₹{couponSavings}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {isTa ? "செலுத்த வேண்டிய தொகை (Total Payable)" : "Total Investment"}
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-[#061b36]">₹{effectivePrice}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {isTa ? "(முழு அணுகல்)" : "(One-Time Full Access)"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0055ff] border border-blue-200">
                    {appliedCoupon 
                      ? `${Math.round(((courseOriginalPrice - effectivePrice) / courseOriginalPrice) * 100)}% Total Savings`
                      : `${Math.round(((courseOriginalPrice - courseBasePrice) / courseOriginalPrice) * 100)}% Launch Offer`}
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
                      ? `பாதுகாப்பான கட்டணம் செலுத்த தொடர்க (₹${effectivePrice})`
                      : `PROCEED TO SECURE PAYMENT (₹${effectivePrice})`}
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
    </div>
  );
}
