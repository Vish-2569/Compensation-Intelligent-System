/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs text-slate-400">
          Disclaimer: All submitted salary datasets are completely self-reported, anonymized, and vetted using dynamic anti-spam verification heuristics.
        </p>
        <div className="flex justify-center gap-6 text-xs text-slate-500">
          <a href="/terms" className="hover:text-indigo-600 transition">Terms of Service</a>
          <a href="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</a>
          <a href="/contact" className="hover:text-indigo-600 transition">Contact Curation Admin</a>
        </div>
        <p className="text-[10px] text-slate-400 font-mono">
          &copy; {new Date().getFullYear()} CompIntel Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
