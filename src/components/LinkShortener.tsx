import React, { useState } from "react";
import { 
  Link as LinkIcon, Lock, Calendar, Sparkles, Copy, 
  Check, ArrowRight, ShieldCheck, QrCode, Globe2, Eye, Download 
} from "lucide-react";

interface LinkShortenerProps {
  token: string;
  onLinkCreated?: () => void;
}

export default function LinkShortener({ token, onLinkCreated }: LinkShortenerProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessLink(null);
    setCopied(false);
    setLoading(true);

    if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
      setError("Please enter a valid URL starting with http:// or https://");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        originalUrl,
        customAlias: customAlias ? customAlias.trim() : undefined,
        title: title ? title.trim() : undefined,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
        expiresAt: hasExpiration ? expiresAt : undefined
      };

      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to shorten link");
      }

      setSuccessLink(data);
      setOriginalUrl("");
      setCustomAlias("");
      setTitle("");
      setIsPasswordProtected(false);
      setPassword("");
      setHasExpiration(false);
      setExpiresAt("");
      setShowAdvanced(false);

      if (onLinkCreated) onLinkCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSupportedMerchant = (url: string) => {
    const domains = ["walmart.com", "amazon.com", "ebay.com", "target.com", "aliexpress.com", "bestbuy.com", "etsy.com"];
    try {
      const parsed = new URL(url);
      return domains.some(d => parsed.hostname.includes(d));
    } catch {
      return false;
    }
  };

  const isMerchantLink = isSupportedMerchant(originalUrl);

  return (
    <div className="space-y-6">
      {/* Shortener Header Banner */}
      <div className="glass-panel border-white/5 rounded-2xl p-6 relative overflow-hidden glow-blue">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Built-in Affiliate Link Shortener</h2>
            <p className="text-sm text-gray-400 mt-1">
              Whenever you shorten any supported product or merchant URL, the system stores the destination URL, generates a branded IPFLACK short link, tracks clicks and analytics, and is designed so affiliate tracking integration can be enabled or updated later in settings without changing existing short links.
            </p>
          </div>
        </div>
      </div>

      {/* Main Shortener Form */}
      <div className="glass-panel border-white/5 rounded-2xl p-6">
        <form onSubmit={handleShorten} className="space-y-4">
          
          {/* Link destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paste Original URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="url"
                required
                placeholder="Paste Walmart, Amazon, eBay, Target, or any product URL..."
                className="w-full pl-11 pr-32 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
              />
              
              {isMerchantLink && (
                <div className="absolute right-3.5 top-2.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5" /> Supported Merchant (Affiliate Ready)
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Alias */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Custom Alias <span className="text-gray-600 font-normal">(Optional)</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 bg-white/5 border-y border-l border-white/10 rounded-l-xl text-xs text-gray-500 font-mono">
                  ipflack.online/
                </span>
                <input
                  type="text"
                  placeholder="blackfriday-deal"
                  className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-r-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>
            </div>

            {/* Title description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Link Description / Title <span className="text-gray-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="E.g. HP Laptop Deal"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Toggle Advanced Options */}
          <div className="pt-2">
            <button
              type="button"
              className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide Security & Expiration Options" : "Show Security & Expiration Options"}
            </button>
          </div>

          {showAdvanced && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Password Protection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-gray-500" /> Password Gate
                    </label>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-white/10 rounded"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                    />
                  </div>
                  {isPasswordProtected && (
                    <input
                      type="text"
                      required
                      placeholder="Access Password (e.g. 123)"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </div>

                {/* Expiration date */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" /> Temporary Expiry Date
                    </label>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-white/10 rounded"
                      checked={hasExpiration}
                      onChange={(e) => setHasExpiration(e.target.checked)}
                    />
                  </div>
                  {hasExpiration && (
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs transition"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  )}
                </div>

              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-200 text-[#030712] rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Injecting Affiliate Trackers & Shortening..." : "Generate Short Tracked Link"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Success generated shortcode card */}
      {successLink && (
        <div className="glass-panel border-emerald-500/20 bg-emerald-950/10 rounded-2xl p-6 space-y-6 glow-green animate-scaleIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" /> Affiliate link created successfully!
            </h3>
            <span className="text-xs text-gray-400 font-mono">CODE: {successLink.shortCode}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Shortened URL display */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Shortened Target URL</label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-black/60 border border-white/10 rounded-l-xl text-white font-mono text-xs focus:outline-none"
                    value={successLink.shortUrl}
                  />
                  <button
                    onClick={() => copyToClipboard(successLink.shortUrl)}
                    className="px-4 bg-white hover:bg-gray-200 text-black rounded-r-xl flex items-center justify-center transition shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Full Affiliate URL with Tracking Params</label>
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-gray-400 break-all">
                  {successLink.trackedUrl}
                </div>
              </div>

              {successLink.isPasswordProtected && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 font-medium">
                  <Lock className="w-4 h-4 shrink-0" /> Password Protected (Code: <span className="font-mono bg-yellow-400/10 px-1 rounded text-white">{successLink.password}</span>)
                </div>
              )}

              <div className="flex gap-3">
                {/* Open in new tab link click testing */}
                <a
                  href={`/${successLink.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-4 h-4" /> Open Short Link (Test Click)
                </a>
              </div>
            </div>

            {/* QR Code Column */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3">
              <QrCode className="w-4 h-4 text-gray-500 self-start" />
              <div className="p-2 bg-white rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(successLink.shortUrl)}`}
                  alt="Short link QR Code"
                  className="w-28 h-28"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dynamic QR Code</p>
                <a 
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(successLink.shortUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  download={`qr-${successLink.shortCode}.png`}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Save/Open QR Image
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
