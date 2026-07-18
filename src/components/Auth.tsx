import React, { useState } from "react";
import { Mail, Phone, Lock, User as UserIcon, Shield, CheckCircle, ArrowRight, RefreshCw, Key, Facebook, Instagram, Youtube } from "lucide-react";

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

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneLogin, setPhoneLogin] = useState("");
  const [countryCodeRegister, setCountryCodeRegister] = useState("+1");
  const [countryCodeLogin, setCountryCodeLogin] = useState("+1");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showRegCountryDropdown, setShowRegCountryDropdown] = useState(false);
  const [showLoginCountryDropdown, setShowLoginCountryDropdown] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"creator" | "admin">("creator");
  
  // Social accounts state
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  
  // States for verification flows
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [activeVerifyEmail, setActiveVerifyEmail] = useState("");
  const [activeVerifyPhone, setActiveVerifyPhone] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        // Log in
        let identifier = "";
        if (loginMethod === "email") {
          identifier = email;
          if (!identifier) {
            throw new Error("Please enter your email address");
          }
        } else {
          if (!phoneLogin) {
            throw new Error("Please enter your phone number");
          }
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
      } else {
        // Register
        if (!email || !phone || !name || !password) {
          throw new Error("All registration fields are required");
        }

        if (role === "creator" && (!facebook || !instagram || !youtube)) {
          throw new Error("Social media accounts (Facebook, Instagram, YouTube) are required for Creators");
        }

        const cleanPhone = phone.replace(/^0+/, "").replace(/\s+/g, "");
        const fullPhone = countryCodeRegister + cleanPhone;

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            phone: fullPhone,
            name,
            password,
            role,
            socials: role === "creator" ? { facebook, instagram, youtube } : undefined
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        // Open verification flows
        setActiveVerifyEmail(email);
        setActiveVerifyPhone(fullPhone);
        setVerifyingEmail(true);
        setMessage("Account created! Please verify your credentials to continue.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeVerifyEmail, code: verificationCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setMessage("Email verified successfully! Now verifying phone number.");
      setVerifyingEmail(false);
      setVerifyingPhone(true);
      setVerificationCode("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activeVerifyPhone, code: verificationCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setMessage("Phone verified successfully! You can now log in.");
      setVerifyingPhone(false);
      setIsLogin(true);
      setEmail(activeVerifyEmail);
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activeVerifyPhone || (countryCodeRegister + phone.replace(/^0+/, "").replace(/\s+/g, "")) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setForgotPassword(false);
      setVerifyingEmail(true); // Re-use verification code screen for resetting password
      setActiveVerifyEmail(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 shadow-2xl p-8 relative z-10">
        
        {/* Brand Header */}
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

        {/* Success/Error Notifications */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg mb-4 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Password Reset Modal Request */}
        {forgotPassword ? (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Reset Password</h2>
            <p className="text-sm text-gray-400">Enter your email and we'll send a code to reset your password.</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-white transition"
                onClick={() => setForgotPassword(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : verifyingEmail ? (
          /* Email Verification Code Stage */
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Email Verification</h2>
              <p className="text-sm text-gray-400 mt-1">
                A secure verification code has been sent to <span className="text-white font-medium">{activeVerifyEmail}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                className="w-full py-3 bg-black/40 border border-white/10 rounded-xl text-center text-xl tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <p className="text-[11px] text-gray-500 text-center italic">Check your inbox. (If SMTP is not configured, use code <strong>123456</strong>)</p>
            </div>
            <button
              onClick={handleVerifyEmail}
              disabled={loading || verificationCode.length < 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              Verify Email Address
            </button>
          </div>
        ) : verifyingPhone ? (
          /* Phone OTP Verification Code Stage */
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">OTP Verification</h2>
              <p className="text-sm text-gray-400 mt-1">
                SMS verification OTP sent to <span className="text-white font-medium">{activeVerifyPhone}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block text-center">
                Enter Phone SMS OTP
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                className="w-full py-3 bg-black/40 border border-white/10 rounded-xl text-center text-xl tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-[11px] text-gray-500 italic">Check your messages. (Or use code <strong>123456</strong>)</p>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  Resend OTP Code
                </button>
              </div>
            </div>
            <button
              onClick={handleVerifyPhone}
              disabled={loading || verificationCode.length < 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              Verify OTP Code
            </button>
          </div>
        ) : (
          /* Standard Login / Register form */
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Login: Login Method Tabs */}
            {isLogin && (
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mb-2">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    loginMethod === "email"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => {
                    setLoginMethod("email");
                    setError("");
                  }}
                >
                  Email Address
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    loginMethod === "phone"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => {
                    setLoginMethod("phone");
                    setError("");
                  }}
                >
                  Phone Number
                </button>
              </div>
            )}

            {/* Register: Name Input */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email Input (Always shown for Register, or shown for Login in Email mode) */}
            {(!isLogin || (isLogin && loginMethod === "email")) && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Register: Phone Input with Country Code Selector */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  {/* Custom Country Code Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowRegCountryDropdown(!showRegCountryDropdown)}
                      className="h-10.5 px-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm flex items-center gap-1.5 focus:outline-none focus:border-blue-500 transition hover:bg-white/5 cursor-pointer"
                    >
                      <span className="text-base">{COUNTRIES.find(c => c.dialCode === countryCodeRegister)?.flag}</span>
                      <span className="font-semibold font-mono">{countryCodeRegister}</span>
                      <span className="text-gray-500 text-[10px]">▼</span>
                    </button>
                    {showRegCountryDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowRegCountryDropdown(false)}
                        />
                        <div className="absolute left-0 mt-1 w-52 bg-[#0d0e12] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountryCodeRegister(c.dialCode);
                                setShowRegCountryDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              <span className="font-semibold font-mono text-gray-400">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Phone Input Field */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="555 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Login: Phone Input with Country Code Selector */}
            {isLogin && loginMethod === "phone" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  {/* Custom Country Code Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLoginCountryDropdown(!showLoginCountryDropdown)}
                      className="h-10.5 px-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm flex items-center gap-1.5 focus:outline-none focus:border-blue-500 transition hover:bg-white/5 cursor-pointer"
                    >
                      <span className="text-base">{COUNTRIES.find(c => c.dialCode === countryCodeLogin)?.flag}</span>
                      <span className="font-semibold font-mono">{countryCodeLogin}</span>
                      <span className="text-gray-500 text-[10px]">▼</span>
                    </button>
                    {showLoginCountryDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowLoginCountryDropdown(false)}
                        />
                        <div className="absolute left-0 mt-1 w-52 bg-[#0d0e12] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountryCodeLogin(c.dialCode);
                                setShowLoginCountryDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-between transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              <span className="font-semibold font-mono text-gray-400">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Phone Input Field */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      required
                      placeholder="555 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                      value={phoneLogin}
                      onChange={(e) => setPhoneLogin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                    onClick={() => setForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Register: Role Selection */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Join Platform As</label>
                <div className="mt-1">
                  <div className="py-2.5 px-3 text-xs font-semibold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/30 text-center select-none">
                    Creator Marketplace
                  </div>
                </div>
              </div>
            )}

            {/* Register: Social Media Accounts */}
            {!isLogin && role === "creator" && (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Required Social Accounts</span>
                  <span className="text-[10px] text-gray-500 font-medium">(Will be direct-linked)</span>
                </div>

                {/* Facebook input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-500" />
                    <span>Facebook Profile Link or Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://facebook.com/username or username"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>

                {/* Instagram input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@sarah.jenkins or sarah.jenkins"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                {/* YouTube input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube Channel URL or Handle</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://youtube.com/@channel or @channel"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs transition"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#030712] rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#030712]" />
              ) : (
                <>
                  {isLogin ? "Log In" : "Register Account"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle tabs */}
            <div className="text-center pt-2">
              <span className="text-xs text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 ml-1.5 transition cursor-pointer"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setMessage("");
                  setEmail("");
                  setPhone("");
                  setPhoneLogin("");
                  setCountryCodeLogin("+1");
                  setCountryCodeRegister("+1");
                  setName("");
                  setPassword("");
                  setFacebook("");
                  setInstagram("");
                  setYoutube("");
                }}
              >
                {isLogin ? "Sign Up Free" : "Log In Here"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
