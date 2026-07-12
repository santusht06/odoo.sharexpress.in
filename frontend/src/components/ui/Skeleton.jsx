import React from "react";

/**
 * Reusable animated Skeleton loader UI component.
 */
export function Skeleton({ className = "", variant = "rect", ...props }) {
  const baseClass = "bg-border-primary/55 dark:bg-border-primary/25 animate-pulse shrink-0";
  const variantClass = 
    variant === "circle" ? "rounded-full" :
    variant === "text" ? "h-3 rounded w-3/4" : "rounded-xl";

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props} 
    />
  );
}

/**
 * Renders multiple text blocks mimicking standard paragraphs.
 */
export function SkeletonTextBlock({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton 
          key={idx} 
          variant="text" 
          className={
            idx === lines - 1 
              ? "w-1/2" 
              : idx % 2 === 0 
              ? "w-full" 
              : "w-5/6"
          } 
        />
      ))}
    </div>
  );
}

/**
 * Renders a row of mock cells mimicking tabular data.
 */
export function SkeletonRow({ cols = 4, className = "" }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 px-4.5 border-b border-border-primary/45 last:border-0 ${className}`}>
      {Array.from({ length: cols }).map((_, idx) => (
        <Skeleton 
          key={idx} 
          className={`h-4 ${
            idx === 0 ? "w-[120px]" :
            idx === 1 ? "w-[180px]" :
            idx === 2 ? "w-[80px]" : "w-[100px]"
          }`} 
        />
      ))}
    </div>
  );
}

/**
 * Renders a block mimicking dashboard metric cards.
 */
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-bg-card border border-border-primary rounded-2xl p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4.5 w-1/3" />
        <Skeleton variant="circle" className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
