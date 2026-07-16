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

import React from "react";
import { Sparkles, Layers } from "lucide-react";
import Button from "./Button";

export function TableContainer({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border-primary bg-bg-card shadow-premium dark:shadow-premium-dark ${className}`}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function Table({ children, className = "" }) {
  return (
    <table className={`w-full text-left text-xs border-collapse ${className}`}>
      {children}
    </table>
  );
}

export function Thead({ children }) {
  return (
    <thead>
      <tr className="border-b border-border-primary bg-bg-secondary/60 text-text-muted font-medium select-none">
        {children}
      </tr>
    </thead>
  );
}

export function Tbody({ children }) {
  return (
    <tbody className="divide-y divide-border-primary/50">
      {children}
    </tbody>
  );
}

export function Tr({ children, onClick, className = "" }) {
  return (
    <tr 
      onClick={onClick}
      className={`hover:bg-bg-secondary/50 transition-colors duration-100 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th className={`py-3 px-4.5 font-medium text-text-muted text-[10px] uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return (
    <td className={`py-3.5 px-4.5 text-text-secondary ${className}`}>
      {children}
    </td>
  );
}

export function EmptyState({
  title = "No data found",
  description = "Get started by adding a new item or updating search filters.",
  icon: Icon = Layers,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="inline-flex p-3 bg-bg-secondary text-accent-purple rounded-2xl border border-border-primary mb-4.5 shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="text-xs text-text-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>
      
      {(onPrimaryAction || onSecondaryAction) && (
        <div className="flex gap-2 mt-6">
          {onSecondaryAction && secondaryActionLabel && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {onPrimaryAction && primaryActionLabel && (
            <Button variant="primary" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-4 py-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 border-b border-border-primary/40 last:border-none">
          {Array.from({ length: cols }).map((_, c) => (
            <div 
              key={c} 
              className={`h-3 bg-border-primary rounded-md ${
                c === 0 ? "w-1/4" : c === 1 ? "w-1/3" : "w-1/6"
              }`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
