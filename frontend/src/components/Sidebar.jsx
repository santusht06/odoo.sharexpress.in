import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { 
  LayoutDashboard, 
  FolderTree, 
  Boxes, 
  CalendarRange, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  LogOut,
  Users
} from "lucide-react";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 jira-sidebar flex flex-col min-h-screen text-slate-700">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
          <Boxes className="h-6 w-6" /> AssetFlow
        </h1>
        <span className="text-xs text-gray-500 font-medium">Enterprise ERP</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
            {user?.user_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-700 truncate">{user?.user_name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
