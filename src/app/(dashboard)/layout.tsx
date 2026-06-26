/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
