/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 appearance-none disabled:bg-slate-50 disabled:text-slate-400 ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] text-rose-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
