import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, Lock, User as UserIcon, Shield, CheckCircle, ArrowRight, RefreshCw, Facebook, Instagram, Youtube } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (user: any, token: string) => void;
}

const COUNTRIES = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
];

const SS = {
  get: (k: string, def: any) => {
    try { const v = sessionStorage.getItem(`ipflack_${k}`); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (k: string, v: any) => sessionStorage.setItem(`ipflack_${k}`, JSON.stringify(v)),
  remove: (k: string) => sessionStorage.removeItem(`ipflack_${k}`),
};

type ViewType = "login" | "register" | "verify" | "forgot";

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [view, setView] = useState<ViewType>(() => SS.get("view", "login"));
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneLogin, setPhoneLogin] = useState("");
  const [countryCodeRegister, setCountryCodeRegister] = useState("+1");
  const [countryCodeLogin, setCountryCodeLogin] = useState("+1");
  const [showRegCountryDropdown, setShowRegCountryDropdown] = useState(false);
  const [showLoginCountryDropdown, setShowLoginCountryDropdown] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<"creator" | "admin">("creator");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(() => SS.get("verifyEmail", ""));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => { SS.set("view", view); }, [view]);
  useEffect(() => { SS.set("verifyEmail", verifyEmail); }, [verifyEmail]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const safeSet = (setter: Function, value: any) => {
    if (isMounted.current) setter(value);
  };

  const goToView = (newView: ViewType) => {
    safeSet(setView, newView);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    safeSet(setError, "");
    safeSet(setMessage, "");
    safeSet(setLoading, true);

    try {
      if (view === "login") {
        let identifier = "";
        if (loginMethod === "email") {
          identifier = email.trim();
          if (!identifier) throw new Error("Please enter your email address");
        } else {
          if (!phoneLogin) throw new Error("Please enter your phone number");
          const cleanPhone = phoneLogin.replace(/^0+/, "").replace(/\s+/g, "");
          identifier = countryCodeLogin + cleanPhone;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Authentication failed");
        onLoginSuccess(data.user, data.token);
      } else if (view === "register") {
        if (!email.trim() || !phone.trim() || !name.trim() || !password) {
          throw new Error("All registration fields are required");
        }
        if (!facebook.trim() || !instagram.trim() || !youtube.trim()) {
          throw new Error("Social media accounts (Facebook, Instagram, YouTube) are required");
        }

        const cleanPhone = phone.replace(/^0+/, "").replace(/\s+/g, "");
        const fullPhone = countryCodeRegister + cleanPhone;

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            phone: fullPhone,
            name: name.trim(),
            password,
            role,
            socials: { facebook: facebook.trim(), instagram: instagram.trim(), youtube: youtube.trim() }
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Registration failed");

        safeSet(setVerifyEmail, email.trim());
        safeSet(setPassword, "");
        safeSet(setMessage, "Account created! Please verify your email to continue.");
        goToView("verify");
      }
    } catch (err: any) {
      safeSet(setError, err.message || "Something went wrong");
    } finally {
      safeSet(setLoading, false);
    }
  };

  const handleVerifyEmail = async () => {
    safeSet(setError, "");
    safeSet(setMessage, "");
    safeSet(setLoading, true);
    try {
      const res = await fetch("/api/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: verificationCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      safeSet(setMessage, "Email verified successfully!");
      localStorage.setItem("ipflack_token", data.token);
      localStorage.setItem("ipflack_user", JSON.stringify(data.user));

      // Clean storage
      SS.remove("view");
      SS.remove("verifyEmail");

      // ✅ BAS PARENT KO BATAO — view change mat karo
      safeSet(setVerificationCode, "");
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      safeSet(setError, err.message);
    } finally {
      safeSet(setLoading, false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    safeSet(setError, "");
    safeSet(setMessage, "");
    safeSet(setLoading, true);
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      safeSet(setMessage, data.message);
      safeSet(setVerifyEmail, email.trim());
      goToView("verify");
    } catch (err: any) {
      safeSet(setError, err.message);
    } finally {
      safeSet(setLoading, false);
    }
  };

  const switchToRegister = () => {
    safeSet(setError, "");
    safeSet(setMessage, "");
    safeSet(setEmail, "");
    safeSet(setPhone, "");
    safeSet(setPhoneLogin, "");
    safeSet(setCountryCodeLogin, "+1");
    safeSet(setCountryCodeRegister, "+1");
    safeSet(setName, "");
    safeSet(setPassword, "");
    safeSet(setFacebook, "");
    safeSet(setInstagram, "");
    safeSet(setYoutube, "");
    goToView("register");
  };

  const switchToLogin = () => {
    safeSet(setError, "");
    safeSet(setMessage, "");
    safeSet(setEmail, "");
    safeSet(setPhone, "");
    safeSet(setPhoneLogin, "");
    safeSet(setCountryCodeLogin, "+1");
    safeSet(setCountryCodeRegister, "+1");
    safeSet(setName, "");
    safeSet(setPassword, "");
    safeSet(setFacebook, "");
    safeSet(setInstagram, "");
    safeSet(setYoutube, "");
    goToView("login");
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-medium tracking-wide mb-3 uppercase">
            <Shield className="w-3.5 h-3.5" /> High-Trust Affiliate Platform
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            IP<span className="text-blue-500 text-glow">FLACK</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            The premium creator marketplace • <span className="font-mono text-xs">ipflack.online</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">❌ {error}</div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg mb-4 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Reset Password</h2>
            <p className="text-sm text-gray-400">Enter your email and we'll send a code to reset your password.</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input type="email" required placeholder="name@domain.com" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <button type="button" className="text-xs text-gray-400 hover:text-white transition" onClick={switchToLogin}>Back to Login</button>
            </div>
          </form>
        )}

        {view === "verify" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Email Verification</h2>
              <p className="text-sm text-gray-400 mt-1">A secure verification code has been sent to <span className="text-white font-medium">{verifyEmail}</span></p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block text-center">Enter 6-Digit Code</label>
              <input type="text" placeholder="123456" maxLength={6} className="w-full py-3 bg-black/40 border border-white/10 rounded-xl text-center text-xl tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
              <p className="text-[11px] text-gray-500 text-center italic">Check your inbox. (If SMTP is not configured, use code <strong>123456</strong>)</p>
            </div>
            <button onClick={handleVerifyEmail} disabled={loading || verificationCode.length < 6} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify Email Address"}
            </button>
            <div className="text-center mt-4">
              <button type="button" className="text-xs text-gray-400 hover:text-white transition" onClick={switchToLogin}>Back to Login</button>
            </div>
          </div>
        )}

        {(view === "login" || view === "register") && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {view === "login" && (
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mb-2">
                <button type="button" className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${loginMethod === "email" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-gray-400 hover:text-white"}`} onClick={() => { setLoginMethod("email"); setError(""); }}>Email Address</button>
                <button type="button" className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${loginMethod === "phone" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-gray-400 hover:text-white"}`} onClick={() => { setLoginMethod("phone"); setError(""); }}>Phone Number</button>
              </div>
            )}

            {view === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input type="text" required placeholder="Sarah Jenkins" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
            )}

            {(view === "register" || (view === "login" && loginMethod === "email")) && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" required placeholder="name@domain.com" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            )}

            {view === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowRegCountryDropdown(!showRegCountryDropdown)} className="h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm flex items-center gap-1.5 focus:outline-none focus:border-blue-500 transition hover:bg-white/5 cursor-pointer">
                      <span className="text-base">{COUNTRIES.find(c => c.dialCode === countryCodeRegister)?.flag}</span>
                      <span className="font-semibold font-mono">{countryCodeRegister}</span>
                      <span className="text-gray-500 text-[10px]">▼</span>
                    </button>
                    {showRegCountryDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowRegCountryDropdown(false)} />
                        <div className="absolute left-0 mt-1 w-52 bg-[#0d0e12] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                          {COUNTRIES.map((c) => (
                            <button key={c.code} type="button" onClick={() => { setCountryCodeRegister(c.dialCode); setShowRegCountryDropdown(false); }} className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition cursor-pointer">
                              <div className="flex items-center gap-2"><span className="text-base">{c.flag}</span><span>{c.name}</span></div>
                              <span className="font-semibold font-mono text-gray-400">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input type="tel" required placeholder="555 123 4567" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {view === "login" && loginMethod === "phone" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowLoginCountryDropdown(!showLoginCountryDropdown)} className="h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm flex items-center gap-1.5 focus:outline-none focus:border-blue-500 transition hover:bg-white/5 cursor-pointer">
                      <span className="text-base">{COUNTRIES.find(c => c.dialCode === countryCodeLogin)?.flag}</span>
                      <span className="font-semibold font-mono">{countryCodeLogin}</span>
                      <span className="text-gray-500 text-[10px]">▼</span>
                    </button>
                    {showLoginCountryDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowLoginCountryDropdown(false)} />
                        <div className="absolute left-0 mt-1 w-52 bg-[#0d0e12] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                          {COUNTRIES.map((c) => (
                            <button key={c.code} type="button" onClick={() => { setCountryCodeLogin(c.dialCode); setShowLoginCountryDropdown(false); }} className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition cursor-pointer">
                              <div className="flex items-center gap-2"><span className="text-base">{c.flag}</span><span>{c.name}</span></div>
                              <span className="font-semibold font-mono text-gray-400">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input type="tel" required placeholder="555 123 4567" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={phoneLogin} onChange={(e) => setPhoneLogin(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                {view === "login" && <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition" onClick={() => goToView("forgot")}>Forgot Password?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input type="password" required placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {view === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Join Platform As</label>
                <div className="mt-1"><div className="py-2.5 px-3 text-xs font-semibold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/30 text-center select-none">Creator Marketplace</div></div>
              </div>
            )}

            {view === "register" && role === "creator" && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Required Social Accounts</span>
                  <span className="text-[10px] text-gray-500 font-medium">(Will be direct-linked)</span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5 text-blue-500" /><span>Facebook Profile Link or Username</span></label>
                  <input type="text" required placeholder="https://facebook.com/username or username" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5 text-pink-500" /><span>Instagram Username</span></label>
                  <input type="text" required placeholder="@sarah.jenkins or sarah.jenkins" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5 text-red-500" /><span>YouTube Channel URL or Handle</span></label>
                  <input type="text" required placeholder="https://youtube.com/@channel or @channel" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#030712] rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#030712]" /> : <>{view === "login" ? "Log In" : "Register Account"} <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-400">{view === "login" ? "Don't have an account?" : "Already have an account?"}</span>
              <button type="button" className="text-xs font-semibold text-blue-400 hover:text-blue-300 ml-1.5 transition cursor-pointer" onClick={view === "login" ? switchToRegister : switchToLogin}>
                {view === "login" ? "Sign Up Free" : "Log In Here"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}