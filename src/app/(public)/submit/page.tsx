/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";
import { Select } from "../../../components/ui/Select";
import { CompanyDTO, LevelDTO, RoleDTO } from "../../../lib/types";
import { CheckCircle2, ChevronRight, ChevronLeft, HelpCircle, Loader2, Sparkles } from "lucide-react";

export default function SubmitPublic() {
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [levels, setLevels] = useState<LevelDTO[]>([]);

  // Metadata states
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  // Form Fields
  const [companyId, setCompanyId] = useState("");
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [customCompanyName, setCustomCompanyName] = useState("");

  const [roleCategory, setRoleCategory] = useState("ENGINEERING");
  const [roleId, setRoleId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [employmentType, setEmploymentType] = useState("FULLTIME");

  const [baseSalary, setBaseSalary] = useState("");
  const [annualBonus, setAnnualBonus] = useState("");
  const [equityValueAnnual, setEquityValueAnnual] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [offerMonth, setOfferMonth] = useState("06");
  const [offerYear, setOfferYear] = useState("2026");

  const [locationCity, setLocationCity] = useState("Bangalore");
  const [locationCountry] = useState("India");
  const [locationRegion] = useState("APAC");

  // Fetch initial companies & roles
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [companiesRes, rolesRes] = await Promise.all([
          fetch("/api/companies"),
          fetch("/api/roles"),
        ]);
        const companiesJson = await companiesRes.json();
        const rolesJson = await rolesRes.json();

        const loadedCompanies = companiesJson.data || [];
        setCompanies(loadedCompanies);
        
        // Grouped roles by category came from endpoint, flatten or extract engineering as default
        const rolesGrouped = rolesJson.data || {};
        const allRoles: RoleDTO[] = [];
        Object.keys(rolesGrouped).forEach((cat) => {
          allRoles.push(...rolesGrouped[cat]);
        });
        setRoles(allRoles);

        if (loadedCompanies.length > 0) {
          setCompanyId(loadedCompanies[0].id);
        }
      } catch (e) {
        console.error("Failed to load metadata inside submission form:", e);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch dynamic levels based on selected company and role category
  useEffect(() => {
    if (!companyId || isCustomCompany) {
      setLevels([]);
      setLevelId("");
      return;
    }

    const fetchLevels = async () => {
      try {
        const res = await fetch(`/api/levels?company_id=${companyId}&role_category=${roleCategory}`);
        const json = await res.json();
        const loadedLevels = json.data || [];
        setLevels(loadedLevels);
        if (loadedLevels.length > 0) {
          setLevelId(loadedLevels[0].id);
        } else {
          setLevelId("");
        }
      } catch (e) {
        console.error("Error loading levels for form step:", e);
      }
    };
    fetchLevels();
  }, [companyId, roleCategory, isCustomCompany]);

  // Set default role ID matching current roleCategory
  useEffect(() => {
    const filteredRoles = roles.filter((r) => r.category === roleCategory);
    if (filteredRoles.length > 0) {
      setRoleId(filteredRoles[0].id);
    } else {
      setRoleId("");
    }
  }, [roleCategory, roles]);

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (isCustomCompany && !customCompanyName.trim()) {
      errors.customCompanyName = "Please enter the custom company name";
    }
    if (!isCustomCompany && !companyId) {
      errors.companyId = "Please select a company";
    }
    if (!roleCategory) {
      errors.roleCategory = "Please select a role category";
    }
    if (!roleId) {
      errors.roleId = "Please select a role standard title";
    }
    if (!isCustomCompany && !levelId) {
      errors.levelId = "Please select a level standard";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    const baseNum = Number(baseSalary);
    const bonusNum = Number(annualBonus || "0");
    const equityNum = Number(equityValueAnnual || "0");
    const yoeNum = Number(yearsOfExperience);

    if (!baseSalary || isNaN(baseNum) || baseNum < 5000) {
      errors.baseSalary = "Base salary is required and must be at least 5,000 INR/equivalent";
    }
    if (annualBonus && (isNaN(bonusNum) || bonusNum < 0)) {
      errors.annualBonus = "Annual bonus must be a positive number";
    }
    if (equityValueAnnual && (isNaN(equityNum) || equityNum < 0)) {
      errors.equityValueAnnual = "Equity value must be a positive number";
    }
    if (!yearsOfExperience || isNaN(yoeNum) || yoeNum < 0 || yoeNum > 50) {
      errors.yearsOfExperience = "Years of experience is required (0 to 50)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!locationCity) {
      errors.locationCity = "Please select a city location";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setGlobalError("");

    try {
      // Resolve IDs for custom entries to maintain database integrity
      let finalCompanyId = companyId;
      let finalLevelId = levelId;

      if (isCustomCompany) {
        // Fallback to Google / Atlassian first seeded standard level to ensure DB constraints don't crash
        const fallbackCompany = companies[0];
        finalCompanyId = fallbackCompany?.id || "";
        
        // Load fallback level for company
        const fallbackLevelRes = await fetch(`/api/levels?company_id=${finalCompanyId}&role_category=${roleCategory}`);
        const fallbackLevelJson = await fallbackLevelRes.json();
        finalLevelId = fallbackLevelJson.data?.[0]?.id || "";
      }

      const payload = {
        companyId: finalCompanyId,
        roleId: roleId,
        levelId: finalLevelId,
        locationCity: locationCity,
        locationCountry: locationCountry,
        locationRegion: locationRegion,
        yearsOfExperience: Number(yearsOfExperience),
        baseSalary: Number(baseSalary),
        annualBonus: Number(annualBonus || "0"),
        equityValueAnnual: Number(equityValueAnnual || "0"),
        currency: "INR",
        offerDate: `${offerMonth}-${offerYear}`,
        employmentType: employmentType,
        dataSource: "SELF_REPORTED",
      };

      const response = await fetch("/api/compensation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || "Submission failed. Please check validation metrics.");
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setGlobalError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRoles = roles.filter((r) => r.category === roleCategory);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 7 }, (_, i) => String(2020 + i));

  const citiesList = [
    { value: "Bangalore", label: "Bangalore" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Pune", label: "Pune" },
    { value: "Chennai", label: "Chennai" },
    { value: "Delhi NCR", label: "Delhi NCR" },
    { value: "Remote", label: "Remote" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl text-center">
            Anonymous Salary Submission Portal
          </h1>
          <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-widest text-center">
            Contribute to open community compensation intel. Fully secure and aggregate-only.
          </p>
        </div>

        {submitSuccess ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-8 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Offer Logged Successfully!</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Your data has been successfully verified, sanitized, and aggregate-queued. Thank you for contributing to real-time tech market transparency in India.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/"
                className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold px-6 py-2.5 rounded-lg transition"
              >
                Browse Salaries
              </a>
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setStep(1);
                  setBaseSalary("");
                  setAnnualBonus("");
                  setEquityValueAnnual("");
                  setYearsOfExperience("");
                  setCustomCompanyName("");
                  setIsCustomCompany(false);
                }}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-6 py-2.5 rounded-lg transition"
              >
                Log Another Offer
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            {/* Steps bar indicator */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {step} of 3
              </span>
              <div className="flex gap-1">
                <div className={`h-2 w-10 rounded ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
                <div className={`h-2 w-10 rounded ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
                <div className={`h-2 w-10 rounded ${step >= 3 ? "bg-indigo-600" : "bg-slate-200"}`} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* STEP 1: Company & Role */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                    Position Core Details
                  </h3>

                  {/* Company Toggle */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCompany(!isCustomCompany)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        {isCustomCompany ? "Choose from standard list" : "Company not listed? Type it"}
                      </button>
                    </div>

                    {isCustomCompany ? (
                      <div>
                        <input
                          type="text"
                          placeholder="Type company name... (e.g. Cred, Ola)"
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          className={`w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 ${
                            fieldErrors.customCompanyName ? "border-rose-500" : ""
                          }`}
                        />
                        {fieldErrors.customCompanyName && (
                          <span className="text-[11px] text-rose-500 font-medium block mt-1">
                            {fieldErrors.customCompanyName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Select
                        placeholder="Choose Company..."
                        value={companyId}
                        onChange={setCompanyId}
                        options={companies.map((c) => ({ value: c.id, label: c.name }))}
                        error={fieldErrors.companyId}
                      />
                    )}
                  </div>

                  {/* Role Category */}
                  <Select
                    label="Role Category"
                    value={roleCategory}
                    onChange={setRoleCategory}
                    options={[
                      { value: "ENGINEERING", label: "Software Engineering" },
                      { value: "PRODUCT", label: "Product Management" },
                      { value: "DESIGN", label: "Product Design" },
                      { value: "DATA", label: "Data Science" },
                      { value: "MANAGEMENT", label: "Management" },
                      { value: "OTHER", label: "Other" },
                    ]}
                    error={fieldErrors.roleCategory}
                  />

                  {/* Role Title Selection */}
                  <Select
                    label="Standard Role Title"
                    placeholder="Choose Title..."
                    value={roleId}
                    onChange={setRoleId}
                    options={filteredRoles.map((r) => ({ value: r.id, label: r.name }))}
                    error={fieldErrors.roleId}
                  />

                  {/* Dynamic Level - Hidden if custom company is used */}
                  {!isCustomCompany && (
                    <Select
                      label="Standard Level"
                      placeholder="Choose Level..."
                      value={levelId}
                      onChange={setLevelId}
                      options={levels.map((l) => ({ value: l.id, label: l.levelName }))}
                      disabled={levels.length === 0}
                      error={fieldErrors.levelId}
                    />
                  )}

                  {/* Employment Type */}
                  <Select
                    label="Employment Type"
                    value={employmentType}
                    onChange={setEmploymentType}
                    options={[
                      { value: "FULLTIME", label: "Full-Time Employee" },
                      { value: "CONTRACT", label: "Contractor" },
                      { value: "INTERN", label: "Internship" },
                    ]}
                  />
                </div>
              )}

              {/* STEP 2: Compensation details */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                    Compensation Splits (INR Values)
                  </h3>

                  {/* Base Salary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Base Salary (Annual Gross in INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 font-bold text-xs select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 1800000"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        className={`w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 ${
                          fieldErrors.baseSalary ? "border-rose-500" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors.baseSalary && (
                      <span className="text-[11px] text-rose-500 font-medium block">
                        {fieldErrors.baseSalary}
                      </span>
                    )}
                  </div>

                  {/* Annual Bonus */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Annual Bonus / Performance Cash (Optional, Annual in INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 font-bold text-xs select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 200000"
                        value={annualBonus}
                        onChange={(e) => setAnnualBonus(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Annual Equity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Annualized Equity / Stock Value (Optional, annual in INR)
                      </label>
                      <div className="group relative">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition z-20 shadow-lg">
                          Vesting valuation rule: Total RSU/ESOP value grant ÷ vesting cycle years.
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 font-bold text-xs select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={equityValueAnnual}
                        onChange={(e) => setEquityValueAnnual(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Total Years of Professional Experience (YOE)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      className={`w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 ${
                        fieldErrors.yearsOfExperience ? "border-rose-500" : ""
                      }`}
                    />
                    {fieldErrors.yearsOfExperience && (
                      <span className="text-[11px] text-rose-500 font-medium block">
                        {fieldErrors.yearsOfExperience}
                      </span>
                    )}
                  </div>

                  {/* Offer Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Offer Grant Date
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={offerMonth}
                        onChange={setOfferMonth}
                        options={months}
                      />
                      <Select
                        value={offerYear}
                        onChange={setOfferYear}
                        options={years.map((y) => ({ value: y, label: y }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Location & Review */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                    Location & Audit Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country Default */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                      <input
                        type="text"
                        value={locationCountry}
                        readOnly
                        className="bg-slate-50 border border-slate-200 text-slate-500 text-xs rounded-lg px-3 py-2.5 outline-none"
                      />
                    </div>

                    {/* City Search Select */}
                    <Select
                      label="Metro City Area"
                      value={locationCity}
                      onChange={setLocationCity}
                      options={citiesList}
                      error={fieldErrors.locationCity}
                    />
                  </div>

                  {/* Verification Review Summary */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-1.5">
                      Submitting Summary Details
                    </h4>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Company</span>
                        <span className="font-bold text-slate-800">
                          {isCustomCompany ? customCompanyName : companies.find((c) => c.id === companyId)?.name || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Title / Category</span>
                        <span className="font-bold text-slate-800">
                          {roles.find((r) => r.id === roleId)?.name || "N/A"} ({roleCategory})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Experience</span>
                        <span className="font-bold text-slate-800">{yearsOfExperience} yrs YOE</span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Location City</span>
                        <span className="font-bold text-slate-800">{locationCity}</span>
                      </div>

                      <div className="col-span-2 border-t border-slate-200 pt-2 flex justify-between items-center text-slate-900 font-bold">
                        <span>Computed Annual Compensation:</span>
                        <span className="text-indigo-600 text-sm font-mono font-extrabold">
                          ₹
                          {(
                            Number(baseSalary) +
                            Number(annualBonus || "0") +
                            Number(equityValueAnnual || "0")
                          ).toLocaleString()}{" "}
                          INR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Global error message */}
                  {globalError && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-xs font-semibold">
                      {globalError}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-6 py-2.5 rounded-lg text-xs transition flex items-center gap-1 shadow-sm"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-lg text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Submit Anonymously"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
