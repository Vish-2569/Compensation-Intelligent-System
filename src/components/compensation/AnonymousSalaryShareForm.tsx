import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, Briefcase, CalendarClock, CircleDollarSign, Sparkles } from "lucide-react";
import { salaryRecordSchema } from "../../../schemas/salaryRecord.schema";
import { CompanyTier, Currency, StandardLevel, COMMON_TECH_ROLES } from "../../../types/salaryRecord";

const currencySymbols: Record<Currency, string> = { [Currency.INR]: "₹", [Currency.USD]: "$", [Currency.EUR]: "€", [Currency.GBP]: "£" };

type Values = { companyTier: CompanyTier; companyNameOptional: string; role: (typeof COMMON_TECH_ROLES)[number]; standardLevel: StandardLevel; baseSalary: string; annualBonus: string; annualStock: string; yearsOfExperience: string; officeLocation: string; currency: Currency; submittedAt: string; };

function getFieldErrorMessage(message?: string) {
  return undefined;
}

function SelectField({ id, label, value, options, error, onChange, onBlur }: { id: string; label: string; value: string; options: readonly string[]; error?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; onBlur?: () => void; }) {
  const normalizedError = getFieldErrorMessage(error);
  return <div><label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label><select id={id} value={value} onChange={onChange} onBlur={onBlur} aria-invalid={!!normalizedError} aria-describedby={normalizedError ? `${id}-error` : undefined} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>{normalizedError ? <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{normalizedError}</p> : null}</div>;
}

function CurrencyInput({ id, label, value, currency, error, onChange, onBlur }: { id: string; label: string; value: string; currency: Currency; error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; }) {
  const normalizedError = getFieldErrorMessage(error);
  return <div><label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label><div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-400"><span className="px-3 text-sm font-semibold text-slate-500">{currencySymbols[currency]}</span><input id={id} type="number" min="0" step="1" inputMode="numeric" value={value} onChange={onChange} onBlur={onBlur} aria-invalid={!!normalizedError} aria-describedby={normalizedError ? `${id}-error` : undefined} className="w-full rounded-r-xl px-0 py-2.5 text-sm outline-none" /></div>{normalizedError ? <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{normalizedError}</p> : null}</div>;
}

function getPackageProfile(base: number, bonus: number, stock: number) {
  const total = base + bonus + stock;
  if (stock > total * 0.35) return { title: "Equity Heavy", blurb: "Ownership and upside anchor this package." };
  if (bonus > total * 0.2) return { title: "Performance Driven", blurb: "Incentives play a major role in how value is earned." };
  if (base > total * 0.6) return { title: "Stability Focused", blurb: "Dependable cash flow is the core of this offer." };
  if (base > 0 && bonus > 0 && stock > 0) return { title: "Balanced Package", blurb: "Cash, bonus, and equity all contribute to the plan." };
  return { title: "Growth Oriented", blurb: "This package is structured to build long-term value." };
}

export default function AnonymousSalaryShareForm() {
  const [values, setValues] = useState<Values>({ companyTier: CompanyTier.Startup, companyNameOptional: "", role: COMMON_TECH_ROLES[0], standardLevel: StandardLevel.L3, baseSalary: "", annualBonus: "", annualStock: "", yearsOfExperience: "", officeLocation: "", currency: Currency.INR, submittedAt: new Date().toISOString() });
  const [showCompanyName, setShowCompanyName] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState("");

  const parsed = salaryRecordSchema.safeParse({ ...values, baseSalary: Number(values.baseSalary || 0), annualBonus: Number(values.annualBonus || 0), annualStock: Number(values.annualStock || 0), yearsOfExperience: Number(values.yearsOfExperience || 0), submittedAt: values.submittedAt });
  const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
  const requiredReady = values.baseSalary !== "" && values.annualBonus !== "" && values.annualStock !== "" && values.yearsOfExperience !== "" && values.officeLocation.trim() !== "";
  const isValid = parsed.success && requiredReady;
  const totalComp = Number(values.baseSalary || 0) + Number(values.annualBonus || 0) + Number(values.annualStock || 0);
  const chartItems = [
    { label: "Base salary", value: Number(values.baseSalary || 0), color: "#2563eb" },
    { label: "Annual bonus", value: Number(values.annualBonus || 0), color: "#10b981" },
    { label: "Annual stock", value: Number(values.annualStock || 0), color: "#374151" },
  ];
  const chartSegments = (() => {
    const safeTotal = totalComp > 0 ? totalComp : 1;
    let start = 0;
    return chartItems.map((item) => {
      const share = item.value / safeTotal;
      const end = start + share * 360;
      const segment = `${item.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
      start = end;
      return { ...item, share, segment };
    });
  })();
  const pieBackground = chartSegments.every((item) => item.value === 0)
    ? "conic-gradient(#e2e8f0 0deg 360deg)"
    : `conic-gradient(${chartSegments.map((item) => item.segment).join(", ")})`;

  const aiInsights = useMemo(() => {
    const base = Number(values.baseSalary || 0);
    const bonus = Number(values.annualBonus || 0);
    const stock = Number(values.annualStock || 0);
    const total = base + bonus + stock;
    const baseShare = total > 0 ? (base / total) * 100 : 0;
    const bonusShare = total > 0 ? (bonus / total) * 100 : 0;
    const stockShare = total > 0 ? (stock / total) * 100 : 0;

    return [
      {
        title: "Base salary strength",
        value: `${currencySymbols[values.currency]}${base.toLocaleString()}`,
        detail: total > 0
          ? `This forms ${Math.round(baseShare)}% of the package, giving you a solid base of predictable cash flow.`
          : "Add a base salary to see how much of your package is anchored in recurring income.",
      },
      {
        title: "Bonus upside",
        value: `${currencySymbols[values.currency]}${bonus.toLocaleString()}`,
        detail: total > 0
          ? `Bonus contributes ${Math.round(bonusShare)}% of the package, which suggests meaningful performance-linked upside.`
          : "Add a bonus target to understand how much your package depends on incentives.",
      },
      {
        title: "Equity leverage",
        value: `${currencySymbols[values.currency]}${stock.toLocaleString()}`,
        detail: total > 0
          ? `Equity makes up ${Math.round(stockShare)}% of the package, which can be valuable for long-term ownership but is less liquid.`
          : "Add stock value to capture the long-term upside potential of this offer.",
      },
    ];
  }, [values.baseSalary, values.annualBonus, values.annualStock, values.currency]);

  const snapshot = useMemo(() => {
    const base = Number(values.baseSalary || 0);
    const bonus = Number(values.annualBonus || 0);
    const stock = Number(values.annualStock || 0);
    const total = base + bonus + stock;

    const structure = [
      {
        title: "Base Salary",
        value: `${currencySymbols[values.currency]}${base.toLocaleString()}`,
        cadence: "Monthly",
        detail: "Guaranteed cash flow",
        accent: "from-cyan-500/20 via-cyan-500/10 to-transparent",
        icon: CircleDollarSign,
      },
      {
        title: "Annual Bonus",
        value: `${currencySymbols[values.currency]}${bonus.toLocaleString()}`,
        cadence: bonus > 0 ? "Quarterly / yearly" : "Targeted payout",
        detail: bonus > 0 ? "Performance-linked upside" : "Add a bonus target to shape this layer",
        accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
        icon: Sparkles,
      },
      {
        title: "Equity",
        value: `${currencySymbols[values.currency]}${stock.toLocaleString()}`,
        cadence: stock > 0 ? "Vesting schedule" : "Potential upside",
        detail: stock > 0 ? "Long-term ownership value" : "Add equity value to map future upside",
        accent: "from-violet-500/20 via-violet-500/10 to-transparent",
        icon: Briefcase,
      },
      {
        title: "Benefits",
        value: "Offer-defined",
        cadence: "Perks layer",
        detail: "Support and benefits can be layered into your package plan",
        accent: "from-slate-500/20 via-slate-500/10 to-transparent",
        icon: BadgeCheck,
      },
    ];

    const profile = getPackageProfile(base, bonus, stock);

    const highlights = [
      base > 0 ? "Strong guaranteed income" : "Cash flow is still being defined",
      stock > 0 ? "Includes long-term equity" : "Equity is not yet part of this snapshot",
      bonus > 0 ? "Performance incentives included" : "Bonus structure is still being defined",
      base > 0 && bonus > 0 && stock > 0 ? "Multiple reward channels" : "A focused package shape",
    ];

    const activeComponents = [base > 0, bonus > 0, stock > 0].filter(Boolean).length;
    const complexityDots = Math.min(5, Math.max(2, activeComponents + 1));
    const complexityLabel = complexityDots <= 2 ? "Simple Package" : complexityDots <= 4 ? "Balanced Package" : "Complex Package";

    const milestones = [
      { title: "Offer Accepted", detail: "Your submission is ready to review" },
      { title: "First Paycheck", detail: base > 0 ? "Base salary starts flowing in" : "Base pay will appear here" },
      { title: "Bonus Cycle", detail: bonus > 0 ? "Performance rewards become visible" : "Bonus timing will appear when defined" },
      { title: "Equity Vesting", detail: stock > 0 ? "Ownership value unlocks over time" : "Equity milestones will appear when defined" },
    ];

    return {
      structure,
      profile,
      highlights,
      total,
      complexityDots,
      complexityLabel,
      milestones,
    };
  }, [values.baseSalary, values.annualBonus, values.annualStock, values.currency]);

  const setField = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [field]: e.target.value as never }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ companyTier: true, companyNameOptional: true, role: true, standardLevel: true, baseSalary: true, annualBonus: true, annualStock: true, yearsOfExperience: true, officeLocation: true, currency: true, submittedAt: true });
    if (parsed.success && requiredReady) setSubmitted(`Submitted anonymously for ${parsed.data.role} in ${parsed.data.officeLocation}.`);
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.15fr)] lg:items-stretch">
      <div className="flex h-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:max-w-[760px]">
        <section className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">About the role</h2>
          <SelectField id="companyTier" label="Company tier" value={values.companyTier} options={Object.values(CompanyTier)} error={touched.companyTier ? errors.companyTier?.[0] : undefined} onChange={setField("companyTier") as never} onBlur={() => setTouched((t) => ({ ...t, companyTier: true }))} />
          <div>
            <button type="button" onClick={() => { const next = !showCompanyName; setShowCompanyName(next); if (!next) setValues((v) => ({ ...v, companyNameOptional: "" })); setTouched((t) => ({ ...t, companyNameOptional: true })); }} className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4">
              {showCompanyName ? "Hide company name" : "Add company name (optional)"}
            </button>
            {showCompanyName ? <div className="mt-3"><label htmlFor="companyNameOptional" className="mb-1 block text-sm font-medium text-slate-700">Company name</label><input id="companyNameOptional" value={values.companyNameOptional} onChange={setField("companyNameOptional") as never} onBlur={() => setTouched((t) => ({ ...t, companyNameOptional: true }))} aria-invalid={!!getFieldErrorMessage(errors.companyNameOptional?.[0])} aria-describedby={getFieldErrorMessage(errors.companyNameOptional?.[0]) ? "companyNameOptional-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" placeholder="Acme Corp" />{getFieldErrorMessage(errors.companyNameOptional?.[0]) ? <p id="companyNameOptional-error" className="mt-1 text-xs text-rose-600">{getFieldErrorMessage(errors.companyNameOptional?.[0])}</p> : null}</div> : null}
          </div>
          <SelectField id="role" label="Role" value={values.role} options={COMMON_TECH_ROLES} error={touched.role ? errors.role?.[0] : undefined} onChange={setField("role") as never} onBlur={() => setTouched((t) => ({ ...t, role: true }))} />
          <SelectField id="standardLevel" label="Standard level" value={values.standardLevel} options={Object.values(StandardLevel)} error={touched.standardLevel ? errors.standardLevel?.[0] : undefined} onChange={setField("standardLevel") as never} onBlur={() => setTouched((t) => ({ ...t, standardLevel: true }))} />
          <div><label htmlFor="officeLocation" className="mb-1 block text-sm font-medium text-slate-700">Office location</label><input id="officeLocation" value={values.officeLocation} onChange={setField("officeLocation") as never} onBlur={() => setTouched((t) => ({ ...t, officeLocation: true }))} aria-invalid={!!getFieldErrorMessage(errors.officeLocation?.[0])} aria-describedby={getFieldErrorMessage(errors.officeLocation?.[0]) ? "officeLocation-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" placeholder="Bangalore" />{getFieldErrorMessage(errors.officeLocation?.[0]) ? <p id="officeLocation-error" className="mt-1 text-xs text-rose-600">{getFieldErrorMessage(errors.officeLocation[0])}</p> : null}</div>
          <div><label htmlFor="yearsOfExperience" className="mb-1 block text-sm font-medium text-slate-700">Years of experience</label><input id="yearsOfExperience" type="number" min="0" max="50" value={values.yearsOfExperience} onChange={setField("yearsOfExperience") as never} onBlur={() => setTouched((t) => ({ ...t, yearsOfExperience: true }))} aria-invalid={!!errors.yearsOfExperience?.[0]} aria-describedby={errors.yearsOfExperience?.[0] ? "yearsOfExperience-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />{errors.yearsOfExperience?.[0] ? <p id="yearsOfExperience-error" className="mt-1 text-xs text-rose-600">{errors.yearsOfExperience[0]}</p> : null}</div>
        </section>
        <section className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-slate-900">Compensation</h2><span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">Total {currencySymbols[values.currency]}{totalComp.toLocaleString()}</span></div>
          <CurrencyInput id="baseSalary" label="Base salary" value={values.baseSalary} currency={values.currency} error={touched.baseSalary ? errors.baseSalary?.[0] : undefined} onChange={setField("baseSalary") as never} onBlur={() => setTouched((t) => ({ ...t, baseSalary: true }))} />
          <CurrencyInput id="annualBonus" label="Annual bonus" value={values.annualBonus} currency={values.currency} error={touched.annualBonus ? errors.annualBonus?.[0] : undefined} onChange={setField("annualBonus") as never} onBlur={() => setTouched((t) => ({ ...t, annualBonus: true }))} />
          <CurrencyInput id="annualStock" label="Annual stock" value={values.annualStock} currency={values.currency} error={touched.annualStock ? errors.annualStock?.[0] : undefined} onChange={setField("annualStock") as never} onBlur={() => setTouched((t) => ({ ...t, annualStock: true }))} />
          <SelectField id="currency" label="Currency" value={values.currency} options={Object.values(Currency)} error={touched.currency ? errors.currency?.[0] : undefined} onChange={setField("currency") as never} onBlur={() => setTouched((t) => ({ ...t, currency: true }))} />
        </section>
        <section className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Compensation mix</h3>
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Live pie chart</span>
          </div>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-slate-200 bg-white p-4 shadow-inner">
              <div className="h-44 w-44 rounded-full" style={{ background: pieBackground }} />
            </div>
            <div className="flex-1 space-y-3">
              {chartSegments.map((item) => {
                const percentage = totalComp > 0 ? Math.round(item.share * 100) : 0;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{percentage}%</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{currencySymbols[values.currency]}{item.value.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <div className="mt-2 space-y-4">
          <button type="submit" disabled={!isValid} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Submit anonymously</button>
          <p className="text-xs text-slate-500">We store this anonymously. Company name is optional and never required.</p>
          {submitted ? <p className="text-sm text-emerald-700">{submitted}</p> : null}
        </div>
        <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-slate-900 p-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">AI insights</h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Offer readout</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {aiInsights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <aside className="flex h-full w-full rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:p-4 lg:ml-auto lg:max-w-[640px]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-4 text-slate-100 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-2.5 text-cyan-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">Compensation Snapshot</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Your package overview</h3>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            A premium view of your offer built from the values you submitted, organized for clarity and decision-making.
          </p>

          {totalComp > 0 ? (
            <div className="mt-5 space-y-5">
              <section className="rounded-[22px] border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Package profile</p>
                    <h4 className="mt-2 text-2xl font-semibold text-white">{snapshot.profile.title}</h4>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{snapshot.profile.blurb}</p>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                    {currencySymbols[values.currency]}{snapshot.total.toLocaleString()}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">Compensation components</h4>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Core layers</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {snapshot.structure.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full rounded-[18px] border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2 text-cyan-200">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{item.cadence}</span>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-lg font-semibold text-cyan-200">{item.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CalendarClock className="h-4 w-4 text-cyan-300" />
                  Earnings timeline
                </div>
                <div className="mt-4 space-y-4">
                  <div className="relative ml-2 border-l border-white/10 pl-5">
                    {[
                      { title: "Base Pay", label: "Monthly", detail: "Guaranteed income arrives on a recurring basis" },
                      { title: "Bonus", label: "Quarterly / yearly", detail: "Performance rewards unlock when targets are met" },
                      { title: "Equity", label: "Vesting schedule", detail: "Long-term ownership value is realized over time" },
                    ].map((step, index) => (
                      <div key={step.title} className="relative pb-4 last:pb-0">
                        <span className="absolute -left-[1.36rem] top-1.5 h-2.5 w-2.5 rounded-full border border-cyan-300/50 bg-cyan-300" />
                        <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">{step.title}</p>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{step.label}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{step.detail}</p>
                        </div>
                        {index < 2 ? <div className="absolute left-[-0.84rem] top-4 h-full w-px bg-gradient-to-b from-cyan-300/70 to-transparent" /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                  <h4 className="text-sm font-semibold text-white">Key highlights</h4>
                  <ul className="mt-4 space-y-2">
                    {snapshot.highlights.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
                        <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <span className="text-sm leading-6 text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                  <h4 className="text-sm font-semibold text-white">Package complexity</h4>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Simple</span>
                      <span>Complex</span>
                    </div>
                    <div className="mt-3 rounded-full border border-white/10 bg-white/[0.05] p-1">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400" style={{ width: `${(snapshot.complexityDots / 5) * 100}%` }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-300">{snapshot.complexityLabel}</span>
                      <span className="text-sm font-semibold text-cyan-200">{snapshot.complexityDots}/5</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <h4 className="text-sm font-semibold text-white">Next milestones</h4>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {snapshot.milestones.map((milestone, index) => (
                    <div key={milestone.title} className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3 text-center">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-200">
                        {index + 1}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{milestone.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{milestone.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
              Add your base salary, bonus, and equity values to generate a premium compensation snapshot tailored to your offer.
            </div>
          )}
        </motion.section>
      </aside>
    </form>
  );
}
