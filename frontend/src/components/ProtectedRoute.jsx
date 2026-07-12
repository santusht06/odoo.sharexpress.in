import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0a15]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5e6ad2]"></div>
          <span className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Loading AssetFlow...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
