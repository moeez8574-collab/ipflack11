import React, { useState, useEffect } from "react";
import { 
  Shield, Users, Settings, Link2, DollarSign, Wallet, 
  Check, X, RefreshCw, AlertCircle, MessageSquare, ShieldAlert,
  Smartphone, CreditCard, ChevronRight, CheckCircle2,
  Paintbrush, FileText, Percent, ShoppingBag, Mail, ToggleLeft,
  Bell, Activity, TrendingUp, Ban, UserCheck, Edit, Lock, Globe, Eye,
  BarChart3, Landmark, Send, Power, Plus, Database, Trash, Key, Phone
} from "lucide-react";

interface AdminPanelProps {
  token: string;
  onAdminAction: () => void;
}

export default function AdminPanel({ token, onAdminAction }: AdminPanelProps) {
  // Navigation: analytics, payouts, orders, users, links, branding, cms, commission, walmart, payments, templates, notifications, flags
  const [activeSubTab, setActiveSubTab] = useState<
    "analytics" | "payouts" | "orders" | "users" | "links" | "branding" | "cms" | 
    "commission" | "walmart" | "payments" | "templates" | "notifications" | "flags" | "affiliate_networks"
  >("analytics");
  
  // Dynamic Settings state loaded from database
  const [settings, setSettings] = useState<any>({
    trackingId: "",
    defaultCommissionRate: 0,
    confirmedCommissionRate: 0,
    walmartTrackingId: "",
    autoTrackingEnabled: true,
    autoShortenEnabled: true,
    shortLinkBehavior: "immediate",
    manageExpiration: false,
    qrCodeGeneration: true,
    branding: {},
    cms: {},
    commission: {},
    payments: { easypaisa: {}, jazzcash: {}, bank: {} },
    emailTemplates: {},
    featureFlags: {},
    systemSettings: {},
    revenueShare: {
      creatorPct: 40,
      adminPct: 60,
      minWithdrawal: 50,
      autoPayoutApproval: false,
      impactCredentials: { accountSid: "", authToken: "" },
      merchantRules: [
        { id: "mr1", merchant: "walmart.com", rate: 8.0 },
        { id: "mr2", merchant: "amazon.com", rate: 5.0 },
        { id: "mr3", merchant: "ebay.com", rate: 6.0 }
      ]
    }
  });

  // DB Data States
  const [users, setUsers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [affiliatePrograms, setAffiliatePrograms] = useState<any[]>([]);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);

  // Selected program for rules management
  const [selectedProgramId, setSelectedProgramId] = useState<string>("amazon");

  // Form states for creating/editing programs
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [programForm, setProgramForm] = useState({
    programId: "",
    programName: "",
    marketplace: "",
    affiliateNetwork: "",
    logo: "",
    status: "active",
    platformSharePercentage: 60,
    creatorSharePercentage: 40,
    commissionType: "category based"
  });

  // Form states for creating/editing rules
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [ruleForm, setRuleForm] = useState({
    categoryName: "",
    commissionRate: 5,
    platformShare: 60,
    creatorShare: 40,
    status: "active"
  });

  // Modals / Selection States for specific actions
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forms / Input States
  const [fbForm, setFbForm] = useState({ userId: "all", title: "", message: "", type: "announcement" });

  // Load Admin Data
  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Fetch settings
      const settingsRes = await fetch("/api/admin/settings", { headers });
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      // Fetch users
      const usersRes = await fetch("/api/admin/users", { headers });
      setUsers(await usersRes.json());

      // Fetch links
      const linksRes = await fetch("/api/admin/links", { headers });
      setLinks(await linksRes.json());

      // Fetch orders
      const ordersRes = await fetch("/api/admin/orders", { headers });
      setOrders(await ordersRes.json());

      // Fetch payouts
      const payoutsRes = await fetch("/api/admin/payouts", { headers });
      setPayouts(await payoutsRes.json());

      // Fetch affiliate programs
      const progsRes = await fetch("/api/admin/affiliate-programs", { headers });
      if (progsRes.ok) {
        setAffiliatePrograms(await progsRes.json());
      }

      // Fetch commission rules
      const rulesRes = await fetch("/api/admin/commission-rules", { headers });
      if (rulesRes.ok) {
        setCommissionRules(await rulesRes.json());
      }

    } catch (err: any) {
      setError("Failed to load records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  // Affiliate Program CRUD Helpers
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      
      let res;
      if (editingProgram) {
        // Update
        res = await fetch(`/api/admin/affiliate-programs/${editingProgram.programId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(programForm)
        });
      } else {
        // Create
        res = await fetch("/api/admin/affiliate-programs", {
          method: "POST",
          headers,
          body: JSON.stringify(programForm)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save affiliate program");

      setSuccessMsg(editingProgram ? "Affiliate program updated successfully!" : "New affiliate program added successfully!");
      setShowProgramForm(false);
      setEditingProgram(null);
      // Reset form
      setProgramForm({
        programId: "",
        programName: "",
        marketplace: "",
        affiliateNetwork: "",
        logo: "",
        status: "active",
        platformSharePercentage: 60,
        creatorSharePercentage: 40,
        commissionType: "category based"
      });
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditProgramClick = (prog: any) => {
    setEditingProgram(prog);
    setProgramForm({
      programId: prog.programId,
      programName: prog.programName,
      marketplace: prog.marketplace,
      affiliateNetwork: prog.affiliateNetwork,
      logo: prog.logo,
      status: prog.status,
      platformSharePercentage: prog.platformSharePercentage,
      creatorSharePercentage: prog.creatorSharePercentage,
      commissionType: prog.commissionType
    });
    setShowProgramForm(true);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm(`Are you sure you want to delete program '${programId}'? This will also delete all associated category rules.`)) return;
    setError("");
    setSuccessMsg("");
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`/api/admin/affiliate-programs/${programId}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete program");

      setSuccessMsg("Affiliate program deleted successfully!");
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Commission Rule CRUD Helpers
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      
      let res;
      const payload = {
        ...ruleForm,
        programId: selectedProgramId
      };

      if (editingRule) {
        // Update
        res = await fetch(`/api/admin/commission-rules/${editingRule.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch("/api/admin/commission-rules", {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save commission rule");

      setSuccessMsg(editingRule ? "Commission rule updated successfully!" : "New commission category rule added successfully!");
      setShowRuleForm(false);
      setEditingRule(null);
      // Reset form
      setRuleForm({
        categoryName: "",
        commissionRate: 5,
        platformShare: 60,
        creatorShare: 40,
        status: "active"
      });
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditRuleClick = (rule: any) => {
    setEditingRule(rule);
    setRuleForm({
      categoryName: rule.categoryName,
      commissionRate: rule.commissionRate,
      platformShare: rule.platformShare,
      creatorShare: rule.creatorShare,
      status: rule.status
    });
    setShowRuleForm(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm("Are you sure you want to delete this category commission rule?")) return;
    setError("");
    setSuccessMsg("");
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`/api/admin/commission-rules/${ruleId}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete rule");

      setSuccessMsg("Commission category rule deleted successfully!");
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addMerchantRule = () => {
    const rules = settings.revenueShare?.merchantRules || [];
    const newRule = { id: `mr_${Date.now()}`, merchant: "newmerchant.com", rate: 5.0 };
    setSettings({
      ...settings,
      revenueShare: {
        ...settings.revenueShare,
        merchantRules: [...rules, newRule]
      }
    });
  };

  const removeMerchantRule = (id: string) => {
    const rules = settings.revenueShare?.merchantRules || [];
    setSettings({
      ...settings,
      revenueShare: {
        ...settings.revenueShare,
        merchantRules: rules.filter((r: any) => r.id !== id)
      }
    });
  };

  const updateMerchantRule = (id: string, field: string, val: any) => {
    const rules = settings.revenueShare?.merchantRules || [];
    setSettings({
      ...settings,
      revenueShare: {
        ...settings.revenueShare,
        merchantRules: rules.map((r: any) => r.id === id ? { ...r, [field]: val } : r)
      }
    });
  };

  // Unified updater for configuration sections
  const saveSubSettings = async (payload: any, successFeedback: string) => {
    setIsSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update configuration");

      setSettings(data.settings);
      setSuccessMsg(successFeedback);
      onAdminAction();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Withdrawals Action
  const handlePayoutStatus = async (payoutId: string, status: "approved" | "rejected") => {
    setError("");
    setSuccessMsg("");
    setProcessingId(payoutId);
    try {
      const res = await fetch("/api/admin/payouts/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: payoutId, status, notes: adminNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Withdrawal payout ${status === "approved" ? "APPROVED & reference added" : "REJECTED & refunded"}`);
      setAdminNotes("");
      setProcessingId("");
      fetchAdminData();
      onAdminAction();
    } catch (err: any) {
      setError(err.message);
      setProcessingId("");
    }
  };

  // Manual settle commission order
  const handleConfirmOrderCommission = async (orderId: string) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, status: "confirmed" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Order commission manually settled! User credited $${data.order.commissionAmount}`);
      fetchAdminData();
      onAdminAction();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Order status successfully updated to ${newStatus.toUpperCase()}!`);
      fetchAdminData();
      onAdminAction();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAdjustOrderCommission = async (orderId: string, newCommission: number) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/orders/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, totalAffiliateCommission: newCommission })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Order commission adjusted to $${newCommission}! Earnings and ledger updated.`);
      fetchAdminData();
      onAdminAction();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // User status suspension/activation toggle
  const handleToggleSuspension = async (userId: string, currentSuspended: boolean) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId, suspended: !currentSuspended })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`User account successfully ${!currentSuspended ? "SUSPENDED" : "REACTIVATED"}`);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Profile Edit save
  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          walletBalance: editingUser.walletBalance
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Creator profile '${editingUser.name}' successfully modified.`);
      setEditingUser(null);
      fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Send Manual Notification / Broadcast
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbForm.title || !fbForm.message) {
      setError("Title and message are required to broadcast notification.");
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fbForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Broadcast notification successfully dispatched!`);
      setFbForm({ userId: "all", title: "", message: "", type: "announcement" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Panel Header */}
      <div className="glass-panel border-blue-500/15 rounded-2xl p-6 relative overflow-hidden bg-blue-950/10">
        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
          Platform Admin Headquarters <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/10 text-blue-400 rounded-md text-[10px] font-extrabold font-mono">SUPER ADMIN</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Complete structural management of IPFLACK. Configure branding parameters, modify live web sections (CMS), edit messaging templates, manage user accounts, settle cash commissions, and toggle instant features.
        </p>

        {/* Categories Scroller */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-white/5 pt-4">
          {[
            { id: "analytics", label: "Live Analytics", icon: Activity },
            { id: "payouts", label: "Payout Requests", count: payouts.filter(p => p.status === "pending").length, icon: Wallet },
            { id: "orders", label: "Sales & Settle", count: orders.filter(o => o.status === "pending").length, icon: DollarSign },
            { id: "users", label: "User Accounts", icon: Users },
            { id: "links", label: "Short Links List", icon: Link2 },
            { id: "walmart", label: "Affiliate Shortener", icon: ShoppingBag },
            { id: "affiliate_networks", label: "Affiliate Networks", icon: Globe },
            { id: "payments", label: "Payment Accounts", icon: Landmark },
            { id: "commission", label: "Commission setup", icon: Percent },
            { id: "flags", label: "System Features", icon: Power },
            { id: "branding", label: "Branding", icon: Paintbrush },
            { id: "cms", label: "Homepage CMS", icon: FileText },
            { id: "templates", label: "Notification Templates", icon: Mail },
            { id: "notifications", label: "Broadcast Alerts", icon: Bell }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setError("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === tab.id
                    ? "bg-white text-black font-bold shadow-lg"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {"count" in tab && tab.count! > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-extrabold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Errors / Success Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RENDER DYNAMIC SUB-TABS */}

      {/* A. LIVE ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block">Live Platform Clicks</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">18,400</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">▲ +7.1% traffic growth today</span>
            </div>
            <div className="glass-panel border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block">Gross Sales Generated</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">$12,450.00</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">▲ +18.2% sales today</span>
            </div>
            <div className="glass-panel border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block">Commission Tracked</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">$1,867.50</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">▲ Average conversion rate: 6.9%</span>
            </div>
            <div className="glass-panel border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block">Registered Active Creators</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">{users.length} Creators</span>
              <span className="text-[10px] text-gray-400 mt-1 block">All email & phone OTP verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel border-white/5 rounded-2xl p-5 col-span-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Traffic Channel Split</h3>
              <div className="space-y-3">
                {[
                  { source: "Instagram Swipeups", percent: 42, clicks: 7728 },
                  { source: "TikTok Biolinik", percent: 28, clicks: 5152 },
                  { source: "YouTube Description", percent: 18, clicks: 3312 },
                  { source: "Direct / WhatsApp / Other", percent: 12, clicks: 2208 }
                ].map((s) => (
                  <div key={s.source} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{s.source}</span>
                      <span className="text-gray-400 font-mono">{s.clicks.toLocaleString()} clicks ({s.percent}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${s.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Device Demographics</h3>
              <div className="space-y-4">
                {[
                  { label: "Mobile Phones", pct: 79 },
                  { label: "Desktop Computers", pct: 16 },
                  { label: "Tablets", pct: 5 }
                ].map((d) => (
                  <div key={d.label} className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-300">{d.label}</span>
                    <span className="text-xs font-bold text-white font-mono">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. PAYOUTS / WITHDRAWALS */}
      {activeSubTab === "payouts" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-yellow-500" />
            <span>Withdrawals Requests</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Account details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No withdrawal requests logged.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => {
                    const userObj = users.find(u => u.id === p.userId);
                    const isPending = p.status === "pending";
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.01]">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{userObj?.name || p.userId}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(p.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold uppercase text-[10px] text-blue-400">
                          {p.method}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-300">
                          <div>Title: <strong className="text-white">{p.details.accountName}</strong></div>
                          <div>Number: <strong className="text-white">{p.details.accountNumber}</strong></div>
                          {p.details.bankName && <div>Bank: <strong>{p.details.bankName}</strong></div>}
                        </td>
                        <td className="py-3 px-4 font-bold text-white text-sm font-mono">
                          ${parseFloat(p.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            p.status === "approved" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                              : p.status === "rejected" 
                              ? "bg-red-500/10 text-red-400 border border-red-500/10" 
                              : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending ? (
                            <div className="flex flex-col items-end gap-2">
                              {processingId === p.id ? (
                                <div className="space-y-1.5 w-48 text-left bg-black/40 p-2.5 rounded-xl border border-white/10">
                                  <label className="text-[9px] text-gray-400 uppercase font-bold block">Payment reference / notes</label>
                                  <input
                                    type="text"
                                    placeholder="E.g. Ref #981273 settled"
                                    className="w-full px-2 py-1 bg-black/80 border border-white/10 rounded text-[10px] text-white focus:outline-none focus:border-blue-500"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                  <div className="flex gap-1 pt-1 justify-end">
                                    <button
                                      onClick={() => handlePayoutStatus(p.id, "approved")}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[9px] cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handlePayoutStatus(p.id, "rejected")}
                                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[9px] cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => setProcessingId("")}
                                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded text-[9px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setProcessingId(p.id);
                                    setAdminNotes("");
                                  }}
                                  className="px-3 py-1 bg-white hover:bg-gray-200 text-black rounded-lg text-[11px] font-bold cursor-pointer"
                                >
                                  Process Withdrawal
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono italic">
                              Settled ref: {p.notes || "None"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* C. SALES & COMMISSIONS */}
      {activeSubTab === "orders" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Orders Settlement Ledger</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Settle actual affiliate network commissions, split percentages, adjust transactions, and transition order states.</p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-xl text-[10px] text-orange-400 font-semibold max-w-sm">
              Note: Settle confirmed order commissions to automatically distribute net split balances to creator wallets.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID / Date</th>
                  <th className="py-3 px-4">Creator / Short code</th>
                  <th className="py-3 px-4">Sales Volume</th>
                  <th className="py-3 px-4">Affiliate & Creator Split</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settlement & Adjust Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No customer orders simulated or recorded yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const userObj = users.find(u => u.id === o.userId);
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.01] transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white block">{o.orderId}</span>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(o.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{userObj?.name || o.userId}</span>
                          <span className="text-[10px] text-blue-400 font-mono">/{o.shortCode}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono font-bold">
                          ${parseFloat(o.subtotal).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-[10px] font-semibold">
                              Total Affiliate Comm: <strong className="text-gray-300 font-mono">${parseFloat(o.totalAffiliateCommission || 0).toFixed(2)}</strong>
                            </span>
                            <span className="text-emerald-400 text-[11px] font-bold">
                              Net Creator Split (40%): <strong className="font-mono">${parseFloat(o.commissionAmount || 0).toFixed(2)}</strong>
                            </span>
                          </div>
                          
                          {/* Inline Affiliate Adjustment Form */}
                          <div className="mt-2.5 flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Adjust"
                              className="w-16 px-2 py-1 bg-black/60 border border-white/10 rounded text-[10px] text-white font-mono focus:outline-none"
                              id={`adj-${o.id}`}
                              defaultValue={parseFloat(o.totalAffiliateCommission || 0).toFixed(2)}
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(`adj-${o.id}`) as HTMLInputElement;
                                if (el) {
                                  handleAdjustOrderCommission(o.id, parseFloat(el.value) || 0);
                                }
                              }}
                              className="px-2 py-1 bg-blue-600/35 hover:bg-blue-500 border border-blue-500/20 text-white font-bold rounded text-[9px] transition"
                            >
                              Adjust Comm
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            o.status === "paid" 
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" 
                              : o.status === "confirmed" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                              : o.status === "reversed"
                              ? "bg-red-500/10 text-red-400 border border-red-500/10"
                              : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {o.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "confirmed")}
                                  className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/40 rounded text-[9px] font-extrabold transition cursor-pointer"
                                >
                                  Confirm Settle
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "reversed")}
                                  className="px-2.5 py-1.5 bg-red-500/20 text-red-300 border border-red-500/20 hover:bg-red-500/40 rounded text-[9px] font-extrabold transition cursor-pointer"
                                >
                                  Reverse Payout
                                </button>
                              </>
                            )}

                            {o.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "paid")}
                                  className="px-2.5 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/20 hover:bg-blue-500/40 rounded text-[9px] font-extrabold transition cursor-pointer"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "reversed")}
                                  className="px-2.5 py-1.5 bg-red-500/20 text-red-300 border border-red-500/20 hover:bg-red-500/40 rounded text-[9px] font-extrabold transition cursor-pointer"
                                >
                                  Reverse Payout
                                </button>
                              </>
                            )}

                            {o.status === "paid" && (
                              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10">
                                <Check className="w-3.5 h-3.5" /> Paid Creator
                              </span>
                            )}

                            {o.status === "reversed" && (
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-red-500/5 px-2.5 py-1 rounded-lg border border-red-500/10">
                                <X className="w-3.5 h-3.5" /> Reversed Order
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D. USERS REGISTRY & CONTROLS */}
      {activeSubTab === "users" && (
        <div className="space-y-6">
          {/* Main List */}
          <div className="glass-panel border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Registered Accounts Registry</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Creator Detail</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Verifications</th>
                    <th className="py-3 px-4">Available Balance</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4 space-y-1">
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[10px] text-gray-400 block">{u.email} | {u.phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <div className="text-[10px] text-gray-300">Email: <strong className={u.isEmailVerified ? "text-emerald-400" : "text-red-400"}>{u.isEmailVerified ? "Verified" : "Pending"}</strong></div>
                        <div className="text-[10px] text-gray-300">Phone: <strong className={u.isPhoneVerified ? "text-emerald-400" : "text-red-400"}>{u.isPhoneVerified ? "Verified" : "Pending"}</strong></div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        ${(u.walletBalance || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.suspended ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {u.suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setEditingUser({
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            role: u.role,
                            walletBalance: u.walletBalance || 0
                          })}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded text-[10px]"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleToggleSuspension(u.id, !!u.suspended)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            u.suspended 
                              ? "bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25" 
                              : "bg-red-600/15 text-red-400 hover:bg-red-600/25"
                          }`}
                        >
                          {u.suspended ? "Activate" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal / Panel */}
          {editingUser && (
            <div className="glass-panel border-blue-500/20 bg-blue-950/10 rounded-2xl p-6 max-w-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-blue-400" />
                  <span>Modify Creator: {editingUser.name}</span>
                </h4>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUserProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-semibold">Creator Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-semibold">User Role</label>
                    <select
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="creator">Creator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-semibold">Email Contact</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-semibold">Phone Contact</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Manually Adjust Available Wallet Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono font-bold"
                    value={editingUser.walletBalance}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: parseFloat(e.target.value) })}
                  />
                  <span className="text-[10px] text-gray-500">Warning: Changing this modifies the actual cash amount the creator is eligible to withdraw.</span>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    Save Creator Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* E. SHORT LINKS LIST */}
      {activeSubTab === "links" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            <span>Shorttracked Database Links</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Alias Code</th>
                  <th className="py-3 px-4">Description / Title</th>
                  <th className="py-3 px-4">Merchant Original Destination URL</th>
                  <th className="py-3 px-4 font-mono text-right">Total Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {links.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      /{l.shortCode}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {l.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400 truncate max-w-[320px]" title={l.originalUrl}>
                      {l.originalUrl}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-right">
                      {(l.totalClicks || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* F. AFFILIATE SHORTENER */}
      {activeSubTab === "walmart" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span>Affiliate Link Shortener Parameters</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({
                walmartTrackingId: settings.walmartTrackingId,
                autoTrackingEnabled: settings.autoTrackingEnabled,
                autoShortenEnabled: settings.autoShortenEnabled,
                shortLinkBehavior: settings.shortLinkBehavior,
                manageExpiration: settings.manageExpiration,
                qrCodeGeneration: settings.qrCodeGeneration
              }, "Affiliate Shortener configurations saved successfully!");
            }}
            className="space-y-4 max-w-xl"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Default Affiliate Tracking ID / Global Fallback</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none"
                value={settings.walmartTrackingId || ""}
                onChange={(e) => setSettings({ ...settings, walmartTrackingId: e.target.value })}
              />
              <p className="text-[10px] text-gray-500">
                This tracking ID is used as the global fallback. For Walmart links, it auto-appends as <code className="bg-white/5 px-1 rounded text-white font-mono">?affp1={settings.walmartTrackingId || "YOUR_ID"}</code>. For other supported merchants, it appends as the relevant tracker (e.g., <code className="bg-white/5 px-1 rounded text-white font-mono">?tag=</code> for Amazon, <code className="bg-white/5 px-1 rounded text-white font-mono">?affid=</code> for Target).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Short Link Redirect Mode</label>
              <select
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                value={settings.shortLinkBehavior || "immediate"}
                onChange={(e) => setSettings({ ...settings, shortLinkBehavior: e.target.value })}
              >
                <option value="immediate">Immediate HTTP Redirect (302 Direct)</option>
                <option value="interstitial_gate">Custom Interstitial Password / Verification Gate</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="autoTrackingEnabled"
                  checked={!!settings.autoTrackingEnabled}
                  onChange={(e) => setSettings({ ...settings, autoTrackingEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                />
                <label htmlFor="autoTrackingEnabled" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
                  Auto Tracking Appending
                </label>
              </div>

              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="autoShortenEnabled"
                  checked={!!settings.autoShortenEnabled}
                  onChange={(e) => setSettings({ ...settings, autoShortenEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                />
                <label htmlFor="autoShortenEnabled" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
                  Default Auto Shorten
                </label>
              </div>

              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="manageExpiration"
                  checked={!!settings.manageExpiration}
                  onChange={(e) => setSettings({ ...settings, manageExpiration: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                />
                <label htmlFor="manageExpiration" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
                  Enable Links Expiration
                </label>
              </div>

              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="qrCodeGeneration"
                  checked={!!settings.qrCodeGeneration}
                  onChange={(e) => setSettings({ ...settings, qrCodeGeneration: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                />
                <label htmlFor="qrCodeGeneration" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
                  Generate Short QR Codes
                </label>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Affiliate Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* G. PAYMENT METHODS CONFIGURATION */}
      {activeSubTab === "payments" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Configured Payment Gateways / Cashout Details</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ payments: settings.payments }, "Payment channels credentials saved successfully!");
            }}
            className="space-y-6 max-w-2xl"
          >
            {/* Easypaisa */}
            <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">Easypaisa Channel</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="epEnabled"
                    checked={!!settings.payments?.easypaisa?.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        easypaisa: { ...settings.payments?.easypaisa, enabled: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="epEnabled" className="text-xs text-gray-400 font-semibold cursor-pointer">Enabled</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Account Holder Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.easypaisa?.accountTitle || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        easypaisa: { ...settings.payments?.easypaisa, accountTitle: e.target.value }
                      }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Easypaisa Account Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.easypaisa?.accountNumber || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        easypaisa: { ...settings.payments?.easypaisa, accountNumber: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* JazzCash */}
            <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider block">JazzCash Channel</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jcEnabled"
                    checked={!!settings.payments?.jazzcash?.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        jazzcash: { ...settings.payments?.jazzcash, enabled: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="jcEnabled" className="text-xs text-gray-400 font-semibold cursor-pointer">Enabled</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Account Holder Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.jazzcash?.accountTitle || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        jazzcash: { ...settings.payments?.jazzcash, accountTitle: e.target.value }
                      }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">JazzCash Account Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.jazzcash?.accountNumber || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        jazzcash: { ...settings.payments?.jazzcash, accountNumber: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Bank Transfer Channel</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bankEnabled"
                    checked={!!settings.payments?.bank?.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        bank: { ...settings.payments?.bank, enabled: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="bankEnabled" className="text-xs text-gray-400 font-semibold cursor-pointer">Enabled</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Bank Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.bank?.bankName || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        bank: { ...settings.payments?.bank, bankName: e.target.value }
                      }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Account Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.bank?.accountTitle || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        bank: { ...settings.payments?.bank, accountTitle: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.bank?.accountNumber || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        bank: { ...settings.payments?.bank, accountNumber: e.target.value }
                      }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">IBAN Code (if applicable)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                    value={settings.payments?.bank?.iban || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        bank: { ...settings.payments?.bank, iban: e.target.value }
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Save Payment Channels Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* H. COMMISSION SETUP */}
      {activeSubTab === "commission" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Percent className="w-4 h-4 text-orange-400" />
            <span>Revenue Share & Commission Parameters</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ 
                commission: settings.commission,
                revenueShare: settings.revenueShare
              }, "Commission parameters and revenue-sharing setup updated successfully!");
            }}
            className="space-y-6"
          >
            {/* Split Parameters Card */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-400" />
                Dynamic Creator Split Scheme
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                IPFLACK splits actual affiliate network payouts dynamically. Enter the Creator's distribution percentage. The platform retains the remainder.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Creator Revenue Split (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.revenueShare?.creatorPct ?? 40}
                    onChange={(e) => {
                      const creatorPct = parseFloat(e.target.value) || 0;
                      const adminPct = Math.max(0, 100 - creatorPct);
                      setSettings({
                        ...settings,
                        revenueShare: {
                          ...settings.revenueShare,
                          creatorPct,
                          adminPct
                        }
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Platform Share (IPFLACK) (%)</label>
                  <input
                    type="number"
                    readOnly
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/5 rounded-xl text-gray-500 font-mono text-xs focus:outline-none cursor-not-allowed"
                    value={settings.revenueShare?.adminPct ?? 60}
                  />
                </div>
              </div>
            </div>

            {/* General parameters */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                Default Platform Commission Rates
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Set baseline referral track rates applied globally if no specific merchant override rules match.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Standard Referral Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.commission?.defaultCommissionRate ?? 10}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        commission: { ...(settings.commission || {}), defaultCommissionRate: isNaN(val) ? "" : val }
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Confirmed Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.commission?.confirmedCommissionRate ?? 15}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        commission: { ...(settings.commission || {}), confirmedCommissionRate: isNaN(val) ? "" : val }
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Referral & Campaign Bonus Rules */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Referral Program & Seasonal Campaign Bonuses
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Configure user referral commission bonuses and active incentive campaign bonus rates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">User Referral Bonus Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.commission?.referralRate ?? 2.5}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        commission: { ...(settings.commission || {}), referralRate: isNaN(val) ? "" : val }
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Campaign Bonus Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.commission?.bonusCampaignRate ?? 5.0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        commission: { ...(settings.commission || {}), bonusCampaignRate: isNaN(val) ? "" : val }
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Enable Active Seasonal Bonus Campaign</span>
                  <span className="text-[10px] text-gray-400">Apply bonus campaign rates on new tracking payouts</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.commission?.activeBonusCampaign}
                  onChange={(e) => setSettings({
                    ...settings,
                    commission: { ...(settings.commission || {}), activeBonusCampaign: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Withdrawal & Auto Rules */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                Withdrawal & Approval Thresholds
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Minimum Cashout Withdrawal Amount ($)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.revenueShare?.minWithdrawal ?? 50}
                    onChange={(e) => setSettings({
                      ...settings,
                      revenueShare: {
                        ...settings.revenueShare,
                        minWithdrawal: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Approval Scheme</label>
                  <select
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                    value={settings.revenueShare?.autoPayoutApproval ? "auto" : "manual"}
                    onChange={(e) => setSettings({
                      ...settings,
                      revenueShare: {
                        ...settings.revenueShare,
                        autoPayoutApproval: e.target.value === "auto"
                      }
                    })}
                  >
                    <option value="manual">Manual Super Admin Review (Recommended)</option>
                    <option value="auto">Instant Automatic Payout Approval</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partner Network Credentials */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Partner Affiliate Integration (Impact Network API)
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Credentials utilized to read real-time commission, conversions, and adjustment logs directly from affiliate partners like Impact.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Impact Account SID</label>
                  <input
                    type="text"
                    placeholder="e.g. AccountSID_12345"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.revenueShare?.impactCredentials?.accountSid ?? ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      revenueShare: {
                        ...settings.revenueShare,
                        impactCredentials: {
                          ...(settings.revenueShare?.impactCredentials || {}),
                          accountSid: e.target.value
                        }
                      }
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Impact Auth Token</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.revenueShare?.impactCredentials?.authToken ?? ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      revenueShare: {
                        ...settings.revenueShare,
                        impactCredentials: {
                          ...(settings.revenueShare?.impactCredentials || {}),
                          authToken: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Merchant Rules List overrides */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-yellow-400" />
                  Merchant Affiliate Overrides
                </h4>
                <button
                  type="button"
                  onClick={addMerchantRule}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3" /> Add Override
                </button>
              </div>

              <p className="text-[11px] text-gray-400 leading-normal">
                Set custom commission rates for specific merchants. Traffic matches are evaluated against the link domain immediately.
              </p>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {(!settings.revenueShare?.merchantRules || settings.revenueShare.merchantRules.length === 0) ? (
                  <p className="text-xs text-gray-500 italic py-4 text-center">No merchant rules established. Fallbacks apply.</p>
                ) : (
                  settings.revenueShare.merchantRules.map((rule: any) => (
                    <div key={rule.id} className="flex items-center gap-3 p-3 bg-black/30 border border-white/5 rounded-xl">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. walmart.com"
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none"
                          value={rule.merchant}
                          onChange={(e) => updateMerchantRule(rule.id, "merchant", e.target.value)}
                        />
                      </div>
                      <div className="w-32 flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Rate"
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none text-right"
                          value={rule.rate}
                          onChange={(e) => updateMerchantRule(rule.id, "rate", parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMerchantRule(rule.id)}
                        className="p-1.5 hover:bg-red-500/15 hover:text-red-400 rounded-lg text-gray-400 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Save Commission & Split Settings
              </button>
            </div>
          </form>

          {/* DYNAMIC MULTI-AFFILIATE REVENUE ENGINE SECTION */}
          <div className="mt-12 border-t border-white/5 pt-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Multi-Affiliate Revenue Engine & Programs</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  CRUD manage unlimited affiliate programs (Amazon, Walmart, Target, eBay, etc.) and category rules. Traffic matching and dynamic splitting execute automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProgram(null);
                  setProgramForm({
                    programId: "",
                    programName: "",
                    marketplace: "",
                    affiliateNetwork: "",
                    logo: "",
                    status: "active",
                    platformSharePercentage: 60,
                    creatorSharePercentage: 40,
                    commissionType: "category based"
                  });
                  setShowProgramForm(!showProgramForm);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Program</span>
              </button>
            </div>

            {/* PROGRAM FORM (COLLAPSIBLE) */}
            {showProgramForm && (
              <div className="bg-white/5 p-5 border border-indigo-500/10 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  {editingProgram ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{editingProgram ? `Edit Affiliate Program: ${editingProgram.programId}` : "Create New Affiliate Program"}</span>
                </h4>
                
                <form onSubmit={handleSaveProgram} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Program ID (Unique, slug)</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProgram}
                        placeholder="e.g. target"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={programForm.programId}
                        onChange={(e) => setProgramForm({ ...programForm, programId: e.target.value.toLowerCase().trim() })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Program Public Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Target Affiliate"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                        value={programForm.programName}
                        onChange={(e) => setProgramForm({ ...programForm, programName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Affiliate Network Partner</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Impact Radius, Amazon, CJ"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                        value={programForm.affiliateNetwork}
                        onChange={(e) => setProgramForm({ ...programForm, affiliateNetwork: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Marketplace Domains (Comma-separated matchers)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. target.com, goto.target.com"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                        value={programForm.marketplace}
                        onChange={(e) => setProgramForm({ ...programForm, marketplace: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Program Logo URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none font-mono"
                        value={programForm.logo}
                        onChange={(e) => setProgramForm({ ...programForm, logo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Commission Calculation Engine</label>
                      <select
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                        value={programForm.commissionType}
                        onChange={(e) => setProgramForm({ ...programForm, commissionType: e.target.value as any })}
                      >
                        <option value="category based">Category Based Rates (Amazon-style)</option>
                        <option value="dynamic">Dynamic Network Commission (Walmart-style)</option>
                        <option value="fixed">Fixed Flat Payout Fee (CPA / Lead)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Platform Share (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                        value={programForm.platformSharePercentage}
                        onChange={(e) => {
                          const platformShare = parseFloat(e.target.value) || 0;
                          const creatorShare = Math.max(0, 100 - platformShare);
                          setProgramForm({ ...programForm, platformSharePercentage: platformShare, creatorSharePercentage: creatorShare });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-semibold">Creator Split Share (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                        value={programForm.creatorSharePercentage}
                        onChange={(e) => {
                          const creatorShare = parseFloat(e.target.value) || 0;
                          const platformShare = Math.max(0, 100 - creatorShare);
                          setProgramForm({ ...programForm, creatorSharePercentage: creatorShare, platformSharePercentage: platformShare });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="status-checkbox"
                        className="rounded border-white/15 bg-black/40 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        checked={programForm.status === "active"}
                        onChange={(e) => setProgramForm({ ...programForm, status: e.target.checked ? "active" : "inactive" })}
                      />
                      <label htmlFor="status-checkbox" className="text-xs text-gray-300 font-semibold cursor-pointer">
                        Program Active (Enable live shortening & simulator traffic)
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProgramForm(false);
                          setEditingProgram(null);
                        }}
                        className="px-4 py-2 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Program</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* SPLIT LAYOUT: LEFT PROGRAMS LIST, RIGHT CATEGORY RULES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: PROGRAMS CONTAINER */}
              <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Affiliate Programs</span>
                  </h4>
                  <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/15 rounded text-[10px] text-blue-400 font-mono font-bold">
                    {affiliatePrograms.length} Configured
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {affiliatePrograms.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-6 text-center">No affiliate programs configured.</p>
                  ) : (
                    affiliatePrograms.map((p) => {
                      const isSelected = selectedProgramId === p.programId;
                      return (
                        <div
                          key={p.programId}
                          onClick={() => setSelectedProgramId(p.programId)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 relative group ${
                            isSelected
                              ? "bg-white/10 border-indigo-500/40 shadow-md"
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={p.logo || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=80&q=80"}
                                alt={p.programName}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-md object-cover bg-black/50 shrink-0"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-white font-mono">{p.programName}</h5>
                                <p className="text-[10px] text-gray-400">{p.affiliateNetwork}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  p.status === "active"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-2 text-[10px] font-mono text-gray-400">
                            <div>
                              <span className="block text-[9px] text-gray-500">Domain Match:</span>
                              <span className="text-white text-[9px] truncate block" title={p.marketplace}>{p.marketplace}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-gray-500">Type:</span>
                              <span className="text-indigo-400 text-[9px] capitalize block">{p.commissionType}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-gray-500">Revenue split:</span>
                              <span className="text-emerald-400 text-[9px] block font-bold">{p.creatorSharePercentage}/{p.platformSharePercentage}%</span>
                            </div>
                          </div>

                          {/* ACTION BUTTONS (HOVER / MOBILE ALWAYS) */}
                          <div className="flex items-center justify-end gap-1.5 border-t border-white/5 pt-1.5 mt-0.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition duration-150">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProgramClick(p);
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-indigo-500/20 hover:text-white rounded text-[10px] font-medium text-gray-300 flex items-center gap-1 transition"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProgram(p.programId);
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-red-500/25 hover:text-red-400 rounded text-[10px] font-medium text-gray-300 flex items-center gap-1 transition"
                            >
                              <Trash className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT: COMMISSION CATEGORY RULES LIST CONTAINER */}
              <div className="lg:col-span-7 bg-black/20 border border-white/5 rounded-2xl p-4 space-y-4">
                {(() => {
                  const program = affiliatePrograms.find(p => p.programId === selectedProgramId);
                  const rules = commissionRules.filter(r => r.programId === selectedProgramId);
                  
                  if (!program) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 italic text-xs">
                        <Activity className="w-8 h-8 text-gray-600 mb-2 animate-pulse" />
                        <span>Select an affiliate program on the left to manage category commission rules.</span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Rules: {program.programName} ({program.marketplace})</span>
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Calculation: <span className="text-indigo-400 font-mono capitalize">{program.commissionType}</span> split rules.
                          </p>
                        </div>
                        
                        {program.commissionType === "category based" && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRule(null);
                              setRuleForm({
                                categoryName: "",
                                commissionRate: 5,
                                platformShare: program.platformSharePercentage,
                                creatorShare: program.creatorSharePercentage,
                                status: "active"
                              });
                              setShowRuleForm(!showRuleForm);
                            }}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Rule</span>
                          </button>
                        )}
                      </div>

                      {/* RULE CREATE/EDIT FORM */}
                      {showRuleForm && (
                        <div className="bg-white/5 p-4 border border-indigo-500/10 rounded-xl space-y-3">
                          <h5 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                            {editingRule ? "Edit Category Rule" : "Add Program Category Rule"}
                          </h5>
                          
                          <form onSubmit={handleSaveRule} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-300 font-semibold">Category Name</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Apparel & Fashion, Electronics"
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                                  value={ruleForm.categoryName}
                                  onChange={(e) => setRuleForm({ ...ruleForm, categoryName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-300 font-semibold">Affiliate Commission Rate (%)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  required
                                  min="0"
                                  max="100"
                                  placeholder="e.g. 4.5"
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none"
                                  value={ruleForm.commissionRate}
                                  onChange={(e) => setRuleForm({ ...ruleForm, commissionRate: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-300 font-semibold">Creator Share Split (%)</label>
                                <input
                                  type="number"
                                  required
                                  min="0"
                                  max="100"
                                  placeholder="40"
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none"
                                  value={ruleForm.creatorShare}
                                  onChange={(e) => {
                                    const cr = parseFloat(e.target.value) || 0;
                                    setRuleForm({ ...ruleForm, creatorShare: cr, platformShare: Math.max(0, 100 - cr) });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-semibold">IPFLACK Split (%)</label>
                                <input
                                  type="number"
                                  readOnly
                                  className="w-full px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg text-gray-500 font-mono text-xs focus:outline-none cursor-not-allowed"
                                  value={ruleForm.platformShare}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-300 font-semibold">Rule Status</label>
                                <select
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                                  value={ruleForm.status}
                                  onChange={(e) => setRuleForm({ ...ruleForm, status: e.target.value as any })}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowRuleForm(false);
                                  setEditingRule(null);
                                }}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] font-semibold transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save Rule</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* DISPLAY OF RULES */}
                      {program.commissionType !== "category based" ? (
                        <div className="bg-black/40 border border-white/5 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                          <Activity className="w-8 h-8 text-indigo-400/50 mb-2" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                            {program.commissionType === "dynamic" ? "Dynamic Network Commission" : "Fixed Action CPA Payout"}
                          </h5>
                          <p className="text-[11px] text-gray-400 max-w-sm leading-relaxed">
                            {program.programName} uses a {program.commissionType} payout structure. Commissions are fetched dynamically from the affiliate network callback logs (such as Impact/Amazon) rather than using static category rates. Revenue split is auto-divided <strong>{program.creatorSharePercentage}%</strong> to creator, and <strong>{program.platformSharePercentage}%</strong> to IPFLACK.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                          {rules.length === 0 ? (
                            <div className="text-center py-10 text-xs text-gray-500 italic">
                              No category rules created yet. Fallback to default rates.
                            </div>
                          ) : (
                            rules.map((r) => (
                              <div
                                key={r.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl gap-2"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white font-mono">{r.categoryName}</span>
                                    <span
                                      className={`px-1 py-0.2 rounded text-[8px] font-extrabold uppercase font-mono ${
                                        r.status === "active"
                                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                                      }`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-gray-500 mt-0.5 font-mono">
                                    Rule ID: {r.id} • Split: Creator {r.creatorShare}% / IPFLACK {r.platformShare}%
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-xs font-bold text-indigo-400 font-mono">{r.commissionRate}%</span>
                                    <span className="block text-[8px] text-gray-500 uppercase">Comm Rate</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditRuleClick(r)}
                                      className="p-1 hover:bg-indigo-500/15 hover:text-white rounded-lg text-gray-400 transition"
                                      title="Edit Category Rule"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRule(r.id)}
                                      className="p-1 hover:bg-red-500/15 hover:text-red-400 rounded-lg text-gray-400 transition"
                                      title="Delete Category Rule"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* I. BRANDING SETTINGS */}
      {activeSubTab === "branding" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-purple-400" />
            <span>Identity & Custom Branding Setup</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ branding: settings.branding }, "Branding & Identity settings successfully saved!");
            }}
            className="space-y-4 max-w-xl"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Website Display Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.branding?.websiteName || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, websiteName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Selected Font Family</label>
                <select
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                  value={settings.branding?.font || "Inter"}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, font: e.target.value }
                  })}
                >
                  <option value="Inter">Inter (Clean Modernist)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech Forward)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Developer aesthetic)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Logo Image Link</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.branding?.logo || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, logo: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Favicon Link (32x32)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.branding?.favicon || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, favicon: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Primary Color Accent</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.branding?.primaryColor || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, primaryColor: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Secondary Color Accent</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.branding?.secondaryColor || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, secondaryColor: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.branding?.contactEmail || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, contactEmail: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Contact Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.branding?.contactPhone || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, contactPhone: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">SEO Search Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                value={settings.branding?.seoTitle || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  branding: { ...settings.branding, seoTitle: e.target.value }
                })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">SEO Search Description Meta</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                value={settings.branding?.seoDescription || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  branding: { ...settings.branding, seoDescription: e.target.value }
                })}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Branding Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* J. WEBSITE CONTENT MANAGEMENT (CMS) */}
      {activeSubTab === "cms" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Website Live Content Editor (CMS)</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ cms: settings.cms }, "CMS blocks saved successfully!");
            }}
            className="space-y-4 max-w-2xl"
          >
            {/* Hero Banner CMS */}
            <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-3">
              <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider block">Homepage Hero Section</span>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Hero Heading Header Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.cms?.homepageTitle || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    cms: { ...settings.cms, homepageTitle: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Hero Subtitle Text</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.cms?.homepageHeroSubtitle || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    cms: { ...settings.cms, homepageHeroSubtitle: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Features section text */}
            <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-3">
              <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider block">Feature Blocks</span>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">Feature 1 Name</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-white"
                    value={settings.cms?.feature1Title || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      cms: { ...settings.cms, feature1Title: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">Feature 2 Name</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-white"
                    value={settings.cms?.feature2Title || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      cms: { ...settings.cms, feature2Title: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">Feature 3 Name</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-white"
                    value={settings.cms?.feature3Title || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      cms: { ...settings.cms, feature3Title: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Announcement Bar Text Alert</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  value={settings.cms?.announcementBar || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    cms: { ...settings.cms, announcementBar: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* General Pages */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">FAQ Page (Question & Answer Blocks)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.cms?.faq || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    cms: { ...settings.cms, faq: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Terms & Conditions Agreement</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                  value={settings.cms?.termsConditions || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    cms: { ...settings.cms, termsConditions: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Publish Live Content CMS
              </button>
            </div>
          </form>
        </div>
      )}

      {/* K. NOTIFICATIONS EMAIL & SMS TEMPLATES */}
      {activeSubTab === "templates" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Messaging & Verification Templates</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ emailTemplates: settings.emailTemplates }, "Notification messaging templates saved!");
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/10 rounded-xl p-3 text-[10px] text-yellow-500">
              💡 Template Engine Instructions: Use wildcards <code className="bg-white/5 p-0.5 rounded font-mono text-white">{"{{name}}"}</code>, <code className="bg-white/5 p-0.5 rounded font-mono text-white">{"{{code}}"}</code>, <code className="bg-white/5 p-0.5 rounded font-mono text-white">{"{{amount}}"}</code>, <code className="bg-white/5 p-0.5 rounded font-mono text-white">{"{{method}}"}</code> or <code className="bg-white/5 p-0.5 rounded font-mono text-white">{"{{ref}}"}</code> to inject context fields.
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Registration Verification Email</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                value={settings.emailTemplates?.registrationVerification || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  emailTemplates: { ...settings.emailTemplates, registrationVerification: e.target.value }
                })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Phone OTP Verification SMS</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                value={settings.emailTemplates?.phoneOtp || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  emailTemplates: { ...settings.emailTemplates, phoneOtp: e.target.value }
                })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Withdrawal Approved Confirmation</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                value={settings.emailTemplates?.withdrawalApproved || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  emailTemplates: { ...settings.emailTemplates, withdrawalApproved: e.target.value }
                })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Withdrawal Declined Message</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono"
                value={settings.emailTemplates?.withdrawalRejected || ""}
                onChange={(e) => setSettings({
                  ...settings,
                  emailTemplates: { ...settings.emailTemplates, withdrawalRejected: e.target.value }
                })}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Message Templates
              </button>
            </div>
          </form>

          {/* Real OTP Gateways Configuration Section */}
          <div className="border-t border-white/5 my-8 pt-8">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Real SMS & Email Verification Gateways</span>
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSubSettings(
                  { authCredentials: settings.authCredentials },
                  "Real SMS & Email Gateway configurations successfully updated!"
                );
              }}
              className="space-y-6"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 mb-6">
                ℹ️ Configure real SMTP and Twilio parameters below. Once saved, these will override local defaults and automatically process real-time Email and SMS OTP verifications. If left blank, standard fallback simulators remain available for development purposes.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMTP Email Gateway */}
                <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
                  <h5 className="text-sm font-semibold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>SMTP Mail Server Gateway</span>
                  </h5>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] text-gray-400 font-medium">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                        value={settings.authCredentials?.smtpHost || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            authCredentials: { ...settings.authCredentials, smtpHost: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-medium">Port</label>
                      <input
                        type="text"
                        placeholder="587"
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                        value={settings.authCredentials?.smtpPort || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            authCredentials: { ...settings.authCredentials, smtpPort: e.target.value }
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Username / Email Address</label>
                    <input
                      type="text"
                      placeholder="user@gmail.com"
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.smtpUser || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, smtpUser: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Password / App Secret</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.smtpPass || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, smtpPass: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Sender Email ("From" Field)</label>
                    <input
                      type="text"
                      placeholder='"IPFLACK Admin" <support@ipflack.online>'
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.smtpFrom || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, smtpFrom: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>

                {/* Twilio SMS Gateway */}
                <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
                  <h5 className="text-sm font-semibold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Twilio SMS Gateway</span>
                  </h5>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Twilio Account SID</label>
                    <input
                      type="text"
                      placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.twilioSid || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, twilioSid: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Twilio Auth Token</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.twilioToken || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, twilioToken: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Twilio Sender Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1234567890"
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                      value={settings.authCredentials?.twilioPhone || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          authCredentials: { ...settings.authCredentials, twilioPhone: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition"
                >
                  {isSaving ? "Saving Config..." : "Save Gateway Configurations"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* L. MANUAL / BROADCAST ALERTS */}
      {activeSubTab === "notifications" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-500" />
            <span>Dispatch Broadcast / Alert Notification</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Target Audience</label>
                <select
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                  value={fbForm.userId}
                  onChange={(e) => setFbForm({ ...fbForm, userId: e.target.value })}
                >
                  <option value="all">Platform Broadcast (All Active Users)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Notification Visual Type</label>
                <select
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                  value={fbForm.type}
                  onChange={(e) => setFbForm({ ...fbForm, type: e.target.value })}
                >
                  <option value="announcement">Announcement Broadcast (Yellow Bell)</option>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <option value="click">Click Alert (Blue Link)</option>
                  <option value="payout_approved">Settlement Alert (Emerald Check)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Announcement Title Header</label>
              <input
                type="text"
                required
                placeholder="E.g. 🛠️ Schedule Server Maintenance alert"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                value={fbForm.title}
                onChange={(e) => setFbForm({ ...fbForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">Message Body</label>
              <textarea
                rows={3}
                required
                placeholder="Write your platform notice detail here..."
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                value={fbForm.message}
                onChange={(e) => setFbForm({ ...fbForm, message: e.target.value })}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Alert Notification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* M. SYSTEM FEATURES & TOGGLES */}
      {activeSubTab === "flags" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Power className="w-4 h-4 text-emerald-400" />
            <span>System Features & Toggles (Flags)</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({ featureFlags: settings.featureFlags }, "System feature flags successfully saved.");
            }}
            className="space-y-6 max-w-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Referrals Program</span>
                  <span className="text-[10px] text-gray-400">Commission bonuses for referral signups</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.referrals}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, referrals: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">QR Code Generation</span>
                  <span className="text-[10px] text-gray-400">Auto generate downloadable QR badges</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.qrCodes}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, qrCodes: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Public Portfolios Profiles</span>
                  <span className="text-[10px] text-gray-400">Expose creator public redirect galleries</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.publicProfiles}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, publicProfiles: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Leaderboards Competition</span>
                  <span className="text-[10px] text-gray-400">High earner gamified rank trackers</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.leaderboards}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, leaderboards: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-black/25 p-3.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Maintenance System Mode</span>
                  <span className="text-[10px] text-red-400 font-semibold">Blocks non-admin platform routing</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: { ...settings.featureFlags, maintenanceMode: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Apply Feature Flags
              </button>
            </div>
          </form>
        </div>
      )}

      {/* N. AFFILIATE NETWORKS CONFIGURATION */}
      {activeSubTab === "affiliate_networks" && (
        <div className="glass-panel border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Affiliate Networks Config & Modular Redirects</span>
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubSettings({
                amazonAssociateId: settings.amazonAssociateId,
                amazonEnabled: settings.amazonEnabled,
                walmartEnabled: settings.walmartEnabled,
                ebayEnabled: settings.ebayEnabled,
                targetEnabled: settings.targetEnabled,
                bestbuyEnabled: settings.bestbuyEnabled,
                aliexpressEnabled: settings.aliexpressEnabled,
                defaultAffiliateNetwork: settings.defaultAffiliateNetwork,
                impactSettings: settings.impactSettings
              }, "Affiliate configuration and modular redirects saved successfully!");
            }}
            className="space-y-6"
          >
            {/* Global Settings */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Global Redirect & Engine Behavior
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Choose the default fallback affiliate network and manage global matching. Enabling or disabling these networks dynamically directs clicks to the correct merchant tag.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Default Affiliate Network</label>
                  <select
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none cursor-pointer"
                    value={settings.defaultAffiliateNetwork || "amazon"}
                    onChange={(e) => setSettings({ ...settings, defaultAffiliateNetwork: e.target.value })}
                  >
                    <option value="amazon">Amazon Associates (Primary)</option>
                    <option value="walmart">Walmart Impact Network (Secondary)</option>
                    <option value="ebay">eBay Partner Network</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Networks Status & Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amazon Associates */}
              <div className="bg-black/25 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                    Amazon Associates
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Status</span>
                    <input
                      type="checkbox"
                      checked={settings.amazonEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, amazonEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Automatically replaces product URL tag parameters with the configured primary Associate ID.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Associate ID (Store ID)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.amazonAssociateId || ""}
                    onChange={(e) => setSettings({ ...settings, amazonAssociateId: e.target.value })}
                    placeholder="muhammadis0ff-20"
                  />
                </div>
              </div>

              {/* Walmart Impact */}
              <div className="bg-black/25 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2">
                    Walmart Affiliate
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-yellow-500/80 font-semibold">Disabled (Approval Pending)</span>
                    <input
                      type="checkbox"
                      checked={!!settings.walmartEnabled}
                      onChange={(e) => setSettings({ ...settings, walmartEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Walmart tracking redirects direct requests to original URL until fully approved.
                </p>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/15 rounded-xl">
                  <span className="text-[10px] text-yellow-400 block font-semibold leading-relaxed">
                    ⚠ Setup Status: Inactive (Phase 2). Clicks will bypass affiliate tag generation and perform a direct redirection to prevent broken routes.
                  </span>
                </div>
              </div>

              {/* eBay Partner Network */}
              <div className="bg-black/25 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    eBay Partner Network
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Disabled</span>
                    <input
                      type="checkbox"
                      checked={!!settings.ebayEnabled}
                      onChange={(e) => setSettings({ ...settings, ebayEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Toggle matching on ebay.com listings to leverage EPN tracking parameters.
                </p>
              </div>

              {/* Target & Others */}
              <div className="bg-black/25 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    Target & Others
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Disabled</span>
                    <input
                      type="checkbox"
                      checked={!!settings.targetEnabled}
                      onChange={(e) => setSettings({ ...settings, targetEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.bestbuyEnabled}
                      onChange={(e) => setSettings({ ...settings, bestbuyEnabled: e.target.checked })}
                      className="w-3 h-3 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Best Buy</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.aliexpressEnabled}
                      onChange={(e) => setSettings({ ...settings, aliexpressEnabled: e.target.checked })}
                      className="w-3 h-3 rounded text-blue-600 focus:ring-0"
                    />
                    <span>AliExpress</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Impact Credentials Card */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Future Impact Network Credentials (Walmart / Target)
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Credentials are stored securely in backend configuration database and are never exposed in frontend source bundles. Use this segment to configure API syncing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Publisher Account ID</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.impactSettings?.publisherAccount || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, publisherAccount: e.target.value }
                    })}
                    placeholder="IMPACT_PUBLISHER_ACCOUNT"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Media Property ID</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.impactSettings?.mediaProperty || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, mediaProperty: e.target.value }
                    })}
                    placeholder="IMPACT_MEDIA_PROPERTY"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Tracking Domain</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.impactSettings?.trackingDomain || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, trackingDomain: e.target.value }
                    })}
                    placeholder="click.ipflack.online"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">SubID Format Template</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.impactSettings?.subIdFormat || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, subIdFormat: e.target.value }
                    })}
                    placeholder="{shortCode}-{creatorId}"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs text-gray-300 font-semibold">API Secret Token / Credentials</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
                    value={settings.impactSettings?.apiCredentials || ""}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, apiCredentials: e.target.value }
                    })}
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                </div>

                <div className="flex items-center justify-between bg-black/35 p-3 rounded-xl border border-white/5 md:col-span-2">
                  <div>
                    <span className="text-xs font-bold text-white block">Real-time Webhook Processing</span>
                    <span className="text-[10px] text-gray-400">Process postback events from Impact automatically</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings.impactSettings?.webhookProcessingEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      impactSettings: { ...settings.impactSettings, webhookProcessingEnabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-white/10 bg-black text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Affiliate Configuration
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
