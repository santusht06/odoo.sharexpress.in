import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../helpers/DashboardLayout";

// Lazy loaded page components for optimized bundle code splitting
const Home = lazy(() => import("../pages/Home"));
const Signin = lazy(() => import("../pages/Signin"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AssetDirectory = lazy(() => import("../pages/AssetDirectory"));
const Allocations = lazy(() => import("../pages/Allocations"));
const Bookings = lazy(() => import("../pages/Bookings"));
const Maintenance = lazy(() => import("../pages/Maintenance"));
const Audits = lazy(() => import("../pages/Audits"));
const OrganizationSetup = lazy(() => import("../pages/OrganizationSetup"));
const Employees = lazy(() => import("../pages/Employees"));
const Reports = lazy(() => import("../pages/Reports"));
const Logs = lazy(() => import("../pages/Logs"));
const Profile = lazy(() => import("../pages/Profile"));

// Premium fallback screen during chunk download
function PageLoadingFallback() {
  return (
    <div className="flex h-screen w-full bg-bg-primary overflow-hidden select-none">
      {/* Sidebar Skeleton */}
      <div className="w-[240px] border-r border-border-primary bg-bg-secondary p-4.5 space-y-6 hidden md:block shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-border-primary/50 animate-pulse" />
          <div className="h-4 w-24 bg-border-primary/45 rounded animate-pulse" />
        </div>
        <div className="space-y-4 pt-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-border-primary/45 animate-pulse" />
              <div className="h-3 w-28 bg-border-primary/45 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Skeleton */}
        <div className="h-14 border-b border-border-primary px-6 flex items-center justify-between shrink-0 bg-bg-secondary/20">
          <div className="h-4 w-32 bg-border-primary/45 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-border-primary/45 animate-pulse" />
          </div>
        </div>
        
        {/* Page Content Skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Titles */}
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-border-primary/50 rounded animate-pulse" />
            <div className="h-3 w-80 bg-border-primary/40 rounded animate-pulse" />
          </div>
          
          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border border-border-primary bg-bg-card rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-1/3 bg-border-primary/45 rounded animate-pulse" />
                  <div className="h-6 w-6 rounded-full bg-border-primary/45 animate-pulse" />
                </div>
                <div className="h-6 w-1/2 bg-border-primary/50 rounded animate-pulse" />
                <div className="h-2.5 w-2/3 bg-border-primary/40 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Table Container Skeleton */}
          <div className="border border-border-primary bg-bg-card rounded-2xl p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="flex items-center justify-between gap-4 py-3 border-b border-border-primary/30 last:border-0 last:pb-0">
                <div className="h-4 bg-border-primary/45 rounded animate-pulse w-24" />
                <div className="h-4 bg-border-primary/45 rounded animate-pulse w-48" />
                <div className="h-4 bg-border-primary/45 rounded animate-pulse w-16" />
                <div className="h-4 bg-border-primary/45 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public landing and auth screens */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />

        {/* Main app paths wrapped in a shared layout with role-based routing */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/allocations" element={<Allocations />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin only views */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/organization" element={<OrganizationSetup />} />
            </Route>

            {/* Admin & Asset Manager only views */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ASSET_MANAGER"]} />}>
              <Route path="/employees" element={<Employees />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/logs" element={<Logs />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback redirects */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
