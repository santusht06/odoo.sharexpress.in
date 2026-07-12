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
import { motion } from "framer-motion";
import Button from "../components/ui/Button";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  const featureCards = [
    {
      title: "Asset Inventory",
      desc: "Keep records of servers, developer setups, furniture, and test devices. Auto tags and QR code generator built right in.",
      icon: Boxes,
      color: "text-accent-purple bg-accent-purple/5 border-accent-purple/10"
    },
    {
      title: "Facility Scheduling",
      desc: "Reserve team labs, meeting rooms, or vehicles. Enforces overlap validation constraints to completely prevent scheduling conflicts.",
      icon: CalendarRange,
      color: "text-status-info bg-status-info/5 border-status-info/10"
    },
    {
      title: "Repair Workflows",
      desc: "Report cracked screens or hardware damage. Approvals automatically trigger state changes (e.g. Under Maintenance).",
      icon: Wrench,
      color: "text-status-danger bg-status-danger/5 border-status-danger/10"
    },
    {
      title: "Inventory Audits",
      desc: "Launch audit verification checklist cycles. Automatically locks and moves missing assets to 'Lost' on cycle closure.",
      icon: ClipboardCheck,
      color: "text-status-success bg-status-success/5 border-status-success/10"
    },
    {
      title: "Analytics & Reports",
      desc: "Inspect idle stock lists, booking heatmaps, category metrics, and upcoming retirement notifications.",
      icon: BarChart3,
      color: "text-status-warning bg-status-warning/5 border-status-warning/10"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans overflow-x-hidden relative transition-colors duration-200">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-status-info/5 blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="bg-bg-primary/80 backdrop-blur-md border-b border-border-primary py-3.5 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent-purple/10 text-accent-purple rounded-lg border border-accent-purple/20">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">AssetFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link to="/signin">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-28 px-6 sm:px-12 flex flex-col items-center text-center max-w-4xl mx-auto space-y-7 z-10">
        <motion.span 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-bg-secondary text-accent-purple border border-border-primary"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> System v1.0 Launched
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-light tracking-tight leading-[1.1] text-text-primary"
        >
          The asset tracker designed <br />
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-muted">for high-output teams.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed"
        >
          Manage hardware lifecycles, book shared team labs, route device repair requests, and verify inventories in real-time. Beautifully minimal, clean, and completely integrated.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pt-4"
        >
          <Link to="/signin">
            <Button variant="primary" size="lg" className="shadow-lg">
              Open App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-14 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-normal text-text-primary tracking-tight">Streamline company infrastructure</h2>
          <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
            Bring absolute clarity to hardware assignments and shared office utilities.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-bg-card p-6 rounded-xl border border-border-primary space-y-4 hover:border-accent-purple/30 transition-all duration-300 group shadow-sm"
              >
                <div className={`p-2.5 rounded-lg w-fit border ${card.color}`}>
                  <Icon className="h-5 w-5 group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-xs font-semibold text-text-primary">{card.title}</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-bg-secondary text-text-muted py-10 px-6 sm:px-12 border-t border-border-primary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-accent-purple text-white rounded">
              <Boxes className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-semibold text-text-primary tracking-tight">AssetFlow</span>
          </div>
          <p className="text-[11px] font-medium">
            &copy; 2026 AssetFlow ERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
