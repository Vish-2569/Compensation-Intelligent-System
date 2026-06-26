/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                C
              </div>
              <span className="text-md font-bold text-slate-900 tracking-tight">
                CompIntel <span className="text-xs text-indigo-600 font-semibold uppercase">India</span>
              </span>
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <a
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              Browse Salaries
            </a>
            <a
              href="/compare"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              Compare Offers
            </a>
            <a
              href="/admin"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              Admin Panel
            </a>
            <a
              href="/submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Submit Salary
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
