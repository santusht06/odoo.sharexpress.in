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
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-2">
        <span className="h-6 w-6 rounded-full border-2 border-border-primary border-t-accent-purple animate-spin" />
        <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Loading...</span>
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
