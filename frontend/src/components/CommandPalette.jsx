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

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, 
  LayoutDashboard, 
  FolderTree, 
  Boxes, 
  CalendarRange, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Moon, 
  Sun, 
  LogOut,
  Sparkles,
  Activity
} from "lucide-react";

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleTheme, theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const rawActions = [
    { id: "dashboard", name: "Go to Dashboard", shortcut: "G D", icon: LayoutDashboard, action: () => navigate("/dashboard"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "assets", name: "Go to Asset Directory", shortcut: "G A", icon: Boxes, action: () => navigate("/assets"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "allocations", name: "Go to Allocations", shortcut: "G L", icon: CalendarRange, action: () => navigate("/allocations"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "bookings", name: "Go to Bookings & Scheduling", shortcut: "G B", icon: CalendarRange, action: () => navigate("/bookings"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "maintenance", name: "Go to Maintenance & Repairs", shortcut: "G M", icon: Wrench, action: () => navigate("/maintenance"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "audits", name: "Go to Audits & Compliance", shortcut: "G U", icon: ClipboardCheck, action: () => navigate("/audits"), roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { id: "employees", name: "Go to Employees Directory", shortcut: "G E", icon: Users, action: () => navigate("/employees"), roles: ["ADMIN", "ASSET_MANAGER"] },
    { id: "reports", name: "Go to Reports & Analytics", shortcut: "G R", icon: BarChart3, action: () => navigate("/reports"), roles: ["ADMIN", "ASSET_MANAGER"] },
    { id: "logs", name: "Go to Audit Logs", shortcut: "G G", icon: Activity, action: () => navigate("/logs"), roles: ["ADMIN", "ASSET_MANAGER"] },
    { id: "organization", name: "Go to Organization Setup", shortcut: "G O", icon: FolderTree, action: () => navigate("/organization"), roles: ["ADMIN"] },
    { id: "theme", name: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`, shortcut: "T T", icon: theme === "dark" ? Sun : Moon, action: () => { toggleTheme(); onClose(); } },
    { id: "logout", name: "Sign Out / Exit", shortcut: "⌥ L", icon: LogOut, action: () => dispatch(logoutUser()).then(() => { navigate("/signin"); onClose(); }) }
  ];

  const actions = rawActions.filter(item => !item.roles || item.roles.includes(user?.role));

  const filtered = actions.filter((act) => 
    act.name.toLowerCase().includes(search.toLowerCase()) ||
    (act.shortcut && act.shortcut.toLowerCase().replace(/\s+/g, "").includes(search.toLowerCase().replace(/\s+/g, "")))
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          filtered[activeIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex, onClose]);

  // Adjust scroll position to keep active index visible
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Click-to-Close Overlay */}
          <div 
            onClick={onClose}
            className="fixed inset-0 z-40 pointer-events-auto cursor-default"
          />

          {/* Palette Box Wrapper (pointer-events-none lets clicks pass through to backdrop) */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            {/* Palette Box Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Search input container */}
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5 bg-white dark:bg-zinc-900">
                <Search className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none border-none focus:ring-0 focus:outline-none"
                />
                <span className="rounded bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">ESC</span>
              </div>

              {/* Action list list box */}
              <div className="max-h-[320px] overflow-y-auto p-2 bg-white dark:bg-zinc-900" ref={listRef}>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-zinc-400 dark:text-zinc-500">
                    <Sparkles className="h-5 w-5 text-accent-purple mb-2 opacity-50" />
                    <p className="text-xs font-medium">No results found for "{search}"</p>
                  </div>
                ) : (
                  filtered.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { item.action(); onClose(); }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                          isActive 
                            ? "bg-accent-purple text-white shadow-sm" 
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400 dark:text-zinc-500"}`} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.shortcut && (
                          <span className={`text-[10px] font-mono tracking-wider ${isActive ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"}`}>
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              
              {/* Bottom guide bar */}
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-4 py-2.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium select-none">
                <span className="flex items-center gap-1">
                  Use ↑↓ to navigate, <span className="font-bold">Enter</span> to select
                </span>
                <span>Linear Commands</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
