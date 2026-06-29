import { useState } from "react";
import { salaryRecordSchema } from "../../../schemas/salaryRecord.schema";
import { CompanyTier, Currency, StandardLevel, COMMON_TECH_ROLES } from "../../../types/salaryRecord";

const currencySymbols: Record<Currency, string> = { [Currency.INR]: "₹", [Currency.USD]: "$", [Currency.EUR]: "€", [Currency.GBP]: "£" };

type Values = { companyTier: CompanyTier; companyNameOptional: string; role: (typeof COMMON_TECH_ROLES)[number]; standardLevel: StandardLevel; baseSalary: string; annualBonus: string; annualStock: string; yearsOfExperience: string; officeLocation: string; currency: Currency; submittedAt: string; };

function SelectField({ id, label, value, options, error, onChange, onBlur }: { id: string; label: string; value: string; options: readonly string[]; error?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; onBlur?: () => void; }) {
  return <div><label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label><select id={id} value={value} onChange={onChange} onBlur={onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>{error ? <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{error}</p> : null}</div>;
}

function CurrencyInput({ id, label, value, currency, error, onChange, onBlur }: { id: string; label: string; value: string; currency: Currency; error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; }) {
  return <div><label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{label}</label><div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-400"><span className="px-3 text-sm font-semibold text-slate-500">{currencySymbols[currency]}</span><input id={id} type="number" min="0" step="1" inputMode="numeric" value={value} onChange={onChange} onBlur={onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="w-full rounded-r-xl px-0 py-2.5 text-sm outline-none" /></div>{error ? <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{error}</p> : null}</div>;
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

  const setField = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [field]: e.target.value as never }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ companyTier: true, companyNameOptional: true, role: true, standardLevel: true, baseSalary: true, annualBonus: true, annualStock: true, yearsOfExperience: true, officeLocation: true, currency: true, submittedAt: true });
    if (parsed.success && requiredReady) setSubmitted(`Submitted anonymously for ${parsed.data.role} in ${parsed.data.officeLocation}.`);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">About the role</h2>
          <SelectField id="companyTier" label="Company tier" value={values.companyTier} options={Object.values(CompanyTier)} error={touched.companyTier ? errors.companyTier?.[0] : undefined} onChange={setField("companyTier") as never} onBlur={() => setTouched((t) => ({ ...t, companyTier: true }))} />
          <div>
            <button type="button" onClick={() => { const next = !showCompanyName; setShowCompanyName(next); if (!next) setValues((v) => ({ ...v, companyNameOptional: "" })); setTouched((t) => ({ ...t, companyNameOptional: true })); }} className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4">
              {showCompanyName ? "Hide company name" : "Add company name (optional)"}
            </button>
            {showCompanyName ? <div className="mt-3"><label htmlFor="companyNameOptional" className="mb-1 block text-sm font-medium text-slate-700">Company name</label><input id="companyNameOptional" value={values.companyNameOptional} onChange={setField("companyNameOptional") as never} onBlur={() => setTouched((t) => ({ ...t, companyNameOptional: true }))} aria-invalid={!!errors.companyNameOptional?.[0]} aria-describedby={errors.companyNameOptional?.[0] ? "companyNameOptional-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" placeholder="Acme Corp" />{errors.companyNameOptional?.[0] ? <p id="companyNameOptional-error" className="mt-1 text-xs text-rose-600">{errors.companyNameOptional[0]}</p> : null}</div> : null}
          </div>
          <SelectField id="role" label="Role" value={values.role} options={COMMON_TECH_ROLES} error={touched.role ? errors.role?.[0] : undefined} onChange={setField("role") as never} onBlur={() => setTouched((t) => ({ ...t, role: true }))} />
          <SelectField id="standardLevel" label="Standard level" value={values.standardLevel} options={Object.values(StandardLevel)} error={touched.standardLevel ? errors.standardLevel?.[0] : undefined} onChange={setField("standardLevel") as never} onBlur={() => setTouched((t) => ({ ...t, standardLevel: true }))} />
          <div><label htmlFor="officeLocation" className="mb-1 block text-sm font-medium text-slate-700">Office location</label><input id="officeLocation" value={values.officeLocation} onChange={setField("officeLocation") as never} onBlur={() => setTouched((t) => ({ ...t, officeLocation: true }))} aria-invalid={!!errors.officeLocation?.[0]} aria-describedby={errors.officeLocation?.[0] ? "officeLocation-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" placeholder="Bangalore" />{errors.officeLocation?.[0] ? <p id="officeLocation-error" className="mt-1 text-xs text-rose-600">{errors.officeLocation[0]}</p> : null}</div>
          <div><label htmlFor="yearsOfExperience" className="mb-1 block text-sm font-medium text-slate-700">Years of experience</label><input id="yearsOfExperience" type="number" min="0" max="50" value={values.yearsOfExperience} onChange={setField("yearsOfExperience") as never} onBlur={() => setTouched((t) => ({ ...t, yearsOfExperience: true }))} aria-invalid={!!errors.yearsOfExperience?.[0]} aria-describedby={errors.yearsOfExperience?.[0] ? "yearsOfExperience-error" : undefined} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />{errors.yearsOfExperience?.[0] ? <p id="yearsOfExperience-error" className="mt-1 text-xs text-rose-600">{errors.yearsOfExperience[0]}</p> : null}</div>
        </section>
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-slate-900">Compensation</h2><span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">Total {currencySymbols[values.currency]}{totalComp.toLocaleString()}</span></div>
          <CurrencyInput id="baseSalary" label="Base salary" value={values.baseSalary} currency={values.currency} error={touched.baseSalary ? errors.baseSalary?.[0] : undefined} onChange={setField("baseSalary") as never} onBlur={() => setTouched((t) => ({ ...t, baseSalary: true }))} />
          <CurrencyInput id="annualBonus" label="Annual bonus" value={values.annualBonus} currency={values.currency} error={touched.annualBonus ? errors.annualBonus?.[0] : undefined} onChange={setField("annualBonus") as never} onBlur={() => setTouched((t) => ({ ...t, annualBonus: true }))} />
          <CurrencyInput id="annualStock" label="Annual stock" value={values.annualStock} currency={values.currency} error={touched.annualStock ? errors.annualStock?.[0] : undefined} onChange={setField("annualStock") as never} onBlur={() => setTouched((t) => ({ ...t, annualStock: true }))} />
          <SelectField id="currency" label="Currency" value={values.currency} options={Object.values(Currency)} error={touched.currency ? errors.currency?.[0] : undefined} onChange={setField("currency") as never} onBlur={() => setTouched((t) => ({ ...t, currency: true }))} />
        </section>
        <div className="space-y-3"><button type="submit" disabled={!isValid} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Submit anonymously</button><p className="text-xs text-slate-500">We store this anonymously. Company name is optional and never required.</p>{submitted ? <p className="text-sm text-emerald-700">{submitted}</p> : null}</div>
      </div>
    </form>
  );
}
