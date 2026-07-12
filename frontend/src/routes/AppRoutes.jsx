import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../helpers/DashboardLayout";
import Signin from "../pages/Signin";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import OrganizationSetup from "../pages/OrganizationSetup";
import Employees from "../pages/Employees";
import AssetDirectory from "../pages/AssetDirectory";
import Allocations from "../pages/Allocations";
import Bookings from "../pages/Bookings";
import Maintenance from "../pages/Maintenance";
import Audits from "../pages/Audits";
import Reports from "../pages/Reports";
import Logs from "../pages/Logs";


export default function AppRoutes() {
  return (
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
  );
}
