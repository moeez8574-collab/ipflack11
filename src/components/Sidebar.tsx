import React, { useState } from "react";
import { 
  BarChart3, Link as LinkIcon, DollarSign, Wallet, Shield, 
  PlayCircle, Bell, LogOut, Menu, X, ArrowLeftRight, UserCheck 
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  unreadNotifications: number;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, user, unreadNotifications, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Creator Dashboard", icon: BarChart3 },
    { id: "shortener", label: "Link Shortener", icon: LinkIcon },
    { id: "links", label: "My Short Links", icon: ArrowLeftRight },
    { id: "wallet", label: "Wallet & Payouts", icon: Wallet },
    { id: "simulator", label: "Traffic Simulator", icon: PlayCircle },
  ];

  const adminItem = { id: "admin", label: "Admin Control", icon: Shield };

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Header Bar */}
      <div className="md:hidden w-full bg-[#08090b]/80 backdrop-blur-md border-b border-white/10 h-16 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-white">
            IP<span className="text-blue-500">FLACK</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick("notifications")}
            className="p-2 text-gray-400 hover:text-white relative bg-white/5 rounded-lg border border-white/5 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-6 transform transition-transform duration-300 md:translate-x-0 md:static ${
          isOpen ? "translate-x-0 h-full pt-20 md:pt-6" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo Brand Title (Desktop-only) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 italic">
              IP
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              IP<span className="text-blue-500 text-glow">FLACK</span>
            </span>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
              Creator Marketplace
            </div>
            
            {navigationItems.map((item) => {
               const Icon = item.icon;
               const isActive = currentTab === item.id;
               return (
                 <button
                   key={item.id}
                   onClick={() => handleNavClick(item.id)}
                   className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer border ${
                     isActive
                       ? "bg-white/10 text-blue-400 border-white/10 shadow-lg shadow-blue-500/5"
                       : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                   }`}
                 >
                   <Icon className="w-4.5 h-4.5 shrink-0" />
                   <span>{item.label}</span>
                 </button>
               );
            })}

            {/* Notification Tab link */}
            <button
              onClick={() => handleNavClick("notifications")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer border ${
                currentTab === "notifications"
                  ? "bg-white/10 text-blue-400 border-white/10 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4.5 h-4.5 shrink-0" />
                <span>Notifications</span>
              </div>
              {unreadNotifications > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  currentTab === "notifications" ? "bg-blue-600 text-white" : "bg-blue-500/15 text-blue-400 border border-blue-500/10"
                }`}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Admin Management Section */}
            {user?.role === "admin" && (
              <>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mt-6 mb-2">
                  Administration
                </div>
                <button
                  onClick={() => handleNavClick(adminItem.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    currentTab === adminItem.id
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <adminItem.icon className="w-4.5 h-4.5 shrink-0 text-blue-400" />
                  <span className="font-semibold">{adminItem.label}</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Info footer and logout */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4 mt-8">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
              {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "CR"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                {user?.role === "admin" ? (
                  <>
                    <UserCheck className="w-3 h-3 text-blue-400" /> Platform Admin
                  </>
                ) : (
                  "Verified Creator"
                )}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay backdrop for mobile menu */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        ></div>
      )}
    </>
  );
}
