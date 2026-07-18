import React, { useState } from "react";
import { Lock, ShieldAlert, ArrowRight, EyeOff, RefreshCw, Key } from "lucide-react";

interface LinkGateProps {
  shortCode: string;
}

export default function LinkGate({ shortCode }: LinkGateProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/links/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect password. Verification failed.");
      }

      // Success -> Redirect visitor to the affiliate tracked URL!
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Decorative Blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 shadow-2xl p-8 text-center relative z-10">
        
        {/* Shield Icon header */}
        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-yellow-500" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">Security Access Gate</h1>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          This short link (<span className="font-mono text-blue-400">/{shortCode}</span>) is password protected. Enter the access key to continue to your product destination.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mt-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enter Link Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Access password (demo password is: 123)"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition text-center"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" /> Unlocking Link Gate...
              </>
            ) : (
              <>
                Unlock & Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
          <span>Shielded by IPFLACK</span>
          <span className="font-mono">ipflack.online</span>
        </div>

      </div>
    </div>
  );
}
