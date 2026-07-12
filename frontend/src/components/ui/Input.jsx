import React from "react";

export default function Input({
  label,
  type = "text",
  error,
  description,
  className = "",
  id,
  required = false,
  ...props
}) {
  const baseInputStyle = "w-full rounded-lg border border-border-primary bg-bg-card px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:border-accent-purple/80 focus:bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all";
  const errorInputStyle = "border-status-danger/60 focus:border-status-danger focus:ring-status-danger/20";
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[10px] font-medium text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-status-danger font-bold">*</span>}
        </label>
      )}
      
      {type === "textarea" ? (
        <textarea
          id={id}
          required={required}
          className={`${baseInputStyle} ${error ? errorInputStyle : ""} min-h-[80px] resize-y`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          className={`${baseInputStyle} ${error ? errorInputStyle : ""}`}
          {...props}
        />
      )}

      {description && !error && (
        <p className="text-[10px] text-text-muted/80">{description}</p>
      )}
      
      {error && (
        <p className="text-[10px] font-medium text-status-danger">{error}</p>
      )}
    </div>
  );
}
