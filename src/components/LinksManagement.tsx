import React, { useState } from "react";
import { 
  Copy, Check, Trash2, QrCode, ExternalLink, Lock, Calendar, 
  Search, ShieldAlert, Sparkles, Filter 
} from "lucide-react";

interface LinksManagementProps {
  token: string;
  links: any[];
  onLinkDeleted: () => void;
}

export default function LinksManagement({ token, links, onLinkDeleted }: LinksManagementProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQrId, setShowQrId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "walmart" | "password" | "expired">("all");

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this short link? All click data for this link will be lost.")) {
      return;
    }

    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      onLinkDeleted();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter links
  const filteredLinks = links.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                          l.shortCode.toLowerCase().includes(search.toLowerCase()) ||
                          l.originalUrl.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === "walmart") {
      const domains = ["walmart.com", "amazon.com", "ebay.com", "target.com", "aliexpress.com", "bestbuy.com", "etsy.com"];
      return domains.some(d => l.originalUrl.includes(d));
    }
    if (filterType === "password") {
      return l.isPasswordProtected;
    }
    if (filterType === "expired") {
      if (!l.expiresAt) return false;
      return new Date(l.expiresAt).getTime() < Date.now();
    }

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Search and Filters Bar */}
      <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search short links, codes, titles..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "all", label: "All Links" },
            { id: "walmart", label: "Merchant Links" },
            { id: "password", label: "Password Guarded" },
            { id: "expired", label: "Expired Links" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterType === f.id
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredLinks.length === 0 ? (
        <div className="glass-panel border-white/5 rounded-2xl p-16 text-center">
          <p className="text-gray-400 text-sm">No short links matched your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((l) => {
            const domains = ["walmart.com", "amazon.com", "ebay.com", "target.com", "aliexpress.com", "bestbuy.com", "etsy.com"];
            const isSupported = domains.some(d => l.originalUrl.includes(d));
            const isExpired = l.expiresAt && new Date(l.expiresAt).getTime() < Date.now();
            return (
              <div 
                key={l.id} 
                className="glass-panel border-white/5 hover:border-white/15 rounded-2xl p-5 flex flex-col justify-between gap-5 transition relative overflow-hidden"
              >
                {isSupported && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 border-b border-l border-emerald-500/10 rounded-bl-xl text-[10px] font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> SUPPORTED MERCHANT
                  </div>
                )}

                {/* Card header */}
                <div className="space-y-2 pr-10">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs font-mono font-bold text-blue-400">/{l.shortCode}</span>
                    {l.isPasswordProtected && (
                      <span className="p-1 bg-yellow-500/15 border border-yellow-500/10 rounded text-yellow-500" title="Password protected">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                    {isExpired && (
                      <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/10 rounded text-red-500 text-[9px] font-bold uppercase">
                        Expired
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">{l.title}</h4>
                  <p className="text-[11px] text-gray-500 font-mono break-all line-clamp-1">{l.originalUrl}</p>
                </div>

                {/* Click statistics and metadata */}
                <div className="grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Total Clicks</span>
                    <span className="text-sm font-extrabold text-white font-mono">{l.totalClicks?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Created Date</span>
                    <span className="text-xs text-gray-300 font-mono">
                      {new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Details overlays like password or QR */}
                {showQrId === l.id && (
                  <div className="bg-black/60 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-scaleIn">
                    <div className="p-2 bg-white rounded-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(l.shortUrl)}`}
                        alt="QR Code"
                        className="w-20 h-20"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Dynamic QR Code</span>
                  </div>
                )}

                {l.isPasswordProtected && (
                  <div className="text-[10px] text-yellow-400 bg-yellow-500/5 p-2 rounded-lg border border-yellow-500/10 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-yellow-500" /> Code Gate Password: <strong className="text-white font-mono">{l.password}</strong>
                  </div>
                )}

                {l.expiresAt && (
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" /> Exp: {new Date(l.expiresAt).toLocaleString()}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex gap-2 border-t border-white/5 pt-3 mt-1">
                  <button
                    onClick={() => copyToClipboard(l.id, l.shortUrl)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border border-white/5"
                  >
                    {copiedId === l.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowQrId(showQrId === l.id ? null : l.id)}
                    className={`p-2 rounded-lg transition border cursor-pointer ${
                      showQrId === l.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/5"
                    }`}
                    title="Toggle QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <a
                    href={`/${l.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 transition flex items-center justify-center"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-lg border border-red-500/10 transition cursor-pointer ml-auto"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
