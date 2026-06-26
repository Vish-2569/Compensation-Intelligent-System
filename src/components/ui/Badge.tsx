/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "success" | "warning" | "neutral" | "danger" | "info";
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
  id,
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all";
  
  const variants = {
    brand: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    danger: "bg-rose-100 text-rose-800 border border-rose-200",
    info: "bg-sky-100 text-sky-800 border border-sky-200",
  };

  return (
    <span
      id={id}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
