import React, { useState } from "react";
import { 
  PlayCircle, Sparkles, Globe, Laptop, ShoppingCart, 
  ArrowRight, ShieldCheck, HelpCircle, RefreshCw, AlertCircle 
} from "lucide-react";

interface MockSimulatorProps {
  links: any[];
  onSimulationComplete: () => void;
}

export default function MockSimulator({ links, onSimulationComplete }: MockSimulatorProps) {
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [clickCountry, setClickCountry] = useState("United States");
  const [clickDevice, setClickDevice] = useState<"desktop" | "mobile" | "tablet">("mobile");
  const [clickReferrer, setClickReferrer] = useState("Instagram");
  
  const [purchaseAmount, setPurchaseAmount] = useState("150.00");

  const [loadingClick, setLoadingClick] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">("");

  const activeLink = links.find(l => l.id === selectedLinkId) || links[0];

  const isSupportedMerchant = (url: string) => {
    if (!url) return false;
    const domains = ["walmart.com", "amazon.com", "ebay.com", "target.com", "aliexpress.com", "bestbuy.com", "etsy.com"];
    try {
      const parsed = new URL(url);
      return domains.some(d => parsed.hostname.includes(d));
    } catch {
      return false;
    }
  };

  const triggerClickSimulation = async () => {
    if (!activeLink) {
      setFeedback("Please select a short link to simulate traffic.");
      setFeedbackType("error");
      return;
    }

    setLoadingClick(true);
    setFeedback("");
    setFeedbackType("");

    try {
      const res = await fetch("/api/simulator/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: activeLink.shortCode,
          country: clickCountry,
          device: clickDevice,
          referrer: clickReferrer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(`Traffic Simulated! 1 click event recorded for "${activeLink.shortCode}" from ${clickCountry} via ${clickReferrer}.`);
      setFeedbackType("success");
      onSimulationComplete();
    } catch (err: any) {
      setFeedback(err.message);
      setFeedbackType("error");
    } finally {
      setLoadingClick(false);
    }
  };

  const triggerPurchaseSimulation = async () => {
    if (!activeLink) {
      setFeedback("Please select a short link to simulate a purchase.");
      setFeedbackType("error");
      return;
    }

    const subtotal = parseFloat(purchaseAmount);
    if (isNaN(subtotal) || subtotal <= 0) {
      setFeedback("Please enter a valid sale subtotal.");
      setFeedbackType("error");
      return;
    }

    setLoadingPurchase(true);
    setFeedback("");
    setFeedbackType("");

    try {
      const res = await fetch("/api/simulator/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: activeLink.shortCode,
          amount: subtotal
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const order = data.order || {};
      const totalAffComm = parseFloat(order.totalAffiliateCommission || 0).toFixed(2);
      const splitPct = order.revenueSplitPercent || 40;
      const creatorEarnings = parseFloat(order.commissionAmount || 0).toFixed(2);
      const affRate = (order.affiliateCommissionRate || 8).toFixed(1);

      setFeedback(
        `SUCCESS! Simulated purchase recorded. Order ID: ${order.orderId}. Subtotal: $${subtotal.toFixed(2)}.\n\n` +
        `Affiliate Network Commission: $${totalAffComm} (${affRate}% rate).\n` +
        `IPFLACK Revenue Split Rules: ${splitPct}% Creator / ${100 - splitPct}% Platform.\n\n` +
        `Net Creator Earnings: $${creatorEarnings} logged in your wallet under Pending balance.`
      );
      setFeedbackType("success");
      onSimulationComplete();
    } catch (err: any) {
      setFeedback(err.message);
      setFeedbackType("error");
    } finally {
      setLoadingPurchase(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Panel */}
      <div className="glass-panel border-white/5 rounded-2xl p-6 relative overflow-hidden glow-blue">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <PlayCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">IPFLACK Live Traffic Sandbox</h2>
            <p className="text-sm text-gray-400 mt-1">
              Verify your affiliate configurations using our interactive click and checkout sandbox. Simulate live traffic and purchases to instantly watch metrics update, charts rerender, and notifications pop!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Sandbox controls */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Target link selector */}
          <div className="glass-panel border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-400" /> Step 1: Select Your Target Short Link
            </h3>

            {links.length === 0 ? (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-yellow-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>You must generate at least one shortened link under the "Link Shortener" tab before running simulations.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Choose Short Link</label>
                <select
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  value={selectedLinkId}
                  onChange={(e) => {
                    setSelectedLinkId(e.target.value);
                    setFeedback("");
                    setFeedbackType("");
                  }}
                >
                  <option value="" disabled>-- Select a link to test --</option>
                  {links.map((l) => (
                    <option key={l.id} value={l.id}>
                      /{l.shortCode} - {l.title} ({isSupportedMerchant(l.originalUrl) ? "Merchant Rate" : "Standard Rate"})
                    </option>
                  ))}
                </select>

                {activeLink && (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span>Dest:</span>
                      <span className="truncate text-white max-w-[250px] font-mono">{activeLink.originalUrl}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Affiliate redirect:</span>
                      <span className="truncate text-blue-400 font-mono">{activeLink.shortUrl}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIMULATORS SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Click Traffic Simulator */}
            <div className="glass-panel border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" /> Click Visitor Simulator
              </h3>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitor Country</label>
                <select
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  value={clickCountry}
                  onChange={(e) => setClickCountry(e.target.value)}
                >
                  <option value="United States">United States</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                </select>
              </div>

              {/* Device */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Device Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["desktop", "mobile", "tablet"] as const).map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setClickDevice(dev)}
                      className={`py-1.5 px-2 border rounded-lg text-[10px] font-semibold uppercase transition cursor-pointer ${
                        clickDevice === dev
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                          : "bg-black/30 border-white/5 text-gray-500 hover:text-white"
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Referrer */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Social Referrer</label>
                <select
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  value={clickReferrer}
                  onChange={(e) => setClickReferrer(e.target.value)}
                >
                  <option value="Instagram">Instagram (Bio / Story)</option>
                  <option value="TikTok">TikTok (Link in bio)</option>
                  <option value="YouTube">YouTube (Description)</option>
                  <option value="Twitter">Twitter (Post)</option>
                  <option value="WhatsApp">WhatsApp (Private Share)</option>
                  <option value="Direct">Direct / Unspecified</option>
                </select>
              </div>

              <button
                onClick={triggerClickSimulation}
                disabled={loadingClick || !activeLink}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {loadingClick ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Simulate Traffic Click"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Purchase Checkout Simulator */}
            <div className="glass-panel border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> Checkout Simulator
              </h3>

              <p className="text-[11px] text-gray-400 font-normal leading-relaxed">
                Simulates an end-user purchase using your affiliate short link. IPFLACK uses a sustainable, dynamic revenue-sharing model (default: 60% Platform / 40% Creator) based on the actual affiliate commission reported by the partner network (such as Impact) for the completed order.
              </p>

              {/* Purchase Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sale Subtotal ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-mono">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    className="w-full pl-6 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                  />
                </div>
              </div>

              {activeLink && (
                <div className="p-3.5 rounded-xl border border-white/5 text-[11px] space-y-1 text-gray-400">
                  <div className="flex justify-between">
                    <span>Link Target:</span>
                    <span className="font-semibold text-white">
                      {isSupportedMerchant(activeLink.originalUrl) ? "Supported Merchant Rules" : "Standard Affiliate Rules"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Actual Affiliate Comm:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${(parseFloat(purchaseAmount || "0") * (isSupportedMerchant(activeLink.originalUrl) ? 0.08 : 0.05)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                    <span>Creator Split (40%):</span>
                    <span className="font-mono text-blue-400 font-bold">
                      ${(parseFloat(purchaseAmount || "0") * (isSupportedMerchant(activeLink.originalUrl) ? 0.08 : 0.05) * 0.4).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={triggerPurchaseSimulation}
                disabled={loadingPurchase || !activeLink}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {loadingPurchase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Simulate Customer Sale"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Feedback results panel */}
        <div className="lg:col-span-2 glass-panel border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gray-500" /> Simulator Logs
            </h3>

            {feedback ? (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                feedbackType === "success" 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                  : "bg-red-500/5 border-red-500/20 text-red-400"
              }`}>
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                  {feedbackType === "success" ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{feedbackType} response</span>
                </div>
                <p className="leading-relaxed">{feedback}</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xs text-gray-500 italic">Simulated click or sale events will show output logs here in real-time.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 mt-4 text-[10px] text-gray-500">
            <strong className="text-gray-400 uppercase block tracking-wider">How to use:</strong>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Create a short link in the <strong>Link Shortener</strong>.</li>
              <li>Return to this panel and select your newly created link.</li>
              <li>Trigger a click or sale simulation.</li>
              <li>Check your <strong>Creator Dashboard</strong> or <strong>Wallet</strong> to see the real-time changes!</li>
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
}
