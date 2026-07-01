/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="space-y-8 sm:space-y-10">
          {/* Disclaimer */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-200/50 p-4 sm:p-5">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-900">Disclaimer:</span> All submitted salary datasets are completely self-reported, anonymized, and vetted using dynamic anti-spam verification heuristics. Data presented is for informational purposes only and should not be considered as professional financial or legal advice.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a 
              href="/terms" 
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Terms of Service"
            >
              Terms of Service
            </a>
            <div className="hidden sm:block w-px h-5 bg-slate-200" aria-hidden="true" />
            <a 
              href="/privacy" 
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <div className="hidden sm:block w-px h-5 bg-slate-200" aria-hidden="true" />
            <a 
              href="/contact" 
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Contact Curation Admin"
            >
              Contact Admin
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center justify-center pt-6 sm:pt-8 border-t border-slate-200/50">
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              &copy; {currentYear} CompIntel Platform. All rights reserved. | Built with privacy-first design principles.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
