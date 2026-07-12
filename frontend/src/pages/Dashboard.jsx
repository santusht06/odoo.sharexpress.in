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
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  Boxes
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";

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
      color: "border-status-success/20 text-status-success",
      link: "/assets?status=Available"
    },
    {
      label: "Assets Allocated",
      value: kpis.assets_allocated,
      icon: Layers,
      color: "border-status-info/20 text-status-info",
      link: "/assets?status=Allocated"
    },
    {
      label: "Maintenance Today",
      value: kpis.maintenance_today,
      icon: Wrench,
      color: "border-status-warning/20 text-status-warning",
      link: "/maintenance"
    },
    {
      label: "Active Bookings",
      value: kpis.active_bookings,
      icon: CalendarCheck,
      color: "border-accent-purple/20 text-accent-purple",
      link: "/bookings"
    },
    {
      label: "Pending Transfers",
      value: kpis.pending_transfers,
      icon: RefreshCw,
      color: "border-accent-purple/10 text-accent-purple/80",
      link: "/allocations"
    },
    {
      label: "Upcoming Returns",
      value: kpis.upcoming_returns,
      icon: CalendarCheck,
      color: "border-border-primary text-text-secondary",
      link: "/allocations?status=Active"
    },
    {
      label: "Overdue Returns",
      value: kpis.overdue_returns,
      icon: AlertTriangle,
      color: kpis.overdue_returns > 0 
        ? "border-status-danger/25 text-status-danger animate-pulse" 
        : "border-border-primary text-text-secondary",
      link: "/allocations?status=Overdue"
    }
  ];

  return (
    <div className="space-y-8 text-text-primary">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">System Overview</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Real-time status overview of workspace and enterprise physical resources</p>
        </div>
        <div className="text-[10px] text-text-muted font-semibold bg-bg-secondary px-3 py-1.5 border border-border-primary rounded-lg self-start">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link 
              to={card.link} 
              key={idx} 
              className="block hover:no-underline select-none"
            >
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className={`bg-bg-card p-5 rounded-xl border border-border-primary relative overflow-hidden group shadow-sm flex flex-col justify-between h-full glimmer-card`}
              >
                <div className="flex justify-between items-start z-10">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{card.label}</p>
                  <div className={`p-1.5 rounded-lg border bg-bg-secondary ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 z-10 flex justify-between items-end">
                  <h3 className="text-2xl font-light tracking-tight text-text-primary">
                    {loading ? (
                      <span className="block h-6 w-8 bg-border-primary/45 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </h3>
                  <span className="text-[9px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
                    View Details &rarr;
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border-primary rounded-xl p-6 lg:col-span-2 space-y-4 shadow-sm glimmer-card">
          <div className="border-b border-border-primary/80 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <span className="text-[10px] text-text-muted font-medium">Quick create tools</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["ADMIN", "ASSET_MANAGER"].includes(user?.role) && (
              <Link
                to="/assets"
                className="flex flex-col items-center justify-center p-5 border border-border-primary rounded-xl bg-bg-secondary/40 hover:bg-bg-secondary hover:border-accent-purple/20 transition-all text-center group shadow-sm"
              >
                <div className="p-2.5 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 group-hover:scale-105 transition-transform">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-text-primary mt-3">Register Asset</span>
                <span className="text-[10px] text-text-muted mt-1 leading-snug">Add a new physical asset</span>
              </Link>
            )}

            <Link
              to="/bookings"
              className="flex flex-col items-center justify-center p-5 border border-border-primary rounded-xl bg-bg-secondary/40 hover:bg-bg-secondary hover:border-status-info/20 transition-all text-center group shadow-sm"
            >
              <div className="p-2.5 rounded-lg bg-status-info/10 text-status-info border border-status-info/20 group-hover:scale-105 transition-transform">
                <BookMarked className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-text-primary mt-3">Book Resource</span>
              <span className="text-[10px] text-text-muted mt-1 leading-snug">Reserve meeting rooms or labs</span>
            </Link>

            <Link
              to="/maintenance"
              className="flex flex-col items-center justify-center p-5 border border-border-primary rounded-xl bg-bg-secondary/40 hover:bg-bg-secondary hover:border-status-warning/20 transition-all text-center group shadow-sm"
            >
              <div className="p-2.5 rounded-lg bg-status-warning/10 text-status-warning border border-status-warning/20 group-hover:scale-105 transition-transform">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-text-primary mt-3">Request Maintenance</span>
              <span className="text-[10px] text-text-muted mt-1 leading-snug">Report system hardware issues</span>
            </Link>
          </div>
        </div>

        {/* User Card info */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-6 flex flex-col justify-between shadow-sm glimmer-card">
          <div>
            <div className="border-b border-border-primary/80 pb-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                My Workspace Profiler
              </h3>
            </div>
            
            <div className="mt-5 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-medium">Access Privileges:</span>
                <span className="font-semibold text-text-primary uppercase tracking-wider text-[10px] bg-bg-secondary border border-border-primary px-2 py-0.5 rounded-md">
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-medium">Department Unit:</span>
                <span className="font-semibold text-text-secondary">{user?.department_name || "Central Unit"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-medium">Verified Email:</span>
                <span className="font-semibold text-text-secondary truncate max-w-[160px]" title={user?.email}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-secondary p-3 border border-border-primary rounded-lg text-[10px] text-text-muted font-medium text-center mt-6">
            Press <span className="font-bold text-text-primary border border-border-primary bg-bg-card px-1 py-0.5 rounded text-[9px] font-mono mx-0.5">⌘ K</span> to show floating command bar operations.
          </div>
        </div>
      </div>
    </div>
  );
}
