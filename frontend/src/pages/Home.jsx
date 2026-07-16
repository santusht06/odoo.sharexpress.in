/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  CalendarRange,
  Wrench,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Cpu,
  TrendingUp,
  Users,
  CheckCircle2,
  Zap,
  Bot,
  FileSearch,
  Bell,
  Lock,
  ChevronRight,
  Activity,
  Package,
  AlertCircle,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import Button from "../components/ui/Button";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Pulse Dot ───────────────────────────────────────────────────────────────
function PulseDot({ color = "bg-status-success" }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}
      />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

// ─── Floating Activity Card ───────────────────────────────────────────────────
function ActivityCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-bg-card border border-border-primary rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 min-w-[170px]"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] text-text-muted font-medium">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, ease: "easeOut" },
    },
  };

  const featureCards = [
    {
      title: "Asset Inventory",
      desc: "Keep records of servers, developer setups, furniture, and test devices. Auto tags and QR code generator built right in.",
      icon: Boxes,
      color: "text-accent-purple bg-accent-purple/8 border-accent-purple/15",
    },
    {
      title: "Facility Scheduling",
      desc: "Reserve team labs, meeting rooms, or vehicles. Enforces overlap validation to completely prevent scheduling conflicts.",
      icon: CalendarRange,
      color: "text-status-info bg-status-info/8 border-status-info/15",
    },
    {
      title: "Repair Workflows",
      desc: "Report cracked screens or hardware damage. Approvals automatically trigger state changes (e.g. Under Maintenance).",
      icon: Wrench,
      color: "text-status-danger bg-status-danger/8 border-status-danger/15",
    },
    {
      title: "Inventory Audits",
      desc: "Launch audit verification checklist cycles. Automatically locks and moves missing assets to 'Lost' on cycle closure.",
      icon: ClipboardCheck,
      color: "text-status-success bg-status-success/8 border-status-success/15",
    },
    {
      title: "Analytics & Reports",
      desc: "Inspect idle stock lists, booking heatmaps, category metrics, and upcoming retirement notifications.",
      icon: BarChart3,
      color: "text-status-warning bg-status-warning/8 border-status-warning/15",
    },
    {
      title: "Role-Based Access",
      desc: "Granular permission controls for admins, managers, and employees. Every action is logged with a full audit trail.",
      icon: Lock,
      color: "text-accent-purple bg-accent-purple/8 border-accent-purple/15",
    },
  ];

  const stats = [
    { label: "Assets Tracked", value: 1200, suffix: "+", icon: Package },
    { label: "Teams Onboarded", value: 48, suffix: "", icon: Users },
    { label: "Audit Cycles Run", value: 340, suffix: "+", icon: ClipboardCheck },
    { label: "Uptime", value: 99, suffix: ".9%", icon: Activity },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Register Assets",
      desc: "Onboard hardware, furniture, and equipment with serial numbers, categories, photos, and QR codes — in under a minute.",
    },
    {
      step: "02",
      title: "Assign & Allocate",
      desc: "Assign assets to employees or departments. Track who holds what, since when, and for how long.",
    },
    {
      step: "03",
      title: "Monitor & Maintain",
      desc: "Receive alerts for assets nearing end-of-life. Log issues and trigger repair workflows without leaving the dashboard.",
    },
    {
      step: "04",
      title: "Audit & Report",
      desc: "Run periodic verification cycles. Generate comprehensive reports on utilization, costs, and asset health scores.",
    },
  ];

  const aiCapabilities = [
    {
      icon: Bot,
      title: "Smart Asset Recommendations",
      desc: "AI surfaces underutilized assets and suggests optimal reallocation based on team usage patterns.",
    },
    {
      icon: FileSearch,
      title: "Natural Language Search",
      desc: "Ask questions like 'Which laptops are idle in the Mumbai office?' and get instant, filtered results.",
    },
    {
      icon: Bell,
      title: "Predictive Maintenance Alerts",
      desc: "Machine learning models predict asset failure before it happens, reducing downtime and repair costs.",
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization Insights",
      desc: "Identify overspend on redundant assets and get AI-driven budget forecasting for future purchases.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans overflow-x-hidden relative transition-colors duration-200">
      {/* Subtle ambient blobs */}
      <div className="absolute top-[-8%] left-[-12%] w-[55vw] h-[55vw] rounded-full bg-accent-purple/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-12%] w-[45vw] h-[45vw] rounded-full bg-status-info/[0.04] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-status-success/[0.03] blur-[120px] pointer-events-none" />

      {/* ── Navigation Header ───────────────────────────────────────────── */}
      <header className="bg-bg-primary/80 backdrop-blur-md border-b border-border-primary py-3.5 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="AssetFlow Logo"
            className="h-5 w-5 object-contain"
          />
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            AssetFlow
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-xs text-text-secondary hover:text-text-primary transition-colors">How it works</a>
          <a href="#ai" className="text-xs text-text-secondary hover:text-text-primary transition-colors">AI</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/signin"
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link to="/signin">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 sm:px-12 flex flex-col items-center text-center max-w-5xl mx-auto space-y-7 z-10">
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-bg-secondary text-accent-purple border border-border-primary"
        >
          <PulseDot />
          <span>System v1.0 — Now live</span>
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-text-primary"
        >
          The asset tracker designed
          <br />
          <span className="font-semibold text-text-primary">
            for high-output teams.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed"
        >
          Manage hardware lifecycles, book shared team labs, route device repair
          requests, and verify inventories in real-time. Beautifully minimal,
          clean, and completely integrated.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
          className="flex items-center gap-3 pt-2"
        >
          <Link to="/signin">
            <Button variant="primary" size="lg" className="shadow-sm">
              Open App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="secondary" size="lg">
              Explore Features
            </Button>
          </a>
        </motion.div>

        {/* Floating activity cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 pt-6"
        >
          <ActivityCard
            icon={CheckCircle2}
            label="Last audit"
            value="Passed — 2h ago"
            color="text-status-success bg-status-success/8"
            delay={0.55}
          />
          <ActivityCard
            icon={Zap}
            label="Assets assigned today"
            value="14 devices"
            color="text-accent-purple bg-accent-purple/8"
            delay={0.65}
          />
          <ActivityCard
            icon={AlertCircle}
            label="Maintenance requests"
            value="3 pending"
            color="text-status-warning bg-status-warning/8"
            delay={0.75}
          />
        </motion.div>
      </section>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <section className="py-14 px-6 sm:px-12 max-w-6xl mx-auto w-full z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-bg-card border border-border-primary rounded-xl p-5 text-center space-y-2 shadow-sm hover:border-accent-purple/25 transition-all duration-300"
              >
                <div className="flex justify-center">
                  <div className="p-2 bg-accent-purple/8 text-accent-purple rounded-lg border border-accent-purple/12">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-text-primary tabular-nums">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-text-muted font-medium">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-14 relative z-10 w-full">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-bg-secondary text-text-muted border border-border-primary mb-3"
          >
            <Cpu className="h-3 w-3" /> Core Modules
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-2xl font-normal text-text-primary tracking-tight"
          >
            Streamline company infrastructure
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed"
          >
            Bring absolute clarity to hardware assignments, bookings, and shared
            office utilities — all in one unified system.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-bg-card p-6 rounded-xl border border-border-primary space-y-4 hover:border-accent-purple/30 transition-all duration-300 group shadow-sm cursor-default"
              >
                <div className={`p-2.5 rounded-lg w-fit border ${card.color}`}>
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-text-primary">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted group-hover:text-accent-purple transition-colors font-medium">
                  Learn more <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-12">
        <div className="border-t border-border-primary" />
      </div>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full z-10">
        <div className="text-center space-y-2 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-bg-secondary text-text-muted border border-border-primary mb-3"
          >
            <Zap className="h-3 w-3" /> Simple Workflow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-2xl font-normal text-text-primary tracking-tight"
          >
            Get up and running in minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed"
          >
            Four simple steps to complete visibility over your entire asset lifecycle.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {/* Connector line on large screens */}
          <div className="hidden lg:block absolute top-[18px] left-[12.5%] right-[12.5%] h-px bg-border-primary z-0" />

          {workflowSteps.map((ws, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="relative z-10 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-bg-card border-2 border-border-primary flex items-center justify-center flex-shrink-0 hover:border-accent-purple/50 transition-colors duration-300">
                  <span className="text-[10px] font-bold text-accent-purple">
                    {ws.step}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-text-primary">
                  {ws.title}
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-12">
        <div className="border-t border-border-primary" />
      </div>

      {/* ── AI Section ──────────────────────────────────────────────────── */}
      <section id="ai" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-accent-purple/8 text-accent-purple border border-accent-purple/20">
              <Sparkles className="h-3 w-3" /> Coming Soon — AI-Powered
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-text-primary tracking-tight leading-snug">
              Let AI handle the{" "}
              <span className="font-semibold">heavy lifting</span>{" "}
              in asset management.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">
              AssetFlow is building next-generation AI capabilities that surface
              insights, automate routine decisions, and answer your questions
              about your assets — in plain English.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted border border-border-primary rounded-lg px-4 py-3 bg-bg-secondary w-fit">
              <Bot className="h-4 w-4 text-accent-purple" />
              <span className="italic">"Which assets are idle this month?"</span>
              <span className="text-accent-purple font-medium ml-1">→ Ask AI</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <PulseDot color="bg-accent-purple" />
              <span>AI beta access opening soon — stay tuned</span>
            </div>
          </motion.div>

          {/* Right — capability cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {aiCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-bg-card border border-border-primary rounded-xl p-5 space-y-3 hover:border-accent-purple/30 transition-all duration-300 shadow-sm group cursor-default"
                >
                  <div className="p-2 bg-accent-purple/8 text-accent-purple rounded-lg w-fit border border-accent-purple/15">
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <h3 className="text-xs font-semibold text-text-primary">
                    {cap.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {cap.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-12">
        <div className="border-t border-border-primary" />
      </div>

      {/* ── Compliance & Trust Strip ─────────────────────────────────────── */}
      <section className="py-14 px-6 sm:px-12 max-w-6xl mx-auto w-full z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              icon: ShieldCheck,
              title: "Audit-Ready",
              desc: "Every asset action is timestamped and logged. Pass compliance audits with zero preparation.",
              color: "text-status-success bg-status-success/8 border-status-success/15",
            },
            {
              icon: Lock,
              title: "Role-Based Security",
              desc: "Fine-grained access controls ensure only authorised personnel can modify sensitive records.",
              color: "text-accent-purple bg-accent-purple/8 border-accent-purple/15",
            },
            {
              icon: Activity,
              title: "Real-Time Visibility",
              desc: "Live dashboards reflect the current state of every asset, booking, and maintenance request.",
              color: "text-status-info bg-status-info/8 border-status-info/15",
            },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col gap-3 p-6 bg-bg-card border border-border-primary rounded-xl shadow-sm hover:border-accent-purple/25 transition-all duration-300"
              >
                <div className={`p-2.5 rounded-lg w-fit border ${t.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{t.title}</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="bg-bg-card border border-border-primary rounded-2xl p-10 sm:p-14 text-center space-y-5 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-accent-purple/[0.06] blur-[60px] pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-bg-secondary text-text-muted border border-border-primary">
            <Sparkles className="h-3 w-3 text-accent-purple" /> Free to get started
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-text-primary tracking-tight">
            Ready to take control of{" "}
            <span className="font-semibold">your assets?</span>
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Join teams already using AssetFlow to eliminate spreadsheet chaos,
            reduce asset loss, and gain complete operational visibility.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link to="/signin">
              <Button variant="primary" size="lg">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-[10px] text-text-muted">
            No credit card required · Set up in under 5 minutes
          </p>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-bg-secondary text-text-muted py-10 px-6 sm:px-12 border-t border-border-primary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="AssetFlow Logo"
              className="h-4.5 w-4.5 object-contain"
            />
            <span className="text-xs font-semibold text-text-primary tracking-tight">
              AssetFlow
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-[11px] hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-[11px] hover:text-text-primary transition-colors">How it works</a>
            <a href="#ai" className="text-[11px] hover:text-text-primary transition-colors">AI</a>
          </div>
          <p className="text-[11px] font-medium">
            &copy; 2026 AssetFlow ERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
