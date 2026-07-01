import { type ReactNode } from "react";
import { motion } from "motion/react";

export type CompensationPersonalityProps = {
  personality: string;
  icon: ReactNode;
  description: string;
  tagline: string;
  why: string;
  color: string;
  metrics: {
    salaryFocus: number;
    equityPotential: number;
    performance: number;
    stability: number;
  };
  watchOuts: string[];
};

const metricRows = [
  { key: "salaryFocus", label: "Salary Focus" },
  { key: "equityPotential", label: "Equity Potential" },
  { key: "performance", label: "Performance Incentives" },
  { key: "stability", label: "Income Stability" },
] as const;

export function CompensationPersonalityCard({
  personality,
  icon,
  description,
  tagline,
  why,
  color,
  metrics,
  watchOuts,
}: CompensationPersonalityProps) {
  const personalityLabel = personality.replace(/^[^\w\d\s]+/, "").trim();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-900/10 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-3xl ring-1"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compensation Personality</p>
            <div>
              <p className="text-lg font-semibold text-slate-950">{personalityLabel}</p>
              <p className="text-sm text-slate-500">{tagline}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm leading-7 text-slate-700">{description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm font-semibold text-teal-300">Why this fits</p>
            <p className="text-sm leading-7 text-slate-100">{why}</p>
          </div>
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm font-semibold text-teal-300">Watch outs</p>
            <div className="space-y-2">
              {watchOuts.map((item) => (
                <p key={item} className="text-sm leading-7 text-slate-200">
                  • {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {metricRows.map((metric) => {
            const value = metrics[metric.key];
            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
                  <span>{metric.label}</span>
                  <span className="text-slate-100">{value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-teal-300">Personality highlights</p>
          <p className="text-sm leading-7 text-slate-300">This summary is based on your compensation mix and the balance between salary, bonus, and equity.</p>
        </div>
      </div>
    </motion.section>
  );
}
