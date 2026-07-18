import React from "react";
import { 
  Bell, CheckCircle2, Eye, Award, Smartphone, 
  HelpCircle, Sparkles, ShoppingBag, XCircle, Trash2 
} from "lucide-react";

interface NotificationsFeedProps {
  token: string;
  notifications: any[];
  onNotificationsUpdated: () => void;
}

export default function NotificationsFeed({ token, notifications, onNotificationsUpdated }: NotificationsFeedProps) {

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to mark read");
      onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Failed to mark read");
      onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifStyles = (type: string) => {
    switch (type) {
      case "click":
        return {
          icon: <Eye className="w-5 h-5 text-blue-400" />,
          color: "border-blue-500/10 bg-blue-500/5",
          accent: "text-blue-400"
        };
      case "order":
        return {
          icon: <ShoppingBag className="w-5 h-5 text-yellow-500" />,
          color: "border-yellow-500/10 bg-yellow-500/5",
          accent: "text-yellow-400"
        };
      case "commission_confirmed":
        return {
          icon: <Award className="w-5 h-5 text-emerald-400" />,
          color: "border-emerald-500/15 bg-emerald-500/5 glow-green",
          accent: "text-emerald-400"
        };
      case "commission_paid":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
          color: "border-purple-500/10 bg-purple-500/5",
          accent: "text-purple-400"
        };
      case "payout_approved":
        return {
          icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
          color: "border-emerald-500/15 bg-emerald-500/5",
          accent: "text-emerald-400"
        };
      case "payout_rejected":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          color: "border-red-500/15 bg-red-500/5",
          accent: "text-red-400"
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-gray-400" />,
          color: "border-white/5 bg-white/[0.01]",
          accent: "text-white"
        };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header controls banner */}
      <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Alerts Feed</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            You have <span className="text-white font-bold">{unreadCount}</span> unread activity notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-200 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark All As Read
          </button>
        )}
      </div>

      {/* Notifications list stack */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-panel border-white/5 rounded-2xl p-16 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">All Settle Clear</h4>
            <p className="text-xs text-gray-500 mt-1">No notification events logged in this account.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const styles = getNotifStyles(n.type);
            return (
              <div 
                key={n.id} 
                className={`glass-panel border rounded-2xl p-4.5 flex gap-4 items-start transition relative overflow-hidden ${styles.color} ${
                  !n.isRead ? "border-l-2 border-l-blue-500" : ""
                }`}
              >
                {/* Visual marker icon */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 shrink-0">
                  {styles.icon}
                </div>

                {/* Text details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-sm font-bold truncate ${styles.accent}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                </div>

                {/* Mark as read tick button */}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkSingleRead(n.id)}
                    className="p-1.5 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition cursor-pointer self-center"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
