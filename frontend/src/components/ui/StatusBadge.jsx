import React from "react";

export default function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase().trim();
  
  let styles = "bg-text-muted/10 text-text-secondary border-text-muted/10";
  let dotColor = "bg-text-muted";
  
  if (normalized === "available") {
    styles = "bg-status-success/10 text-status-success border-status-success/20";
    dotColor = "bg-status-success";
  } else if (normalized === "allocated" || normalized === "active") {
    styles = "bg-status-info/10 text-status-info border-status-info/20";
    dotColor = "bg-status-info";
  } else if (normalized === "under maintenance" || normalized === "maintenance" || normalized === "pending") {
    styles = "bg-status-warning/10 text-status-warning border-status-warning/20";
    dotColor = "bg-status-warning";
  } else if (normalized === "reserved" || normalized === "upcoming") {
    styles = "bg-accent-purple/10 text-accent-purple border-accent-purple/20";
    dotColor = "bg-accent-purple";
  } else if (normalized === "lost" || normalized === "overdue" || normalized === "rejected") {
    styles = "bg-status-danger/10 text-status-danger border-status-danger/20";
    dotColor = "bg-status-danger";
  } else if (normalized === "retired" || normalized === "disposed" || normalized === "completed") {
    styles = "bg-text-muted/15 text-text-muted border-border-primary";
    dotColor = "bg-text-muted";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
