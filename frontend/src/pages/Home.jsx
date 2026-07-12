import React from "react";
import { Link } from "react-router-dom";
import { 
  Boxes, 
  CalendarRange, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
            <Boxes className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">AssetFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="btn-secondary py-1.5 px-4 text-xs font-bold cursor-pointer">
            Sign In
          </Link>
          <Link to="/signin" className="btn-primary py-1.5 px-4 text-xs font-bold cursor-pointer">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20 px-6 sm:px-12 border-b border-slate-200 flex flex-col items-center text-center">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <ShieldCheck className="h-3.5 w-3.5" /> Built for Modern Enterprises
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Simplify how your organization tracks physical assets & shared resources
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Eliminate double allocations, resolve resource scheduling conflicts, route maintenance requests, and audit inventory in one centralized platform.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link to="/signin" className="btn-primary py-2.5 px-6 text-sm font-bold flex items-center gap-2 cursor-pointer">
              Launch AssetFlow <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">One central system. Five core modules.</h2>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            Everything your asset managers and employees need to align hardware resource workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="jira-card p-6 bg-white space-y-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit">
              <Boxes className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Complete Lifecycle Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track assets through various transitions: Available, Allocated, Under Maintenance, Lost, and Retired. Automatically generated asset tags and QR codes make identification simple.
            </p>
          </div>

          {/* Card 2 */}
          <div className="jira-card p-6 bg-white space-y-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
              <CalendarRange className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Resource Booking Calendar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Book shared conference rooms, vehicles, or team testing labs via calendar view with built-in time-slot overlap prevention. No more booking conflicts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="jira-card p-6 bg-white space-y-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg w-fit">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Maintenance & Repair Workflows</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Raise hardware fault requests that transition from pending to resolution. Automatically changes asset status to "Under Maintenance" upon manager approval.
            </p>
          </div>

          {/* Card 4 */}
          <div className="jira-card p-6 bg-white space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Scheduled Audit Cycles</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assign verification duties to auditors, record live check results (Verified, Missing, Damaged), and automatically update matching inventories when closed.
            </p>
          </div>

          {/* Card 5 */}
          <div className="jira-card p-6 bg-white space-y-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-fit">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Reports & Distribution Heatmaps</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyze asset utilization, distribution counts by departments, booking heatmaps, and older inventories nearing retirement dates.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 px-6 sm:px-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-600 text-white rounded">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">AssetFlow</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 AssetFlow, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
