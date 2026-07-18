import React, { useState } from "react";
import { 
  Wallet, DollarSign, ArrowUpRight, History, ShieldAlert, 
  CreditCard, CheckCircle, Smartphone, RefreshCw, Sparkles 
} from "lucide-react";

interface WalletModalProps {
  token: string;
  wallet: any;
  payoutHistory: any[];
  ledger?: any[];
  onPayoutRequested: () => void;
}

export default function WalletModal({ token, wallet, payoutHistory, ledger = [], onPayoutRequested }: WalletModalProps) {
  const [method, setMethod] = useState<"easypaisa" | "jazzcash" | "bank">("easypaisa");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [activeSubTab, setActiveSubTab] = useState<"withdraw" | "ledger">("withdraw");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid positive withdrawal amount.");
      setLoading(false);
      return;
    }

    if (withdrawAmount > wallet.availableBalance) {
      setError(`Insufficient balance. You can only withdraw up to $${wallet.availableBalance.toFixed(2)}.`);
      setLoading(false);
      return;
    }

    try {
      const details: any = { accountName, accountNumber };
      if (method === "bank") {
        details.bankName = bankName;
      }

      const res = await fetch("/api/wallet/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ method, details, amount: withdrawAmount })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process withdrawal request.");
      }

      setSuccessMsg(`Withdrawal request of $${withdrawAmount.toFixed(2)} submitted successfully!`);
      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
      onPayoutRequested();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Wallet Balance Cards GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Available Card */}
        <div className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden glow-blue">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Available Balance</span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
            ${wallet?.availableBalance?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </h3>
          <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Fully approved and withdrawable
          </p>
        </div>

        {/* Pending Card */}
        <div className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center text-yellow-500">
            <RefreshCw className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Pending Balance</span>
          <h3 className="text-3xl font-extrabold text-gray-300 mt-2 font-mono">
            ${wallet?.pendingBalance?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </h3>
          <p className="text-[10px] text-gray-500 mt-2">
            Based on dynamic revenue split of actual commissions
          </p>
        </div>

        {/* Withdrawable Balance */}
        <div className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Withdrawable Balance</span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
            ${wallet?.withdrawableBalance?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </h3>
          <p className="text-[10px] text-gray-500 mt-2">
            Ready to transfer out to wallet or bank
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="glass-panel border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Lifetime Earnings</span>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
            ${wallet?.lifetimeEarnings?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </h3>
          <p className="text-[10px] text-gray-500 mt-2">
            Total approved and payout commissions
          </p>
        </div>

      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 gap-6 mt-4">
        <button
          onClick={() => setActiveSubTab("withdraw")}
          className={`pb-3.5 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "withdraw"
              ? "text-blue-400 border-blue-500"
              : "text-gray-400 border-transparent hover:text-white"
          }`}
        >
          <CreditCard className="w-4.5 h-4.5" />
          Withdrawal & Accounts
        </button>
        <button
          onClick={() => setActiveSubTab("ledger")}
          className={`pb-3.5 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "ledger"
              ? "text-blue-400 border-blue-500"
              : "text-gray-400 border-transparent hover:text-white"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
          Transparent Earnings Ledger
        </button>
      </div>

      {activeSubTab === "withdraw" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Withdraw Request Panel */}
        <div className="lg:col-span-3 glass-panel border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1.5">Request Withdrawal</h2>
          <p className="text-xs text-gray-400 mb-6">Process payouts instantly using popular domestic mobile accounts or direct bank transfers.</p>

          <form onSubmit={handleWithdraw} className="space-y-4">
            
            {/* Method Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Payout Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("easypaisa")}
                  className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer text-xs font-semibold ${
                    method === "easypaisa"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>Easypaisa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("jazzcash")}
                  className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer text-xs font-semibold ${
                    method === "jazzcash"
                      ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500"
                      : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-yellow-500" />
                  <span>JazzCash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer text-xs font-semibold ${
                    method === "bank"
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                      : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Bank Transfer</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Account Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account / Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder={method === "bank" ? "0042-100456-01-9" : "03001234567"}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

            </div>

            {/* Bank Name (conditional) */}
            {method === "bank" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Habib Bank Limited (HBL) or Standard Chartered"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Withdrawal Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="number"
                  required
                  min="5"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-10 pr-24 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm transition font-mono"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setAmount(wallet?.availableBalance?.toFixed(2) || "0")}
                  className="absolute right-2 top-1.5 px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-bold text-gray-300 rounded-lg transition cursor-pointer"
                >
                  Withdraw All
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || wallet.availableBalance <= 0}
              className="w-full py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting Payout Request..." : "Request Payout"}
            </button>
          </form>
        </div>

        {/* Payout History Panel */}
        <div className="lg:col-span-2 glass-panel border-white/5 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Withdrawal History</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px]">
            {payoutHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-gray-500">No payout history logged yet.</p>
              </div>
            ) : (
              payoutHistory.map((p) => (
                <div key={p.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-gray-400 font-mono">
                      {p.method} payout
                    </span>
                    <span className="text-xs font-extrabold text-white font-mono">
                      ${parseFloat(p.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 font-mono">
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      p.status === "approved" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                        : p.status === "rejected" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/10" 
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {p.notes && (
                    <div className="text-[10px] text-gray-400 bg-black/40 p-2 rounded-lg border border-white/5 mt-1">
                      <strong className="text-gray-300">Message:</strong> {p.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      ) : (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Transparent Earnings Ledger
              </h2>
              <p className="text-xs text-gray-400 mt-1">Real-time audit logs of actual affiliate network commissions, split percentages, and creator distributions.</p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Your Split:</span>
              <span className="text-xs font-extrabold text-blue-400">40% / 60%</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Link Reference</th>
                  <th className="py-3 px-4">Activity Event</th>
                  <th className="py-3 px-4 font-mono text-right">Affiliate Comm</th>
                  <th className="py-3 px-4 font-mono text-right">Split %</th>
                  <th className="py-3 px-4 font-mono text-right">Net Creator Earnings</th>
                  <th className="py-3 px-4">Status & Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(!ledger || ledger.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No earnings records logged in the transparent ledger yet.
                    </td>
                  </tr>
                ) : (
                  [...ledger].reverse().map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.01] transition">
                      <td className="py-3 px-4 text-gray-400 font-mono text-[10px] whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-[11px] whitespace-nowrap">
                        {entry.orderId}
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-semibold">
                        /{entry.shortCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          entry.action === "commission_confirmed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                            : entry.action === "commission_reversed"
                            ? "bg-red-500/10 text-red-400 border border-red-500/10"
                            : entry.action === "commission_adjusted"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                        }`}>
                          {entry.action?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-gray-300 font-semibold">
                        ${parseFloat(entry.totalAffiliateCommission).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-blue-400 font-bold">
                        {entry.revenueSplitPercent}%
                      </td>
                      <td className={`py-3 px-4 font-mono text-right font-extrabold text-sm ${
                        entry.creatorEarnings >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {entry.creatorEarnings >= 0 ? "+" : ""}${parseFloat(entry.creatorEarnings).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px] max-w-xs leading-normal">
                        {entry.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
