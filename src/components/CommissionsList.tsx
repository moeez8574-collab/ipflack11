import React, { useState } from "react";
import { 
  DollarSign, Filter, Download, ArrowUpRight, Clock, CheckCircle2, 
  HelpCircle, CreditCard, Sparkles, FileSpreadsheet 
} from "lucide-react";

interface CommissionsListProps {
  commissions: any[];
}

export default function CommissionsList({ commissions }: CommissionsListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "paid">("all");

  const filteredCommissions = commissions.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  // Export to CSV utility
  const handleExportCSV = () => {
    if (filteredCommissions.length === 0) {
      alert("No records available to export.");
      return;
    }

    const headers = ["Order ID", "Product/Link", "Status", "Sale Subtotal ($)", "Commission Amount ($)", "Created Date"];
    const rows = filteredCommissions.map((c) => [
      c.orderId,
      c.originalUrl || c.shortCode,
      c.status.toUpperCase(),
      c.subtotal.toFixed(2),
      c.commissionAmount.toFixed(2),
      new Date(c.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IPFLACK_earnings_report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Filters and Exporter Panel */}
      <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Status selection */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: "All Commissions" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "paid", label: "Paid" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === item.id
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CSV Export Trigger */}
        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4.5 h-4.5" /> Export Earnings Report (CSV)
        </button>

      </div>

      {/* Main Listing Grid/Table */}
      <div className="glass-panel border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Confirmed & Pending Commission Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Referenced Link</th>
                <th className="py-3 px-4 font-mono">Sale subtotal</th>
                <th className="py-3 px-4 font-mono">Commission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Clearance Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No matching commission records found.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition">
                    <td className="py-3 px-4 font-mono font-bold text-white text-[11px]">
                      {c.orderId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-300">
                      /{c.shortCode} <span className="text-[10px] text-gray-500 font-normal">({c.originalUrl || "tracked"})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-300">
                      ${parseFloat(c.subtotal).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      ${parseFloat(c.commissionAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center gap-1 w-fit ${
                        c.status === "paid"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/10"
                          : c.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                      }`}>
                        {c.status === "paid" && <CheckCircle2 className="w-3 h-3" />}
                        {c.status === "confirmed" && <CheckCircle2 className="w-3 h-3" />}
                        {c.status === "pending" && <Clock className="w-3 h-3 animate-spin" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[10px]">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
