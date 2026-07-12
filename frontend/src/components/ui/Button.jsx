import React from "react";
import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-purple/40 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-accent-purple hover:bg-[#6e7be2] text-white border border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]",
    secondary: "bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
    danger: "bg-status-danger/10 hover:bg-status-danger/25 text-status-danger border border-status-danger/20",
    warning: "bg-status-warning/10 hover:bg-status-warning/25 text-status-warning border border-status-warning/20",
    success: "bg-status-success/10 hover:bg-status-success/25 text-status-success border border-status-success/20",
    info: "bg-status-info/10 hover:bg-status-info/25 text-status-info border border-status-info/20",
    ghost: "hover:bg-bg-secondary text-text-secondary hover:text-text-primary"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-[11px] gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-4.5 py-2.5 text-sm gap-2.5"
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { y: -0.5 }}
      whileTap={disabled ? {} : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
