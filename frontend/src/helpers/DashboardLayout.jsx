import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import AIAssistant from "../components/AIAssistant";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-grow p-6 overflow-y-auto bg-bg-primary">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
