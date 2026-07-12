import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderTree, 
  Boxes, 
  CalendarRange, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  LogOut,
  Users,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/signin");
    });
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/organization", label: "Organization", icon: FolderTree, roles: ["ADMIN"] },
    { to: "/employees", label: "Employees", icon: Users, roles: ["ADMIN", "ASSET_MANAGER"] },
    { to: "/assets", label: "Assets", icon: Boxes, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/allocations", label: "Allocations", icon: CalendarRange, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/bookings", label: "Bookings", icon: CalendarRange, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/audits", label: "Audits", icon: ClipboardCheck, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { to: "/reports", label: "Reports & Analytics", icon: BarChart3, roles: ["ADMIN", "ASSET_MANAGER"] },
    { to: "/logs", label: "Audit Logs", icon: Activity, roles: ["ADMIN", "ASSET_MANAGER"] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      className="flex h-screen flex-col border-r border-border-primary bg-bg-secondary text-text-secondary select-none relative z-20 shrink-0"
    >
      {/* Workspace / Header */}
      <div className="flex h-14 items-center justify-between border-b border-border-primary px-4.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src="/logo.png"
            alt="AssetFlow Logo"
            className="h-7 w-7 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-xs font-semibold text-text-primary tracking-tight leading-none">AssetFlow</h1>
              <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Enterprise ERP</span>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="rounded-md p-1 hover:bg-bg-card hover:text-text-primary transition-colors text-text-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2.5">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="rounded-md p-1 hover:bg-bg-card hover:text-text-primary transition-colors text-text-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Link List */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-bg-card text-text-primary border border-border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    : "hover:bg-bg-card/40 hover:text-text-primary border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-accent-purple" : "text-text-muted"}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area with Theme toggle / Profile / Logout */}
      <div className="border-t border-border-primary p-3 space-y-2.5 bg-bg-secondary/40 shrink-0">
        
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-muted hover:bg-bg-card hover:text-text-primary border border-transparent transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </div>
          {!isCollapsed && (
            <span className="rounded bg-bg-secondary px-1 text-[9px] font-mono border border-border-primary">T T</span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple font-semibold text-xs border border-accent-purple/20 shrink-0 select-none">
              {user?.user_name?.charAt(0).toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-[11px] font-semibold text-text-primary leading-tight truncate">{user?.user_name}</p>
                <p className="text-[9px] text-text-muted leading-tight truncate uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-text-muted hover:bg-bg-card hover:text-status-danger transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
