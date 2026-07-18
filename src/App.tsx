import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Auth from "./components/Auth";
import CreatorDashboard from "./components/CreatorDashboard";
import LinkShortener from "./components/LinkShortener";
import LinksManagement from "./components/LinksManagement";
import WalletModal from "./components/WalletModal";
import MockSimulator from "./components/MockSimulator";
import AdminPanel from "./components/AdminPanel";
import NotificationsFeed from "./components/NotificationsFeed";
import LinkGate from "./components/LinkGate";
import LegalModal from "./components/LegalModal";
import { Bell, Sparkles, X, CheckCircle2, ShoppingBag, Eye } from "lucide-react";

// Initial fallback analytics state matching specific user guidelines
const initialAnalytics = {
  summary: {
    sales: { total: 12450, change: "+18.2% today" },
    orders: { total: 328, change: "+24 new" },
    clicks: { total: 18400, change: "+7.1%" },
    conversion: { rate: 6.9, change: "+0.8%" },
    commissions: { total: 1867, change: "Active Split" },
    wallet: { availableBalance: 1342.50, pendingBalance: 525.00, withdrawableBalance: 1342.50, lifetimeEarnings: 3210.00 }
  },
  mainChart: [
    { date: "Jul 7", clicks: 1200, sales: 850, earnings: 127.5, orders: 15 },
    { date: "Jul 8", clicks: 1450, sales: 900, earnings: 135.0, orders: 18 },
    { date: "Jul 9", clicks: 1680, sales: 1100, earnings: 165.0, orders: 22 },
    { date: "Jul 10", clicks: 1540, sales: 1250, earnings: 187.5, orders: 25 },
    { date: "Jul 11", clicks: 1950, sales: 1400, earnings: 210.0, orders: 28 },
    { date: "Jul 12", clicks: 2100, sales: 1350, earnings: 202.5, orders: 26 },
    { date: "Jul 13", clicks: 1850, sales: 1500, earnings: 225.0, orders: 30 },
    { date: "Jul 14", clicks: 2300, sales: 1650, earnings: 247.5, orders: 35 },
    { date: "Jul 15", clicks: 2150, sales: 1200, earnings: 180.0, orders: 24 },
    { date: "Jul 16", clicks: 2180, sales: 1250, earnings: 187.5, orders: 25 }
  ],
  countries: [
    { name: "United States", value: 120 },
    { name: "Pakistan", value: 85 },
    { name: "United Kingdom", value: 45 },
    { name: "Canada", value: 30 },
    { name: "Germany", value: 20 }
  ],
  devices: [
    { name: "desktop", value: 65 },
    { name: "mobile", value: 140 },
    { name: "tablet", value: 20 }
  ],
  referrers: [
    { name: "Instagram", value: 75 },
    { name: "TikTok", value: 95 },
    { name: "Direct", value: 30 },
    { name: "YouTube", value: 25 }
  ]
};

export default function App() {
  // Session states
  const [token, setToken] = useState<string | null>(localStorage.getItem("ipflack_token"));
  const [user, setUser] = useState<any | null>(null);

  // Layout navigation
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Platform records states
  const [links, setLinks] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({ availableBalance: 0, pendingBalance: 0, withdrawableBalance: 0, lifetimeEarnings: 0 });
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(initialAnalytics);

  // Interactive Live Toasts for simulation events
  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  // Active Legal Page Overlay ID
  const [activeLegalPageId, setActiveLegalPageId] = useState<string | null>(null);
  
  // Track notifications to prevent duplicate toasts
  const knownNotificationIds = useRef<Set<string>>(new Set());

  // Direct Browser routing for password-guarded Link Gates
  const pathname = window.location.pathname;
  if (pathname.startsWith("/link-gate/")) {
    const shortCode = pathname.substring("/link-gate/".length);
    return <LinkGate shortCode={shortCode} />;
  }

  // Handle Token Authenticated
  const handleLoginSuccess = (userData: any, sessionToken: string) => {
    localStorage.setItem("ipflack_token", sessionToken);
    localStorage.setItem("ipflack_user", JSON.stringify(userData));
    setToken(sessionToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("ipflack_token");
    localStorage.removeItem("ipflack_user");
    setToken(null);
    setUser(null);
  };

  // Fetch all core platform datasets
  const fetchAllData = async () => {
    if (!token) return;
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      // 1. Fetch User links
      const linksRes = await fetch("/api/links", { headers });
      if (linksRes.ok) setLinks(await linksRes.json());

      // 2. Fetch Wallet status
      const walletRes = await fetch("/api/wallet", { headers });
      if (walletRes.ok) setWallet(await walletRes.json());

      // 3. Fetch Payout histories
      const payoutRes = await fetch("/api/payouts", { headers });
      if (payoutRes.ok) setPayoutHistory(await payoutRes.json());

      // 3.5. Fetch transparent earnings ledger
      const ledgerRes = await fetch("/api/ledger", { headers });
      if (ledgerRes.ok) setLedger(await ledgerRes.json());

      // 4. Fetch Analytics dashboards
      const analyticsRes = await fetch("/api/analytics", { headers });
      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalyticsData(aData);
      }

      // 5. Fetch Notification logs
      fetchNotifications();

    } catch (err) {
      console.error("Data sync error:", err);
    }
  };

  // Fetch notifications independently for polling cycle
  const fetchNotifications = async () => {
    if (!token) return;
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      const notifRes = await fetch("/api/notifications", { headers });
      if (notifRes.ok) {
        const notifs: any[] = await notifRes.json();
        
        // Check for NEW unread notifications to push sliding screen toasts!
        const unreadNew = notifs.filter(n => !n.isRead && !knownNotificationIds.current.has(n.id));
        if (unreadNew.length > 0) {
          const newest = unreadNew[0];
          setToast({
            id: newest.id,
            title: newest.title,
            message: newest.message,
            type: newest.type
          });
          
          // Clear toast after 5s
          setTimeout(() => setToast(null), 5000);
        }

        // Register all current notifications in known ids
        notifs.forEach(n => knownNotificationIds.current.add(n.id));
        setNotifications(notifs);
      }
    } catch (err) {
      console.error("Notifications poll error:", err);
    }
  };

  // Run on initial load & whenever token changes
  useEffect(() => {
    const savedUser = localStorage.getItem("ipflack_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (token) {
      fetchAllData();
    }
  }, [token]);

  // Notifications live polling (every 4 seconds) to support real-time simulator reaction!
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  // Event handlers for incremental updates
  const handleLinkCreated = () => {
    fetchAllData();
  };

  const handleLinksRefresh = () => {
    fetchAllData();
  };

  const handlePayoutRefresh = () => {
    fetchAllData();
  };

  const handleSimulationComplete = () => {
    // Instantly refresh analytics & wallet balances so they jump on the screen!
    fetchAllData();
  };

  const handleAdminAction = () => {
    fetchAllData();
  };

  // Unread notification counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render main viewport based on tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <CreatorDashboard 
            analyticsData={analyticsData} 
            links={links} 
            user={user} 
            token={token!}
            onUserUpdated={(u) => {
              setUser(u);
              localStorage.setItem("ipflack_user", JSON.stringify(u));
            }}
          />
        );
      case "shortener":
        return <LinkShortener token={token!} onLinkCreated={handleLinkCreated} />;
      case "links":
        return <LinksManagement token={token!} links={links} onLinkDeleted={handleLinksRefresh} />;
      case "wallet":
        return <WalletModal token={token!} wallet={wallet} payoutHistory={payoutHistory} ledger={ledger} onPayoutRequested={handlePayoutRefresh} />;
      case "simulator":
        return <MockSimulator links={links} onSimulationComplete={handleSimulationComplete} />;
      case "admin":
        return <AdminPanel token={token!} onAdminAction={handleAdminAction} />;
      case "notifications":
        return <NotificationsFeed token={token!} notifications={notifications} onNotificationsUpdated={fetchNotifications} />;
      default:
        return (
          <CreatorDashboard 
            analyticsData={analyticsData} 
            links={links} 
            user={user} 
            token={token!}
            onUserUpdated={(u) => {
              setUser(u);
              localStorage.setItem("ipflack_user", JSON.stringify(u));
            }}
          />
        );
    }
  };

  // Authenticate guard
  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Get active tab label for header breadcrumbs
  const getTabLabel = () => {
    switch (currentTab) {
      case "dashboard": return "Live Creator Dashboard";
      case "shortener": return "Affiliate Link Shortener";
      case "links": return "My Saved Short Links";
      case "wallet": return "Fintech Withdrawal Wallet";
      case "simulator": return "Live Traffic Simulator Sandbox";
      case "admin": return "Secure Platform Administration";
      case "notifications": return "Activity Notification Logs";
      default: return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      {/* Mesh Gradient Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Responsive Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        user={user} 
        unreadNotifications={unreadCount}
        onLogout={handleLogout} 
      />

      {/* Main content body viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-6 pb-20 md:pb-8">
        
        {/* Desktop-only viewport header */}
        <div className="hidden md:flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{getTabLabel()}</h1>
            <p className="text-xs text-gray-400 mt-1">IPFLACK creator marketplace • <span className="font-mono text-[10px]">ipflack.online</span></p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick simulator shortcut alert */}
            <button
              onClick={() => setCurrentTab("simulator")}
              className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-400" /> Open Sandbox Simulator
            </button>

            {/* Notification bell */}
            <button
              onClick={() => setCurrentTab("notifications")}
              className="p-2.5 text-gray-400 hover:text-white bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition relative cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Viewport page content rendering */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>

        {/* COMPREHENSIVE PLATFORM FOOTER */}
        <footer className="mt-16 pt-8 border-t border-white/5 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white tracking-tight">IPFLACK Creator Revenue Platform</p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">
                © 2026 IPFLACK Inc. All rights reserved. Registered trademark.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-[11px] text-gray-400 font-medium">
              <button onClick={() => setActiveLegalPageId("about")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">About IPFLACK</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("contact")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Contact Us</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("privacy")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Privacy Policy</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("terms")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Terms of Service</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("disclosure")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Affiliate Disclosure</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("cookies")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Cookie Policy</button>
              <span className="text-gray-700 hidden md:inline">•</span>
              <button onClick={() => setActiveLegalPageId("disclaimer")} className="hover:text-white transition cursor-pointer bg-transparent border-none p-0">Disclaimer</button>
            </div>
          </div>
          <p className="text-[9px] text-gray-600 max-w-4xl leading-normal">
            Affiliate Disclosure: IPFLACK participate in various affiliate marketing programs. When creators generate links matching marketplace partners like Amazon Associates (muhammadis0ff-20) or Walmart, we generate tracked redirects. Clicking these links splits earned commissions automatically to verified creator accounts. Product prices remain identical.
          </p>
        </footer>

      </main>

      {/* DYNAMIC TOAST NOTIFICATION POP OVER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm glass-panel border border-blue-500/20 bg-gray-950/90 rounded-2xl p-4 shadow-2xl flex gap-3.5 items-start animate-slideUp">
          <div className="p-2 bg-blue-500/10 border border-blue-500/15 rounded-xl shrink-0">
            {toast.type === "click" && <Eye className="w-5 h-5 text-blue-400" />}
            {(toast.type === "order" || toast.type === "commission_confirmed") && <ShoppingBag className="w-5 h-5 text-emerald-400" />}
            {toast.type !== "click" && toast.type !== "order" && toast.type !== "commission_confirmed" && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-0.5">NEW ACTIVITY LOG</h4>
            <h5 className="text-sm font-bold text-white">{toast.title}</h5>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subtle Bottom Bar Decor */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent pointer-events-none"></div>

      {/* DYNAMIC LEGAL OVERLAYS */}
      {activeLegalPageId && (
        <LegalModal pageId={activeLegalPageId} onClose={() => setActiveLegalPageId(null)} />
      )}
    </div>
  );
}
