import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import AIAssistant from "../components/AIAssistant";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-grow p-6 overflow-y-auto bg-bg-primary">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
