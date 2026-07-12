import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../store/slices/notificationSlice";
import { Bell, Check } from "lucide-react";

export default function TopBar() {
  const { user } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      // Poll every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, dispatch]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <header className="h-14 jira-header flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {user?.department_name && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">
            {user.department_name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-gray-100 rounded-full relative text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-bold text-gray-700">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      onClick={() => handleRead(n.notification_id)}
                      className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.is_read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
            {user?.user_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-xs font-semibold text-gray-700">{user?.user_name}</span>
        </div>
      </div>
    </header>
  );
}
