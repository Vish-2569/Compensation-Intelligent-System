/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex justify-between items-center gap-4 sm:gap-6">
          {/* Logo / Brand Name */}
          <div className="flex items-center flex-shrink-0">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_12px_-3px_rgba(79,46,229,0.3)] group-hover:shadow-[0_6px_16px_-4px_rgba(79,46,229,0.4)] transition-shadow duration-200">
                C
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  CompIntel
                </span>
                <span className="text-[10px] sm:text-xs text-indigo-600 font-semibold uppercase tracking-widest">
                  India
                </span>
              </div>
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2 lg:gap-4" role="navigation" aria-label="Main navigation">
            <a
              href="/"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-200"
              aria-label="Browse Salaries"
            >
              Browse Salaries
            </a>
            <a
              href="/compare"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-200"
              aria-label="Compare Offers"
            >
              Compare Offers
            </a>
            <a
              href="/admin"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all duration-200"
              aria-label="Admin Panel"
            >
              Admin Panel
            </a>
            <a
              href="/submit"
              className="ml-2 lg:ml-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-[0_4px_12px_-3px_rgba(79,46,229,0.3)] hover:shadow-[0_6px_16px_-4px_rgba(79,46,229,0.4)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Submit Salary Information"
            >
              Submit Salary
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 text-slate-700"
            aria-label="Menu"
            aria-expanded="false"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
