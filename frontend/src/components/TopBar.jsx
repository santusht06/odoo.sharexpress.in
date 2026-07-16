/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../store/slices/notificationSlice";
import { logoutUser } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import { Bell, Check, Search, Command, CheckSquare, PlusCircle, Wrench, Shield } from "lucide-react";
import CommandPalette from "./CommandPalette";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function TopBar() {
  const { user } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, dispatch]);

  // Handle global hotkeys (Cmd+K, Alt+L, sequences for navigation & theme toggle)
  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleGlobalKey = (e) => {
      const key = e.key.toLowerCase();
      
      // 1. Toggle Command Palette with Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Ignore general shortcuts if any input/textarea is focused or if command palette is open
      const isInputFocused = document.activeElement && (
        document.activeElement.tagName === "INPUT" || 
        document.activeElement.tagName === "TEXTAREA" || 
        document.activeElement.isContentEditable
      );
      if (isInputFocused || isPaletteOpen) return;

      const now = Date.now();

      // 3. Alt+L (⌥ L) Sign Out
      if (e.altKey && key === "l") {
        e.preventDefault();
        dispatch(logoutUser()).then(() => {
          navigate("/signin");
        });
        return;
      }

      // 4. Sequential shortcuts
      if (lastKey === "g" && now - lastKeyTime < 800) {
        if (key === "d") {
          e.preventDefault();
          navigate("/dashboard");
        } else if (key === "a") {
          e.preventDefault();
          navigate("/assets");
        } else if (key === "l") {
          e.preventDefault();
          navigate("/allocations");
        } else if (key === "b") {
          e.preventDefault();
          navigate("/bookings");
        } else if (key === "m") {
          e.preventDefault();
          navigate("/maintenance");
        } else if (key === "u") {
          e.preventDefault();
          navigate("/audits");
        } else if (key === "e" && ["ADMIN", "ASSET_MANAGER"].includes(user?.role)) {
          e.preventDefault();
          navigate("/employees");
        } else if (key === "r" && ["ADMIN", "ASSET_MANAGER"].includes(user?.role)) {
          e.preventDefault();
          navigate("/reports");
        } else if (key === "g" && ["ADMIN", "ASSET_MANAGER"].includes(user?.role)) {
          e.preventDefault();
          navigate("/logs");
        } else if (key === "o" && user?.role === "ADMIN") {
          e.preventDefault();
          navigate("/organization");
        }
        lastKey = "";
      } else if (lastKey === "t" && now - lastKeyTime < 800) {
        if (key === "t") {
          e.preventDefault();
          toggleTheme();
        }
        lastKey = "";
      } else {
        if (key === "g" || key === "t") {
          lastKey = key;
          lastKeyTime = now;
        }
      }
    };
    
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [user, isPaletteOpen, dispatch, navigate, toggleTheme]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  // Convert current pathname to title breadcrumb
  const getBreadcrumbs = () => {
    const path = location.pathname.substring(1);
    if (!path) return ["Home"];
    
    // Capitalize pages
    return path.split("/").map(seg => seg.charAt(0).toUpperCase() + seg.slice(1));
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="h-14 border-b border-border-primary px-6 flex items-center justify-between sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-text-muted font-medium">AssetFlow</span>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-text-muted/60">/</span>
            <span className={idx === crumbs.length - 1 ? "text-text-primary font-medium" : "text-text-muted font-medium"}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4.5">
        {/* Command Search Button Trigger */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center justify-between gap-6 px-3 py-1.5 rounded-lg border border-border-primary bg-bg-secondary hover:bg-bg-card hover:border-text-muted/30 text-text-muted transition-all w-48 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-text-muted/80 group-hover:text-text-primary transition-colors" />
            <span className="text-[11px] font-medium leading-none">Search commands...</span>
          </div>
          <div className="flex items-center gap-0.5 rounded border border-border-primary bg-bg-card px-1 py-0.5 text-[9px] font-mono leading-none">
            <Command className="h-2 w-2" />
            <span>K</span>
          </div>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg border border-border-primary bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors relative cursor-pointer ${
              showNotifications ? "bg-bg-secondary text-text-primary" : ""
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-purple text-[8px] text-white font-semibold rounded-full flex items-center justify-center border border-bg-primary">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay to close */}
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              
              <div className="absolute right-0 mt-2.5 w-80 bg-bg-card border border-border-primary rounded-xl shadow-2xl overflow-hidden z-40 animate-palette-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary bg-bg-secondary/50">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-accent-purple hover:text-[#6e7be2] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border-primary/50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-text-muted font-medium">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        onClick={() => { handleRead(n.notification_id); setShowNotifications(false); }}
                        className={`p-3.5 cursor-pointer hover:bg-bg-secondary/40 transition-colors text-left ${
                          !n.is_read ? "bg-accent-purple/5" : ""
                        }`}
                      >
                        <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                        <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info Badge */}
        {user?.department_name && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-secondary px-2.5 py-1 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            <Shield className="h-3 w-3 text-accent-purple" />
            <span>{user.department_name}</span>
          </div>
        )}
      </div>

      {/* Floating Command Palette Modal */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
      />
    </header>
  );
}
