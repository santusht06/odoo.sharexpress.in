import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardKpis } from "../store/slices/dashboardSlice";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  BookMarked, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  CalendarCheck, 
  RefreshCw 
} from "lucide-react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { kpis, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardKpis());
  }, [dispatch]);

  const cards = [
    {
      label: "Assets Available",
      value: kpis.assets_available,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Assets Allocated",
      value: kpis.assets_allocated,
      icon: Layers,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Maintenance Today",
      value: kpis.maintenance_today,
      icon: Wrench,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Active Bookings",
      value: kpis.active_bookings,
      icon: CalendarCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Pending Transfers",
      value: kpis.pending_transfers,
      icon: RefreshCw,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      label: "Upcoming Returns",
      value: kpis.upcoming_returns,
      icon: CalendarCheck,
      color: "text-slate-600 bg-slate-50 border-slate-200",
    },
    {
      label: "Overdue Returns",
      value: kpis.overdue_returns,
      icon: AlertTriangle,
      color: kpis.overdue_returns > 0 
        ? "text-rose-600 bg-rose-50 border-rose-200 animate-pulse" 
        : "text-slate-600 bg-slate-50 border-slate-200",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Dashboard</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Real-time enterprise resource status overview</p>
        </div>
        <div className="text-xs text-slate-500 font-bold bg-white px-3 py-1 border border-slate-200 rounded">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`jira-card p-5 flex items-center justify-between border ${card.color}`}>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{loading ? "..." : card.value}</h3>
              </div>
              <div className="p-3 rounded-full bg-white/60">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Shortcut panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="jira-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
            Quick System Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
              <Link
                to="/assets"
                className="flex flex-col items-center justify-center p-4 border border-blue-200 rounded bg-blue-50/30 hover:bg-blue-50 transition text-center group"
              >
                <PlusCircle className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-blue-800 mt-2">Register Asset</span>
                <span className="text-[10px] text-slate-500 mt-1">Add new physical asset</span>
              </Link>
            )}

            <Link
              to="/bookings"
              className="flex flex-col items-center justify-center p-4 border border-indigo-200 rounded bg-indigo-50/30 hover:bg-indigo-50 transition text-center group"
            >
              <BookMarked className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-indigo-800 mt-2">Book Resource</span>
              <span className="text-[10px] text-slate-500 mt-1">Reserve shared facility</span>
            </Link>

            <Link
              to="/maintenance"
              className="flex flex-col items-center justify-center p-4 border border-amber-200 rounded bg-amber-50/30 hover:bg-amber-50 transition text-center group"
            >
              <Wrench className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-amber-800 mt-2">Request Maintenance</span>
              <span className="text-[10px] text-slate-500 mt-1">Report asset hardware issue</span>
            </Link>
          </div>
        </div>

        <div className="jira-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Profile Summary
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">User Role:</span>
                <span className="font-bold text-slate-700">{user?.role}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Department:</span>
                <span className="font-bold text-slate-700">{user?.department_name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Email:</span>
                <span className="font-bold text-slate-700 truncate max-w-[150px]">{user?.email}</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 border border-slate-100 rounded text-[11px] text-slate-500 font-medium text-center mt-4">
            Use the sidebar navigation to manage specific features.
          </div>
        </div>
      </div>
    </div>
  );
}
