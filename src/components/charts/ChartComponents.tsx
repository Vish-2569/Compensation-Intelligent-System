import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts";

export const premiumColors = {
  primary: "#4f46e5",
  secondary: "#6366f1",
  accent: "#0f172a",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  slate: "#64748b",
  light: "#f1f5f9",
};

const chartColorPalette = [
  "#2563eb", // blue
  "#10b981", // green
  "#6b7280", // grey
];

export interface CompensationBreakdownData {
  name: string;
  value: number;
  color?: string;
}

export interface MarketDistributionData {
  name: string;
  count: number;
}

export interface TrendData {
  label: string;
  value: number;
  expectedValue?: number;
}

export interface ComparisonData {
  name: string;
  value: number;
  percentage?: number;
}

export interface StatisticCardData {
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
}

/**
 * Enhanced Compensation Breakdown Donut Chart
 * with animations and smooth transitions
 */
export function CompensationBreakdownDonut({
  data,
  currencySymbol = "₹",
  height = 240,
  showLegend = true,
}: {
  data: CompensationBreakdownData[];
  currencySymbol?: string;
  height?: number;
  showLegend?: boolean;
}) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={3}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={entry.color || chartColorPalette[index % chartColorPalette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | readonly (number | string)[] | undefined) =>
                `${currencySymbol}${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`
              }
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "12px",
                color: "#f1f5f9",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 grid gap-2"
        >
          {data.map((item, index) => (
            <div key={`${item.name}-legend-${index}`} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color || chartColorPalette[index % chartColorPalette.length] }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Enhanced Market Distribution Histogram
 * with gradient bars and animations
 */
export function MarketDistributionHistogram({
  data,
  height = 200,
  showGrid = true,
}: {
  data: MarketDistributionData[];
  height?: number;
  showGrid?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number | string | readonly (number | string)[] | undefined) =>
              `${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()} submissions`
            }
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
          />
          <Bar
            dataKey="count"
            fill={premiumColors.primary}
            radius={[8, 8, 0, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Salary Trend Line Chart
 * showing compensation trend over experience or time
 */
export function SalaryTrendLine({
  data,
  currencySymbol = "₹",
  height = 200,
  xAxisLabel = "Experience (years)",
  yAxisLabel = "Compensation",
}: {
  data: TrendData[];
  currencySymbol?: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number | string | readonly (number | string)[] | undefined) =>
              `${currencySymbol}${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`
            }
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="expectedValue"
            fill={premiumColors.secondary}
            stroke={premiumColors.secondary}
            fillOpacity={0.2}
            name="Expected Range"
            animationDuration={600}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={premiumColors.primary}
            strokeWidth={3}
            dot={{ fill: premiumColors.primary, r: 5 }}
            activeDot={{ r: 7 }}
            name={yAxisLabel}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Company Tier Comparison Chart
 * showing compensation by company tier
 */
export function CompanyTierComparison({
  data,
  currencySymbol = "₹",
  height = 240,
}: {
  data: ComparisonData[];
  currencySymbol?: string;
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number | string | readonly (number | string)[] | undefined) =>
              `${currencySymbol}${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`
            }
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
          />
          <Bar
            dataKey="value"
            fill={premiumColors.primary}
            radius={[8, 8, 0, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Role Comparison Chart
 * showing compensation by role
 */
export function RoleComparison({
  data,
  currencySymbol = "₹",
  height = 240,
}: {
  data: ComparisonData[];
  currencySymbol?: string;
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={190}
          />
          <Tooltip
            formatter={(value: number | string | readonly (number | string)[] | undefined) =>
              `${currencySymbol}${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`
            }
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
          />
          <Bar
            dataKey="value"
            fill={premiumColors.secondary}
            radius={[0, 8, 8, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Experience Comparison Chart
 * showing compensation by years of experience
 */
export function ExperienceComparison({
  data,
  currencySymbol = "₹",
  height = 200,
}: {
  data: TrendData[];
  currencySymbol?: string;
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorExperience" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={premiumColors.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={premiumColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number | string | readonly (number | string)[] | undefined) =>
              `${currencySymbol}${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`
            }
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={premiumColors.primary}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorExperience)"
            animationDuration={600}
            animationEasing="ease-out"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Statistic Cards with animated numbers
 * replaces static text cards
 */
export function StatisticCards({ data }: { data: StatisticCardData[] }) {
  return (
    <motion.div className="grid gap-3">
      {data.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">{stat.label}</span>
            <motion.span
              key={stat.value}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-semibold text-slate-900"
            >
              {stat.value}
              {stat.unit && <span className="ml-1 text-xs font-medium text-slate-500">{stat.unit}</span>}
            </motion.span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
