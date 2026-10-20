import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";

// Official Google OAuth Client ID for TN Teacher Portal
const GOOGLE_CLIENT_ID = "942723196487-6jri08rmrd4g4ri3kn7a297hbatfov7p.apps.googleusercontent.com";

export default function AuthModal({ isOpen, onClose, onAuthSuccess, lang = "en" }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter New Password, 3 = Success
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Login / Register state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot / Reset Password state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryName, setRecoveryName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState("");

  // Google Sign-in state
  const [isGoogleModal, setIsGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleSdkReady, setGoogleSdkReady] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const t = translations[lang] || translations.en;
  const isTa = lang === "ta";

  // Standard Login / Register submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const user = await fetchApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), password }),
        });
        onAuthSuccess(user);
        if (onClose) onClose();
      } else {
        if (!name.trim()) {
          setError(isTa ? "உங்கள் முழுப் பெயரை உள்ளிடவும்." : "Please enter your full name.");
          setLoading(false);
          return;
        }
        const user = await fetchApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });
        onAuthSuccess(user);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.message || (isTa ? "உள்நுழைவு தோல்வியடைந்தது." : "Authentication failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-in manual submit handler (fallback)
  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      setError(isTa ? "சரியான கூகிள் மின்னஞ்சல் முகவரியை உள்ளிடவும்." : "Please enter a valid Google email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await fetchApi("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleName.trim() || "Google Candidate"
        })
      });
      onAuthSuccess(user);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || (isTa ? "கூகிள் உள்நுழைவு தோல்வியடைந்தது." : "Google sign-in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Google Identity Services Credential Handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setError(isTa ? "கூகிள் அனுமதி கிடைக்கவில்லை." : "Failed to obtain Google login credential.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let extractedEmail = "";
      let extractedName = "";
      try {
        const parts = response.credential.split(".");
        if (parts.length >= 2) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const parsed = JSON.parse(jsonPayload);
          extractedEmail = parsed.email || "";
          extractedName = parsed.name || parsed.given_name || "";
        }
      } catch (parseErr) {
        console.warn("Client JWT decode note:", parseErr);
      }

      const user = await fetchApi("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          credential: response.credential,
          email: extractedEmail,
          name: extractedName
        })
      });

      onAuthSuccess(user);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || (isTa ? "கூகிள் உள்நுழைவு தோல்வியடைந்தது." : "Google sign-in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let checkInterval = null;
    let attempts = 0;

    const setupGoogleGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleSdkReady(true);

          // Render official Google button into container if present
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "outline",
              size: "large",
              type: "standard",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 340
            });
          }
          if (checkInterval) clearInterval(checkInterval);
        } catch (e) {
          console.error("Error setting up Google GSI:", e);
        }
      }
    };

    setupGoogleGsi();

    if (!window.google?.accounts?.id) {
      checkInterval = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.id) {
          setupGoogleGsi();
        } else if (attempts > 20) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isOpen, isLogin, isForgotPassword, isGoogleModal]);

  const triggerGooglePrompt = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleModal(true);
          }
        });
      } catch (err) {
        setIsGoogleModal(true);
      }
    } else {
      setIsGoogleModal(true);
    }
  };

  // Forgot password step 1: Verify registered email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      setError(isTa ? "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்." : "Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      setRecoveryName(res.name || "");
      setForgotStep(2);
    } catch (err) {
      setError(err.message || (isTa ? "இந்த மின்னஞ்சலில் பதிவு செய்யப்பட்ட கணக்கு இல்லை." : "No registered account found with this email."));
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 2: Update new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError(isTa ? "கடவுச்சொல் குறைந்தது 4 எழுத்துக்கள் இருக்க வேண்டும்." : "Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isTa ? "கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும்." : "Passwords do not match. Please re-enter.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ 
          email: recoveryEmail.trim(), 
          new_password: newPassword 
        }),
      });
      setRecoverySuccessMessage(res.message || (isTa ? "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!" : "Password updated successfully!"));
      setForgotStep(3);
    } catch (err) {
      setError(err.message || (isTa ? "கடவுச்சொல்லை மாற்ற முடியவில்லை." : "Failed to reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const resetForgotState = () => {
    setIsForgotPassword(false);
    setForgotStep(1);
    setRecoveryEmail("");
    setRecoveryName("");
    setNewPassword("");
    setConfirmPassword("");
    setRecoverySuccessMessage("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061b36]/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-900">
        
        {/* Optional Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* EMBLEM LOGO & BRAND HEADER */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#061b36] to-[#0055ff] shadow-md mb-2.5 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="TN Teacher Logo"
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>

          <h2 className="text-xl font-black text-[#061b36] tracking-tight">
            TN Teacher Portal
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isForgotPassword 
              ? (isTa ? "கடவுச்சொல் மீட்பு (Password Recovery)" : "Account Password Recovery")
              : isGoogleModal 
              ? (isTa ? "கூகிள் வழியாக விரைவு உள்நுழைவு" : "Secure Google Account Sign-In")
              : isLogin 
              ? (isTa ? "உங்கள் ஆசிரியர் கணக்கில் உள்நுழைக" : "Sign in to access your TNTET curriculum") 
              : (isTa ? "இலவச புதிய கணக்கை உருவாக்கவும்" : "Create your free TNTET candidate account")}
          </p>
        </div>

        {/* ================= FORGOT / RESET PASSWORD SCREEN ================= */}
        {isForgotPassword ? (
          <div className="space-y-4">
            
            {/* Step 3: Success Screen */}
            {forgotStep === 3 ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900">
                  {isTa ? "கடவுச்சொல் மாற்றப்பட்டது!" : "Password Reset Successfully!"}
                </h4>
                <p className="text-xs text-emerald-800 font-medium">
                  {recoverySuccessMessage || (isTa ? "உங்கள் புதிய கடவுச்சொல் சேமிக்கப்பட்டது. இப்போது உள்நுழையலாம்." : "Your password has been updated. You can now sign in.")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(recoveryEmail);
                    resetForgotState();
                    setIsLogin(true);
                  }}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {isTa ? "புதிய கடவுச்சொல்லுடன் உள்நுழைக →" : "Sign In with New Password →"}
                </button>
              </div>
            ) : forgotStep === 2 ? (
              /* Step 2: Set New Password */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-[#061b36] flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {isTa ? "சரிபார்க்கப்பட்டது:" : "Verified:"} <strong>{recoveryName || recoveryEmail}</strong>
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#061b36] mb-1">
                    {isTa ? "புதிய கடவுச்சொல்" : "New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#061b36] mb-1">
                    {isTa ? "புதிய கடவுச்சொல்லை உறுதிசெய்க" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (isTa ? "சேமிக்கப்படுகிறது..." : "Updating...") : (isTa ? "கடவுச்சொல்லை மாற்றுக" : "Update Password & Continue")}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={resetForgotState}
                    className="text-xs text-slate-500 hover:text-[#0055ff] font-bold cursor-pointer"
                  >
                    {isTa ? "உள்நுழைவுக்குத் திரும்பு" : "Return to Sign In"}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 1: Enter Registered Email */
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed text-center font-medium">
                  {isTa 
                    ? "உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியை உள்ளிட்டு கணக்கைச் சரிபார்க்கவும்."
                    : "Enter your registered email address to verify your account and set a new password."}
                </p>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#061b36] mb-1">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="teacher@example.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? (isTa ? "சரிபார்க்கப்படுகிறது..." : "Verifying...") : (isTa ? "கணக்கைச் சரிபார்க்கவும் →" : "Verify Account →")}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={resetForgotState}
                    className="text-xs text-slate-500 hover:text-[#0055ff] font-bold cursor-pointer"
                  >
                    {isTa ? "உள்நுழைவுக்குத் திரும்பு" : "Return to Sign In"}
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : isGoogleModal ? (
          /* ================= GOOGLE SIGN IN SCREEN ================= */
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#061b36]">
                {isTa ? "கூகிள் கணக்குடன் தொடர்க" : "Sign in with Google"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTa ? "உங்கள் கூகிள் மின்னஞ்சல் வழியாக பாதுகாப்பாக உள்நுழைக." : "Access all TNTET materials with your Google identity."}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGoogleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#061b36] mb-1">
                  {isTa ? "உங்கள் பெயர் (Name)" : "Candidate Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Anand Kumar"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#061b36] mb-1">
                  {isTa ? "கூகிள் மின்னஞ்சல் முகவரி" : "Google Account Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="teacher.account@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleModal(false);
                    setError("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  {isTa ? "ரத்துசெய்" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (isTa ? "உள்நுழைகிறது..." : "Signing in...") : (isTa ? "தொடர்க →" : "Continue →")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================= MAIN SIGN IN / REGISTER FORM ================= */
          <>

            {/* OFFICIAL GOOGLE IDENTITY SERVICES BUTTON (Like izon.frontierwox.in) */}
            <div className="mb-4">
              <div 
                ref={googleBtnContainerRef}
                className="flex justify-center items-center w-full min-h-[44px] overflow-hidden rounded-xl"
              ></div>

              {/* Instant click fallback if official GSI iframe is still loading or blocked */}
              {!googleSdkReady && (
                <button
                  type="button"
                  onClick={triggerGooglePrompt}
                  className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer group active:scale-98"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isTa ? "Google மூலம் தொடர்க" : "Continue with Google"}</span>
                </button>
              )}
            </div>

            {/* SUBTLE DIVIDER */}
            <div className="relative flex py-1 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isTa ? "அல்லது மின்னஞ்சல் மூலம்" : "OR WITH EMAIL"}
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name field (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-[#061b36] mb-1">
                    {t.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#061b36] mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="candidate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#061b36]">
                    {t.passwordLabel}
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep(1);
                        setRecoveryEmail(email);
                        setError("");
                      }}
                      className="text-[11px] font-bold text-[#0055ff] hover:underline cursor-pointer"
                    >
                      {isTa ? "கடவுச்சொல் மறந்ததா?" : "Forgot Password?"}
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0055ff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>{loading ? (isTa ? "சரிபார்க்கப்படுகிறது..." : "Authenticating...") : isLogin ? t.loginBtn : t.registerBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Switcher */}
            <div className="mt-4 text-center border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-xs text-[#0055ff] hover:underline font-bold cursor-pointer"
              >
                {isLogin 
                  ? (isTa ? "புதியவரா? இலவச கணக்கை உருவாக்கவும் →" : "New candidate? Create an account →") 
                  : (isTa ? "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக →" : "Already have an account? Sign In →")}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
