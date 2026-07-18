import React, { useState } from "react";
import { 
  DollarSign, ShoppingCart, MousePointer, Percent, Award, TrendingUp, 
  Sparkles, ShieldCheck, MapPin, Smartphone, Share2, Globe2,
  Facebook, Instagram, Youtube, ExternalLink, Edit2, Check, RefreshCw
} from "lucide-react";
import { 
  RevenueChart, GeographicDistribution, DeviceBreakdown, ReferrerBreakdown 
} from "./AnalyticsCharts";

interface CreatorDashboardProps {
  analyticsData: any;
  links: any[];
  user: any;
  token: string;
  onUserUpdated: (user: any) => void;
}

export default function CreatorDashboard({ analyticsData, links, user, token, onUserUpdated }: CreatorDashboardProps) {
  const { summary, mainChart, countries, devices, referrers } = analyticsData;

  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [fb, setFb] = useState(user?.socials?.facebook || "");
  const [ig, setIg] = useState(user?.socials?.instagram || "");
  const [yt, setYt] = useState(user?.socials?.youtube || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleStartEdit = () => {
    setFb(user?.socials?.facebook || "");
    setIg(user?.socials?.instagram || "");
    setYt(user?.socials?.youtube || "");
    setError("");
    setSuccessMsg("");
    setIsEditingSocials(true);
  };

  const formatSocialLink = (platform: "facebook" | "instagram" | "youtube", val: string) => {
    if (!val) return "#";
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (platform === "facebook") {
      return `https://facebook.com/${trimmed}`;
    }
    if (platform === "instagram") {
      return `https://instagram.com/${trimmed.replace("@", "")}`;
    }
    if (platform === "youtube") {
      const handle = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
      return `https://youtube.com/${handle}`;
    }
    return trimmed;
  };

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fb || !ig || !yt) {
      setError("All social accounts are required");
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/user/socials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ facebook: fb, instagram: ig, youtube: yt })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update social channels");
      }

      onUserUpdated({
        ...user,
        socials: { facebook: fb, instagram: ig, youtube: yt }
      });
      setSuccessMsg("Social channels successfully updated & direct-linked!");
      setIsEditingSocials(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Render metric Card
  const renderMetricCard = (
    title: string, 
    value: string | number, 
    change: string, 
    icon: React.ReactNode, 
    colorClass: string,
    glow = false
  ) => {
    return (
      <div className={`glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden transition hover:border-white/10 ${glow ? "glow-blue" : ""}`}>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.02] rounded-full"></div>
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">{title}</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight font-mono">{value}</h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 font-bold">{change}</span>
          <span className="text-[10px] text-gray-500 font-medium ml-1">vs yesterday</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Metric Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {renderMetricCard(
          "Sales Volume", 
          `$${summary?.sales?.total?.toLocaleString() || "12,450"}`, 
          summary?.sales?.change || "+18.2%", 
          <DollarSign className="w-5 h-5 text-blue-400" />, 
          "bg-blue-500/10 border-blue-500/10 text-blue-400"
        )}

        {renderMetricCard(
          "Total Orders", 
          summary?.orders?.total?.toLocaleString() || "328", 
          summary?.orders?.change || "+24 new", 
          <ShoppingCart className="w-5 h-5 text-emerald-400" />, 
          "bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
        )}

        {renderMetricCard(
          "Click Redirects", 
          `${(summary?.clicks?.total / 1000).toFixed(1)}K` || "18.4K", 
          summary?.clicks?.change || "+7.1%", 
          <MousePointer className="w-5 h-5 text-purple-400" />, 
          "bg-purple-500/10 border-purple-500/10 text-purple-400"
        )}

        {renderMetricCard(
          "Conversion Rate", 
          `${summary?.conversion?.rate}%` || "6.9%", 
          summary?.conversion?.change || "+0.8%", 
          <Percent className="w-5 h-5 text-yellow-500" />, 
          "bg-yellow-500/10 border-yellow-500/10 text-yellow-500"
        )}

        {renderMetricCard(
          "Commissions", 
          `$${summary?.commissions?.total?.toLocaleString() || "1,867"}`, 
          summary?.commissions?.change || "Dynamic Split", 
          <Award className="w-5 h-5 text-orange-400" />, 
          "bg-orange-500/10 border-orange-500/10 text-orange-400"
        )}

        {renderMetricCard(
          "Confirm Earnings", 
          `$${summary?.wallet?.lifetimeEarnings?.toLocaleString() || "3,210"}`, 
          "Dynamic Revenue Split", 
          <Sparkles className="w-5 h-5 text-yellow-400" />, 
          "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
          true
        )}

      </div>

      {/* Social Media Direct Links Panel */}
      {user?.role === "creator" && (
        <div className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden transition hover:border-white/10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Verified Social Channels & Direct Links</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Your registered channels. Click any badge to open your connected social profile directly.</p>
            </div>
            
            {!isEditingSocials && (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                Update Social Profiles
              </button>
            )}
          </div>

          {error && <div className="text-red-400 text-xs font-semibold mb-3">{error}</div>}
          {successMsg && <div className="text-emerald-400 text-xs font-semibold mb-3">{successMsg}</div>}

          {isEditingSocials ? (
            <form onSubmit={handleSaveSocials} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facebook Edit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-500" />
                    <span>Facebook Profile</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fb}
                    onChange={(e) => setFb(e.target.value)}
                    placeholder="Profile URL or Username"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Instagram Edit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Profile</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ig}
                    onChange={(e) => setIg(e.target.value)}
                    placeholder="Username or @handle"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* YouTube Edit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube Channel</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={yt}
                    onChange={(e) => setYt(e.target.value)}
                    placeholder="Channel URL or Handle"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Social Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSocials(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Facebook card */}
              <a
                href={formatSocialLink("facebook", user?.socials?.facebook)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/30 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <Facebook className="w-5 h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">Facebook</span>
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate block">
                      {user?.socials?.facebook || "Not Linked"}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition shrink-0" />
              </a>

              {/* Instagram card */}
              <a
                href={formatSocialLink("instagram", user?.socials?.instagram)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/10 hover:border-pink-500/30 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 group-hover:scale-105 transition-transform">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">Instagram</span>
                    <span className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors truncate block">
                      {user?.socials?.instagram ? (user.socials.instagram.startsWith("@") ? user.socials.instagram : `@${user.socials.instagram}`) : "Not Linked"}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition shrink-0" />
              </a>

              {/* YouTube card */}
              <a
                href={formatSocialLink("youtube", user?.socials?.youtube)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:scale-105 transition-transform">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">YouTube Channel</span>
                    <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate block">
                      {user?.socials?.youtube || "Not Linked"}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition shrink-0" />
              </a>

            </div>
          )}
        </div>
      )}

      {/* Main Graph Chart Container */}
      <div className="glass-panel border-white/5 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Earnings & Redirect Analytics</h3>
            <p className="text-xs text-gray-500 mt-1">Real-time performance distribution across the last 10 days.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span>Traffic Clicks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span>Confirmed Earnings ($)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span>Total Orders</span>
            </div>
          </div>
        </div>

        {/* Revenue chart Component */}
        <RevenueChart data={mainChart} />
      </div>

      {/* Geographics / Devices / Referrals Segmentations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Geographic Analytics */}
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Geographic Distribution</h3>
          </div>
          <GeographicDistribution data={countries} />
        </div>

        {/* Device breakdown */}
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Analytics</h3>
          </div>
          <DeviceBreakdown data={devices} />
        </div>

        {/* Traffic Referrers */}
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-gray-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Traffic Sources</h3>
          </div>
          <ReferrerBreakdown data={referrers} />
        </div>

      </div>

      {/* Top links performance logs */}
      <div className="glass-panel border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-gray-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Performing Affiliate Links</h3>
          </div>
          <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">Live stats</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase">
                <th className="py-3 px-4">Short Code / Title</th>
                <th className="py-3 px-4">Destination Target URL</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Click-Throughs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No affiliate short links generated yet. Visit "Link Shortener" to start.
                  </td>
                </tr>
              ) : (
                links.slice(0, 5).sort((a,b) => b.totalClicks - a.totalClicks).map((link) => {
                  const domains = ["walmart.com", "amazon.com", "ebay.com", "target.com", "aliexpress.com", "bestbuy.com", "etsy.com"];
                  const isSupported = domains.some(d => link.originalUrl.includes(d));
                  return (
                    <tr key={link.id} className="hover:bg-white/[0.01] transition">
                      <td className="py-3 px-4 space-y-0.5">
                        <span className="font-bold text-blue-400 font-mono">/{link.shortCode}</span>
                        <span className="text-white block font-semibold">{link.title}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-xs font-mono text-[10px]" title={link.originalUrl}>
                        {link.originalUrl}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isSupported 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                        }`}>
                          {isSupported ? "Merchant Split" : "Standard Split"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-extrabold text-white text-right text-sm">
                        {link.totalClicks?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
