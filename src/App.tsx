/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Briefcase,
  MapPin,
  Sparkles,
  Share2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  SlidersHorizontal,
  Layers,
  Download,
  Scale,
  PlusCircle,
  Search,
  Building,
  Check,
  ExternalLink,
  ShieldCheck,
  Award,
  Copy,
  Info,
  Lock,
  User,
  LogOut,
  Key,
  Menu,
  X
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

import { RoleType, CompanyTier, CompensationRecord, LevelMapping, LocationInfo, Offer, AIAdvisorResponse } from "./types.ts";
import { formatINR } from "./lib/utils.ts";
import { getPasswordStrength } from "./lib/auth-utils.ts";
import ProfilePage from "./components/profile/ProfilePage.tsx";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function CompanyLogo({ name, className = "" }: { name: string; className?: string }) {
  const cleanName = name.trim().toLowerCase();
  
  // Choose beautiful matching gradient sets
  let bgGradient = "from-slate-700 via-slate-800 to-slate-950";
  let textStyle = "text-teal-300 font-bold";
  let borderStyle = "border-slate-700/60";
  let glowColor = "shadow-slate-500/5";

  if (cleanName.includes("google")) {
    bgGradient = "from-blue-600 via-red-500 to-yellow-500";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-blue-500/30";
    glowColor = "shadow-blue-500/10";
  } else if (cleanName.includes("meta") || cleanName.includes("facebook")) {
    bgGradient = "from-blue-600 to-indigo-700";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-blue-500/30";
    glowColor = "shadow-blue-500/15";
  } else if (cleanName.includes("amazon")) {
    bgGradient = "from-orange-500 to-amber-600";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-orange-500/30";
    glowColor = "shadow-orange-500/15";
  } else if (cleanName.includes("microsoft")) {
    bgGradient = "from-sky-500 to-emerald-600";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-sky-500/30";
    glowColor = "shadow-sky-500/15";
  } else if (cleanName.includes("apple")) {
    bgGradient = "from-zinc-400 to-zinc-700";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-zinc-500/30";
    glowColor = "shadow-zinc-500/10";
  } else if (cleanName.includes("netflix")) {
    bgGradient = "from-red-600 to-stone-900";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-red-500/30";
    glowColor = "shadow-red-500/15";
  } else if (cleanName.includes("flipkart")) {
    bgGradient = "from-blue-500 to-amber-500";
    textStyle = "text-white font-extrabold";
    borderStyle = "border-blue-400/30";
    glowColor = "shadow-blue-400/10";
  } else {
    const code = (cleanName.charCodeAt(0) || 0) % 5;
    if (code === 0) {
      bgGradient = "from-teal-500 to-emerald-700";
      textStyle = "text-white font-bold";
      borderStyle = "border-teal-500/20";
    } else if (code === 1) {
      bgGradient = "from-indigo-500 to-purple-700";
      textStyle = "text-white font-bold";
      borderStyle = "border-indigo-500/20";
    } else if (code === 2) {
      bgGradient = "from-rose-500 to-pink-600";
      textStyle = "text-white font-bold";
      borderStyle = "border-rose-500/20";
    } else if (code === 3) {
      bgGradient = "from-amber-500 to-orange-600";
      textStyle = "text-white font-bold";
      borderStyle = "border-amber-500/20";
    } else {
      bgGradient = "from-cyan-500 to-blue-600";
      textStyle = "text-white font-bold";
      borderStyle = "border-cyan-500/20";
    }
  }

  return (
    <div className={`rounded-xl bg-gradient-to-tr ${bgGradient} border ${borderStyle} ${textStyle} flex items-center justify-center shadow-sm ${glowColor} shrink-0 relative ${className}`}>
      <span className="tracking-tight select-none uppercase font-sans font-black">
        {name.slice(0, 2)}
      </span>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-xl" />
    </div>
  );
}

function TierBadge({ tier, className = "" }: { tier: CompanyTier | string; className?: string }) {
  const cleanTier = String(tier).toLowerCase();
  let bg = "bg-slate-100 text-slate-600 border-slate-200/60";
  let label = "Tier 3";
  let dotColor = "bg-slate-400";

  if (cleanTier.includes("tier 1") || cleanTier.includes("tier1")) {
    bg = "bg-amber-500/10 text-amber-700 border-amber-500/20";
    label = "Tier 1";
    dotColor = "bg-amber-500";
  } else if (cleanTier.includes("tier 2") || cleanTier.includes("tier2")) {
    bg = "bg-indigo-50 text-indigo-700 border-indigo-200";
    label = "Tier 2";
    dotColor = "bg-indigo-500";
  } else {
    bg = "bg-slate-100 text-slate-600 border-slate-200";
    label = "Tier 3";
    dotColor = "bg-slate-500";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold tracking-wide uppercase border ${bg} ${className}`}>
      <span className={`h-1 w-1 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

type AuthUserShape = {
  email: string;
  token: string;
  user?: {
    email: string;
    name?: string | null;
    isAdmin?: boolean;
    profileCompleted?: boolean;
    currentJobTitle?: string | null;
    experienceYears?: number | null;
    companyName?: string | null;
    country?: string | null;
    preferredCurrency?: string | null;
    expectedSalary?: number | null;
    preferredLocation?: string | null;
  };
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "levels" | "evaluator" | "advisor" | "share" | "profile">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Global Metadata States loaded from backend
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [levelMatrices, setLevelMatrices] = useState<LevelMapping[]>([]);
  const [compensations, setCompensations] = useState<CompensationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Submit Salary Form State
  const [submitForm, setSubmitForm] = useState({
    companyName: "",
    tier: CompanyTier.TIER_3,
    role: RoleType.SOFTWARE_ENGINEER,
    levelCode: "",
    standardLevel: "L3",
    baseSalary: 2200000,
    bonus: 300000,
    equity: 400000,
    location: "Bangalore, IN",
    yearsOfExperience: 5,
    yearsAtCompany: 2,
  });
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User Session & Authentication States
  const [user, setUser] = useState<AuthUserShape | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authName, setAuthName] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    currentJobTitle: "",
    experienceYears: "",
    companyName: "",
    country: "",
    preferredCurrency: "INR",
    expectedSalary: "",
    preferredLocation: "",
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [guestLimitMessage, setGuestLimitMessage] = useState<string | null>(null);
  const [guestAdvisorUses, setGuestAdvisorUses] = useState<number>(0);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || "";

  // Trending Roles State
  const [trendingRoles, setTrendingRoles] = useState<{ role: string; views: number; change: string }[]>([]);

  // Offer Comparison State
  const [offerA, setOfferA] = useState<Offer>({
    id: "offer-a",
    name: "Offer A",
    companyName: "Google",
    role: RoleType.SOFTWARE_ENGINEER,
    levelCode: "L4",
    baseSalary: 3000000,
    bonus: 400000,
    equity: 1000000,
  });
  const [offerLocationA, setOfferLocationA] = useState<string>("Bangalore, IN");

  const [offerB, setOfferB] = useState<Offer>({
    id: "offer-b",
    name: "Offer B",
    companyName: "Meta",
    role: RoleType.SOFTWARE_ENGINEER,
    levelCode: "E4",
    baseSalary: 3200000,
    bonus: 450000,
    equity: 1200000,
  });
  const [offerLocationB, setOfferLocationB] = useState<string>("Mumbai, IN");

  // Selected Level for interactive level details
  const [selectedMatrixLevel, setSelectedMatrixLevel] = useState<string>("L3");

  // Selected Chart Item for payment distribution spectrum modal
  const [selectedChartItem, setSelectedChartItem] = useState<CompensationRecord | null>(null);

  // AI Advisor State
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<AIAdvisorResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const persistUserSession = (storedUser: AuthUserShape, remember: boolean) => {
    setUser(storedUser);
    setIsGuestMode(false);
    setGuestLimitMessage(null);
    if (remember) {
      localStorage.setItem("compintel_user", JSON.stringify(storedUser));
      sessionStorage.removeItem("compintel_user");
    } else {
      sessionStorage.setItem("compintel_user", JSON.stringify(storedUser));
      localStorage.removeItem("compintel_user");
    }
  };

  const openAuthModal = (mode: "login" | "register" | "forgot" = "login") => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleProfileSubmit = async (skip = false) => {
    if (!user?.token) return;

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(skip ? { skip: true } : { ...profileForm, experienceYears: profileForm.experienceYears ? Number(profileForm.experienceYears) : null, expectedSalary: profileForm.expectedSalary ? Number(profileForm.expectedSalary) : null }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = user ? {
          ...user,
          user: {
            ...(user.user || {}),
            ...data.user,
            profileCompleted: data.user.profileCompleted,
          },
        } : user;

        setUser(updatedUser);
        if (updatedUser) {
          const remember = Boolean(localStorage.getItem("compintel_user"));
          if (remember) {
            localStorage.setItem("compintel_user", JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem("compintel_user", JSON.stringify(updatedUser));
          }
        }
        setShowProfileCompletion(false);
        setAuthSuccess(data.message || "Profile updated.");
      } else {
        setAuthError(data.error || "Unable to save your profile right now.");
      }
    } catch (err) {
      setAuthError("Unable to save your profile right now.");
    }
  };

  const requireAccountForAction = (message: string) => {
    setGuestLimitMessage(message);
    setAuthError(null);
    setAuthSuccess(null);
    openAuthModal("login");
    return false;
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setAuthError("Google sign-in was canceled.");
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();

      if (res.ok) {
        persistUserSession({ token: data.token, user: data.user, email: data.user.email }, rememberMe);
        setAuthModalOpen(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthName("");
        setAuthSuccess(data.message || "Signed in with Google successfully.");
      } else {
        setAuthError(data.error || "Google sign-in failed.");
      }
    } catch (error) {
      setAuthError("Google sign-in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleError = () => {
    setAuthError("Google sign-in failed. Please try again.");
  };

  // Fetch initial system metrics & metadata from Express
  useEffect(() => {
    async function loadSystemData() {
      try {
        setIsLoading(true);
        const [compRes, levelRes, locRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/compensations`),
          fetch(`${API_BASE_URL}/api/levels`),
          fetch(`${API_BASE_URL}/api/locations`)
        ]);

        if (compRes.ok && levelRes.ok && locRes.ok) {
          const comps = await compRes.json();
          const levels = await levelRes.json();
          const locs = await locRes.json();

          setCompensations(comps);
          setLevelMatrices(levels);
          setLocations(locs);
        }
      } catch (err) {
        console.error("Failed to seed initial dashboard assets", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSystemData();
  }, []);

  // Load user session on init, fetch trending roles
  useEffect(() => {
    const stored = localStorage.getItem("compintel_user");
    const sessionStorageUser = sessionStorage.getItem("compintel_user");
    const savedUser = stored || sessionStorageUser;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("compintel_user");
        sessionStorage.removeItem("compintel_user");
      }
    }

    const shouldOpenProfile = localStorage.getItem("compintel_profile_redirect") || sessionStorage.getItem("compintel_profile_redirect");
    if (shouldOpenProfile) {
      setActiveTab("profile");
      localStorage.removeItem("compintel_profile_redirect");
      sessionStorage.removeItem("compintel_profile_redirect");
    }

    // Fetch trending roles and normalize to the requested priority list
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => {
        const preferredOrder = ["Software Engineer", "Data Engineer", "DevOps Engineer", "Cybersecurity Engineer"];
        const normalized = data
          .filter((item: { role: string; views: number; change: string }) => preferredOrder.includes(item.role))
          .sort((a: { role: string; views: number; change: string }, b: { role: string; views: number; change: string }) =>
            preferredOrder.indexOf(a.role) - preferredOrder.indexOf(b.role)
          );
        setTrendingRoles(normalized);
      })
      .catch(err => console.error("Error loading trending roles:", err));
  }, []);

  // Track role view dynamically when a user filters by a role
  useEffect(() => {
    if (selectedRole) {
      fetch("/api/trending/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole })
      })
      .then(() => {
        fetch("/api/trending")
          .then(res => res.json())
          .then(data => {
            const preferredOrder = ["Software Engineer", "Data Engineer", "DevOps Engineer", "Cybersecurity Engineer"];
            const normalized = data
              .filter((item: { role: string; views: number; change: string }) => preferredOrder.includes(item.role))
              .sort((a: { role: string; views: number; change: string }, b: { role: string; views: number; change: string }) =>
                preferredOrder.indexOf(a.role) - preferredOrder.indexOf(b.role)
              );
            setTrendingRoles(normalized);
          });
      })
      .catch(err => console.error("Error tracking view:", err));
    }
  }, [selectedRole]);

  // Live filter results
  const filteredCompensations = compensations.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.levelCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === null || item.role === selectedRole;
    const matchesLevel = selectedLevel === "" || item.standardLevel === selectedLevel;
    const matchesLocation = selectedLocation === "" || item.location === selectedLocation;

    return matchesSearch && matchesRole && matchesLevel && matchesLocation;
  });

  // Calculate high-level stats for the dashboard
  const totalCompSum = filteredCompensations.reduce((acc, curr) => acc + curr.totalCompensation, 0);
  const averageTotalComp = filteredCompensations.length > 0 ? Math.round(totalCompSum / filteredCompensations.length) : 0;

  const baseSum = filteredCompensations.reduce((acc, curr) => acc + curr.baseSalary, 0);
  const averageBase = filteredCompensations.length > 0 ? Math.round(baseSum / filteredCompensations.length) : 0;

  const bonusSum = filteredCompensations.reduce((acc, curr) => acc + curr.bonus, 0);
  const averageBonus = filteredCompensations.length > 0 ? Math.round(bonusSum / filteredCompensations.length) : 0;

  const equitySum = filteredCompensations.reduce((acc, curr) => acc + curr.equity, 0);
  const averageEquity = filteredCompensations.length > 0 ? Math.round(equitySum / filteredCompensations.length) : 0;

  // Level Matrix Statistics calculation helper
  const getLevelStats = (lvl: string) => {
    const levelRecords = compensations.filter((item) => item.standardLevel === lvl);
    if (levelRecords.length === 0) return { avgBase: 0, avgBonus: 0, avgEquity: 0, avgTotal: 0, count: 0 };
    const base = Math.round(levelRecords.reduce((acc, curr) => acc + curr.baseSalary, 0) / levelRecords.length);
    const bonus = Math.round(levelRecords.reduce((acc, curr) => acc + curr.bonus, 0) / levelRecords.length);
    const equity = Math.round(levelRecords.reduce((acc, curr) => acc + curr.equity, 0) / levelRecords.length);
    return {
      avgBase: base,
      avgBonus: bonus,
      avgEquity: equity,
      avgTotal: base + bonus + equity,
      count: levelRecords.length,
    };
  };

  const selectedLevelStats = getLevelStats(selectedMatrixLevel);

  const totalCompensation = submitForm.baseSalary + submitForm.bonus + submitForm.equity;

  const compensationBreakdown = [
    { label: "Base", value: submitForm.baseSalary, width: totalCompensation > 0 ? Math.min(100, (submitForm.baseSalary / totalCompensation) * 100) : 0, color: "bg-slate-900" },
    { label: "Bonus", value: submitForm.bonus, width: totalCompensation > 0 ? Math.min(100, (submitForm.bonus / totalCompensation) * 100) : 0, color: "bg-blue-500" },
    { label: "Stock", value: submitForm.equity, width: totalCompensation > 0 ? Math.min(100, (submitForm.equity / totalCompensation) * 100) : 0, color: "bg-teal-500" },
  ];

  const experienceBands: Record<string, [number, number]> = {
    L1: [0, 2],
    L2: [2, 4],
    L3: [4, 7],
    L4: [7, 10],
    L5: [10, 15],
    L6: [15, 20],
    L7: [20, 25],
    L8: [25, 35],
  };

  const benchmarkStats = getLevelStats(submitForm.standardLevel || "L3");
  const expectedExperience = experienceBands[submitForm.standardLevel] ?? [0, 99];
  const experienceMatchesLevel = submitForm.yearsOfExperience >= expectedExperience[0] && submitForm.yearsOfExperience <= expectedExperience[1];
  const expectedTotalRange = {
    min: benchmarkStats.count > 0 ? Math.round(benchmarkStats.avgTotal * 0.65) : 0,
    max: benchmarkStats.count > 0 ? Math.round(benchmarkStats.avgTotal * 1.4) : 0,
  };
  const compensationWithinExpectedRange = expectedTotalRange.min === 0 && expectedTotalRange.max === 0
    ? true
    : totalCompensation >= expectedTotalRange.min && totalCompensation <= expectedTotalRange.max;
  const bonusUnusuallyHigh = submitForm.bonus > 0 && (submitForm.bonus > submitForm.baseSalary * 0.5 || submitForm.bonus > (benchmarkStats.avgBonus || 0) * 1.6);

  const progressSteps = [
    { label: "Company", done: Boolean(submitForm.companyName.trim()) },
    { label: "Role", done: Boolean(submitForm.role) },
    { label: "Compensation", done: submitForm.baseSalary > 0 && submitForm.bonus >= 0 && submitForm.equity >= 0 },
    { label: "Experience", done: submitForm.yearsOfExperience > 0 },
    { label: "Ready to Submit", done: submitForm.companyName.trim() && submitForm.role && submitForm.baseSalary > 0 && submitForm.yearsOfExperience > 0 },
  ];

  const progressPercentage = Math.round((progressSteps.filter((step) => step.done).length / progressSteps.length) * 100);

  let confidenceScore = 25;
  if (submitForm.companyName.trim()) confidenceScore += 10;
  if (submitForm.role) confidenceScore += 10;
  if (submitForm.levelCode.trim()) confidenceScore += 10;
  if (submitForm.standardLevel) confidenceScore += 10;
  if (compensationWithinExpectedRange) confidenceScore += 15;
  if (experienceMatchesLevel) confidenceScore += 10;
  if (!bonusUnusuallyHigh) confidenceScore += 10;
  const overallConfidence = Math.min(100, Math.max(0, confidenceScore));
  const verifiedProbability = Math.round(Math.max(10, Math.min(100, overallConfidence)));

  // Submit salary post function
  const handleSalarySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (isGuestMode) {
      setFormFeedback({ type: "error", message: "Guest mode can compare offers and request one negotiation email. Sign up to save reports, upload files, export reports, or access your history." });
      return;
    }

    // Dynamic warning validations
    if (!submitForm.companyName.trim()) {
      setFormFeedback({ type: "error", message: "Company name cannot be blank." });
      return;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      const response = await fetch("/api/compensations", {
        method: "POST",
        headers,
        body: JSON.stringify(submitForm),
      });

      if (response.ok) {
        const newRecord = await response.json();
        setCompensations([newRecord, ...compensations]);
        setFormFeedback({
          type: "success",
          message: `Successfully posted ${newRecord.companyName} salary record! Statistical vetting complete.`
        });
        // reset fields
        setSubmitForm({
          ...submitForm,
          companyName: "",
          levelCode: "",
          baseSalary: 120000,
          bonus: 15000,
          equity: 20000,
        });
        // redirect
        setTimeout(() => {
          setActiveTab("dashboard");
          setFormFeedback(null);
        }, 1500);
      } else {
        const errData = await response.json();
        setFormFeedback({ type: "error", message: errData.error || "Submission failed" });
      }
    } catch (err) {
      setFormFeedback({ type: "error", message: "Server communication failed." });
    }
  };

  // Run AI negotiation advisory call
  const triggerAICoach = async () => {
    if (isGuestMode && guestAdvisorUses >= 1) {
      setAiError("Guest mode allows one AI negotiation email. Sign up to keep using the advisor and unlock saved history.");
      return;
    }

    setAiLoading(true);
    setAiResponse(null);
    setAiError(null);
    try {
      const activeStats = getLevelStats(offerA.levelCode || "L3");
      const reqPayload = {
        currentOffer: offerA,
        competingOffer: offerB,
        marketStats: {
          role: offerA.role,
          level: offerA.levelCode,
          avgTotalComp: activeStats.avgTotal,
          highestTotalComp: Math.max(...compensations.map(c => c.totalCompensation), 500000),
        },
        userQuery: aiQuery || `Provide a tailored salary negotiation strategy evaluating Offer A (${offerA.companyName}) against Offer B (${offerB.companyName}).`
      };

      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload),
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok) {
        if (contentType.includes("application/json")) {
          const result = await res.json();
          setAiResponse(result);
          if (isGuestMode) {
            setGuestAdvisorUses((value) => value + 1);
            setGuestLimitMessage("Guest mode allows one AI negotiation email. Create an account to save your report and unlock more actions.");
          }
        } else {
          const text = await res.text();
          if (text.startsWith("<!doctype html>") || text.startsWith("<html")) {
            throw new Error("The API returned an HTML page (likely a 404 falling back to client-side routing). Please make sure the backend dev server is running on Port 3000.");
          } else {
            throw new Error("The API returned non-JSON data: " + text.slice(0, 150));
          }
        }
      } else {
        if (contentType.includes("application/json")) {
          const errJson = await res.json();
          throw new Error(errJson.error || `Server responded with status ${res.status}`);
        } else {
          const errorText = await res.text();
          throw new Error(errorText || `Server responded with status ${res.status}`);
        }
      }
    } catch (err: any) {
      console.error("Failed contacting advisor server endpoint", err);
      setAiError(err.message || "An unexpected error occurred while communicating with the AI advisor.");
    } finally {
      setAiLoading(false);
    }
  };

  // Copy draft to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Exporter to CSV
  const exportToCSV = () => {
    if (isGuestMode) {
      requireAccountForAction("Sign up to export reports and keep your data with you.");
      return;
    }

    const headers = "id,Company,Tier,Role,Level,BaseSalary,Bonus,Equity,TotalComp,Location,YOE,Verified\n";
    const rows = filteredCompensations.map(c => 
      `${c.id},"${c.companyName}","${c.tier}","${c.role}","${c.levelCode}",${c.baseSalary},${c.bonus},${c.equity},${c.totalCompensation},"${c.location}",${c.yearsOfExperience},${c.verified}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compensation_intelligence_export_${Date.now()}.csv`;
    link.click();
  };

  // Calculate location-adjusted offer metrics
  const getLocationMultiplier = (locName: string) => {
    const match = locations.find(l => l.name === locName);
    return match ? match.multiplier : 1.0;
  };

  const getCOLIndex = (locName: string) => {
    const match = locations.find(l => l.name === locName);
    return match ? match.costOfLivingIndex : 100;
  };

  const colA = getCOLIndex(offerLocationA);
  const colB = getCOLIndex(offerLocationB);

  const rawTotalA = offerA.baseSalary + offerA.bonus + offerA.equity;
  const rawTotalB = offerB.baseSalary + offerB.bonus + offerB.equity;

  // Adjustment logic based on cost of living indexes
  const normalizedTotalA = Math.round(rawTotalA * (100 / colA));
  const normalizedTotalB = Math.round(rawTotalB * (100 / colB));

  // Visual chart arrays pre-formatted
  const chartData = filteredCompensations.slice(0, 8).map(item => ({
    name: `${item.companyName} (${item.levelCode})`,
    Base: item.baseSalary,
    Bonus: item.bonus,
    Equity: item.equity,
    rawItem: item,
  })).reverse();

  // Dynamic top stats metrics
  const verifiedComps = compensations.filter(c => c.verified);
  const highestTC = verifiedComps.length > 0 
    ? Math.max(...verifiedComps.map(c => c.totalCompensation)) 
    : 9000000; // 90L fallback

  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const medianTC = verifiedComps.length > 0
    ? getMedian(verifiedComps.map(c => c.totalCompensation))
    : 4200000; // 42L fallback

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER SECTION */}
      <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-teal-400 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-teal-500/20 text-slate-900">
              <TrendingUp className="h-6 w-6 stroke-[2.5]" id="app-logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  CompIntel
                </h1>
              </div>
              <p className="text-xs text-slate-400">Compensation Intelligence System</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
            <div className="px-3 py-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Verified Submissions</span>
              <span className="text-sm font-mono font-bold text-teal-400">{compensations.length} entries</span>
            </div>
            <div className="border-l border-slate-700/80 h-8 hidden sm:block"></div>
            <div className="px-3 py-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Median Total Comp</span>
              <span className="text-sm font-mono font-bold text-white">{formatINR(medianTC)}</span>
            </div>
            <div className="border-l border-slate-700/80 h-8 hidden sm:block"></div>
            <div className="px-3 py-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Highest Verified TC</span>
              <span className="text-sm font-mono font-bold text-indigo-400">{formatINR(highestTC)}</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION BAR */}
        <div className="border-t border-b border-slate-800 bg-slate-950/45 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-stretch md:items-center min-h-[56px]">
            
            {/* Mobile Header: Hamburger */}
            <div className="flex md:hidden items-center justify-between py-3 border-b border-slate-800/50">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-stretch md:items-center justify-between flex-1 gap-1 md:gap-2 w-full py-2 md:py-0 md:h-14 md:-mb-[1px] md:px-2 lg:px-6`}>
              {[
                { id: "dashboard", label: "Salary Dashboard", icon: Briefcase },
                { id: "levels", label: "Standardized Level Grid", icon: Layers },
                { id: "evaluator", label: "Offer Evaluator & COL", icon: Scale },
                { id: "advisor", label: "AI Negotiator Coach", icon: Sparkles },
                { id: "share", label: "Anonymous Salary Share", icon: Share2 },
                { id: "profile", label: "Profile", icon: User }
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-2 py-2.5 md:py-0 md:h-full text-[11px] lg:text-xs font-semibold border-l-2 md:border-l-0 md:border-b-2 transition-all duration-200 cursor-pointer md:flex-1 md:basis-0 min-w-0 rounded-none text-center ${
                      activeTab === tab.id
                        ? "border-teal-400 text-teal-400 bg-slate-900/60 font-bold shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <TabIcon className="h-4 w-4 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 shrink-0" />
                    <span className="leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* AUTH SECTION */}
            <div className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-stretch md:items-center justify-start md:justify-end gap-3 shrink-0 pb-4 pt-2 md:py-0 border-t border-slate-900 md:border-0 md:h-14`}>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-teal-400 border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 rounded-md shadow-inner">
                    Verified: {user.email}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("compintel_user");
                      sessionStorage.removeItem("compintel_user");
                      setUser(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md border border-rose-500/20 transition-all font-semibold cursor-pointer"
                  >
                    <LogOut className="h-3 w-3 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsGuestMode(true);
                      setGuestLimitMessage("You’re browsing in guest mode. Compare offers and generate one AI negotiation email, then sign up to unlock saved reports, exports, uploads, and history.");
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-600 text-slate-200 rounded-md text-xs font-semibold transition-all hover:bg-slate-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Continue as Guest</span>
                  </button>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-md text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Sign In for Verified Badge</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-slate-300 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Powering Compensation Data Clusters...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB 1: SALARIES DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Aggregated Stats Highlight */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Selected Average Base", value: averageBase, color: "text-slate-900" },
                      { label: "Selected Average Stock/Yr", value: averageEquity, color: "text-indigo-600" },
                      { label: "Selected Average Bonus", value: averageBonus, color: "text-emerald-600" },
                      { label: "Combined Average TC", value: averageTotalComp, color: "text-teal-600", highlight: true }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</span>
                        <span className={`text-2xl font-mono font-bold mt-2 ${stat.color} tracking-tight`}>
                          {stat.value ? formatINR(stat.value) : "—"}
                        </span>
                        <div className={`mt-2 h-1 w-full rounded-full ${stat.highlight ? 'bg-teal-500' : 'bg-slate-100'}`}></div>
                      </div>
                    ))}
                  </div>

                  {guestLimitMessage && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{guestLimitMessage}</span>
                    </div>
                  )}

                  {/* Filtering UX Panel */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">Filters</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex flex-wrap gap-3 w-full lg:w-auto">
                      {/* Search company input */}
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search Company, Tag or Location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-slate-50 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-2.5 w-full sm:w-60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                        />
                      </div>

                      {/* Role Dropdown */}
                      <select
                        value={selectedRole ?? ""}
                        onChange={(e) => setSelectedRole(e.target.value || null)}
                        className="bg-slate-50 text-slate-800 text-xs rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="">All Tech Roles</option>
                        {Object.values(RoleType).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>

                      {/* Standard Level Dropdown */}
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-slate-50 text-slate-800 text-xs rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="">All Levels (L1-L8)</option>
                        <option value="L1">L1 - Entry/Associate</option>
                        <option value="L2">L2 - Mid-level</option>
                        <option value="L3">L3 - Senior</option>
                        <option value="L4">L4 - Staff</option>
                        <option value="L5">L5 - Senior Staff</option>
                        <option value="L6">L6 - Principal</option>
                        <option value="L7">L7 - Distinguished/VP</option>
                        <option value="L8">L8 - Fellow/Exec</option>
                      </select>

                      {/* Location selector */}
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="bg-slate-50 text-slate-800 text-xs rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="">All Global Locations</option>
                        {locations.map((loc) => (
                          <option key={loc.name} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all w-full lg:w-auto justify-center"
                    >
                      <Download className="h-4 w-4" />
                      Export filtered data (CSV)
                    </button>
                  </div>

                  {/* VISUAL CHART SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-teal-500" />
                            Pay Distribution Spectrum (Sample Metrics)
                          </h2>
                          <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Click any bar segment to view complete breakdown</p>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">Normalized to INR/Yr</span>
                      </div>
                      <div className="h-80 md:h-[420px]">
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                              <Tooltip 
                                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                                contentStyle={{ 
                                  fontSize: '11px', 
                                  padding: '5px 8px', 
                                  borderRadius: '8px', 
                                  border: '1px solid #e2e8f0', 
                                  backgroundColor: '#ffffff', 
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                                }}
                                itemStyle={{ padding: '0px', fontSize: '11px' }}
                                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '2px', fontSize: '11px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                              <Bar 
                                dataKey="Base" 
                                fill="#3b82f6" 
                                stackId="a" 
                                name="Base Salary" 
                                className="cursor-pointer"
                                onClick={(data) => {
                                  if (data && data.payload && data.payload.rawItem) {
                                    setSelectedChartItem(data.payload.rawItem);
                                  }
                                }}
                              />
                              <Bar 
                                dataKey="Bonus" 
                                fill="#4ade80" 
                                stackId="a" 
                                name="Annual Bonus" 
                                className="cursor-pointer"
                                onClick={(data) => {
                                  if (data && data.payload && data.payload.rawItem) {
                                    setSelectedChartItem(data.payload.rawItem);
                                  }
                                }}
                              />
                              <Bar 
                                dataKey="Equity" 
                                fill="#94a3b8" 
                                stackId="a" 
                                name="Equity Value" 
                                className="cursor-pointer"
                                onClick={(data) => {
                                  if (data && data.payload && data.payload.rawItem) {
                                    setSelectedChartItem(data.payload.rawItem);
                                  }
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                            No records fit active filter variables to draw breakdown spectra.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
                            <Info className="h-4 w-4 text-indigo-500" />
                            Levels.fyi Standard Level Mapping
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            Our MVP normalizes arbitrary titles to standard Levels <strong>L1 to L8</strong>. This allows comparison mapping, ensuring base and equity benchmarks remain reliable even when job titles mismatch between employers.
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1 flex flex-col justify-center space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Standard L1 equivalent</span>
                            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Google L3 / Amazon L4</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Standard L3 equivalent</span>
                            <span className="font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Google L5 / Meta E5 / Amazon L6</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Standard L4 equivalent</span>
                            <span className="font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">Google L6 / Meta E6 / Amazon L7</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab("levels")}
                          className="mt-4 text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline self-start cursor-pointer"
                        >
                          Explore detailed mapping matrices
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Trending Roles Card */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-teal-500" />
                            Trending Roles This Week
                          </h3>
                          {selectedRole && (
                            <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-semibold text-teal-700 border border-teal-100">
                              Active: {selectedRole}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                          Most visited role dashboards across Indian engineering hubs. Select a role below to filter immediately.
                        </p>
                        <div className="divide-y divide-slate-100 space-y-1">
                          {trendingRoles.map((item, idx) => {
                            const isActive = selectedRole === item.role;
                            return (
                              <button
                                key={item.role}
                                onClick={() => setSelectedRole((current) => (current === item.role ? null : item.role))}
                                aria-pressed={isActive}
                                className={`w-full py-2 flex items-center justify-between text-left rounded-lg px-2 transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-teal-50 border border-teal-100 shadow-sm"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 font-bold font-mono">#{idx + 1}</span>
                                  <span className={`text-xs ${isActive ? "text-teal-800" : "text-slate-700"} font-medium`}>{item.role}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {item.views} views
                                  </span>
                                  <span className="text-[9px] font-bold font-mono text-emerald-600">
                                    {item.change}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBMISSIONS LIST TABLE */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Verified Compensation Submissions</h3>
                        <p className="text-xs text-slate-500">Live feed from verified data streams and unverified self-reports.</p>
                      </div>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full self-start">
                        Showing {filteredCompensations.length} records
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <th className="py-3 px-5">Company / Tier</th>
                            <th className="py-3 px-5">Role & Level</th>
                            <th className="py-3 px-5 text-right">Total Annual Comp</th>
                            <th className="py-3 px-5">Annualized Pay Splits</th>
                            <th className="py-3 px-5">Location</th>
                            <th className="py-3 px-5 text-center">Experience</th>
                            <th className="py-3 px-5 text-right">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredCompensations.length > 0 ? (
                            filteredCompensations.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                                {/* Company badge */}
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-3">
                                    <CompanyLogo name={c.companyName} className="h-8 w-8 text-[11px]" />
                                    <div>
                                      <span className="font-semibold text-slate-800 block">{c.companyName}</span>
                                      <TierBadge tier={c.tier} className="mt-0.5" />
                                    </div>
                                  </div>
                                </td>

                                {/* Role and level mapping */}
                                <td className="py-4 px-5">
                                  <span className="font-semibold text-slate-800 block">{c.role}</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-mono mt-0.5 inline-block">
                                    {c.levelCode} ({c.standardLevel})
                                  </span>
                                </td>

                                {/* TC */}
                                <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                                  {formatINR(c.totalCompensation)}
                                </td>

                                {/* Splits */}
                                <td className="py-4 px-5">
                                  <div className="flex flex-col gap-1 w-44">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-slate-400">Base</span>
                                      <span className="font-mono font-semibold">{formatINR(c.baseSalary)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                                      <div className="bg-slate-700 h-full" style={{ width: `${(c.baseSalary / c.totalCompensation) * 100}%` }}></div>
                                      <div className="bg-emerald-500 h-full" style={{ width: `${(c.bonus / c.totalCompensation) * 100}%` }}></div>
                                      <div className="bg-indigo-500 h-full" style={{ width: `${(c.equity / c.totalCompensation) * 100}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400">
                                      <span>Stock: {formatINR(c.equity)}</span>
                                      <span>Bonus: {formatINR(c.bonus)}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Location */}
                                <td className="py-4 px-5 text-slate-600 font-medium">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{c.location}</span>
                                  </div>
                                </td>

                                {/* YOE */}
                                <td className="py-4 px-5 text-center font-mono font-medium text-slate-700">
                                  {c.yearsOfExperience} yrs
                                </td>

                                {/* Verified Badge */}
                                <td className="py-4 px-5 text-right">
                                  {c.verified ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-100">
                                      <ShieldCheck className="h-3 w-3" />
                                      Verified Offer
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                                      <AlertCircle className="h-3 w-3" />
                                      Self-Reported
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                No compensation entries match the selected filter query limits.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STANDARDIZED LEVEL GRID */}
              {activeTab === "levels" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* MATRIX TABLE */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">Standardized Level Mapping Matrix</h2>
                      <p className="text-[11px] text-slate-500">Cross-company engineering level correlation based on scope, authority, and compensation weight.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <th className="py-2 px-2">Standard Level</th>
                            <th className="py-2 px-2">Standard Title</th>
                            <th className="py-2 px-2 text-teal-600">Google</th>
                            <th className="py-2 px-2 text-indigo-600">Meta</th>
                            <th className="py-2 px-2 text-rose-600">Apple</th>
                            <th className="py-2 px-2 text-amber-600">Amazon</th>
                            <th className="py-2 px-2 text-sky-600">Microsoft</th>
                            <th className="py-2 px-2 text-purple-600">Netflix</th>
                            <th className="py-2 px-2 text-teal-500">Flipkart</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {levelMatrices.map((matrix) => {
                            const isSelected = selectedMatrixLevel === matrix.standardLevel;

                            return (
                              <tr
                                key={matrix.standardLevel}
                                onClick={() => setSelectedMatrixLevel(matrix.standardLevel)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"
                                }`}
                              >
                                <td className={`py-2 px-2 font-mono font-bold text-[11px] ${isSelected ? "text-indigo-700 border-l-2 border-indigo-500" : "text-slate-800"}`}>
                                  {matrix.standardLevel}
                                </td>
                                <td className={`py-2 px-2 font-semibold text-[11px] whitespace-nowrap ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                                  {matrix.title}
                                </td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.google}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.meta}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.apple}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.amazon}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.microsoft}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.netflix}</td>
                                <td className={`py-2 px-2 text-[11px] ${isSelected ? "text-slate-700" : "text-slate-800"}`}>{matrix.flipkart}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LEVEL MARKET SUMMARY */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-800">Level Benchmark Overview</h3>
                      </div>

                      <div className="bg-slate-950 text-white rounded-xl p-4 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Active Level Focus</span>
                        <span className="text-3xl font-mono font-bold text-teal-400">{selectedMatrixLevel}</span>
                        <p className="text-xs text-slate-400">
                          {levelMatrices.find(m => m.standardLevel === selectedMatrixLevel)?.title || ""}
                        </p>
                      </div>

                      <div className="mt-6 space-y-4">
                        <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Estimated Salary Bounds</h4>

                        {selectedLevelStats.count > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                              <span className="text-slate-500">Average Base</span>
                              <span className="font-mono font-bold text-slate-800">{formatINR(selectedLevelStats.avgBase)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                              <span className="text-slate-500">Average Annual Equity</span>
                              <span className="font-mono font-bold text-indigo-600">{formatINR(selectedLevelStats.avgEquity)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                              <span className="text-slate-500">Average Bonus</span>
                              <span className="font-mono font-bold text-emerald-600">{formatINR(selectedLevelStats.avgBonus)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold bg-teal-50 text-teal-900 p-2 rounded-lg">
                              <span>Total Market Average</span>
                              <span className="font-mono font-bold">{formatINR(selectedLevelStats.avgTotal)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-lg p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                            No submissions seeded under level {selectedMatrixLevel} yet. Enter your own anonymously to begin calculations!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-6 text-xs text-slate-500 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Info className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Salary Benchmark Guide</span>
                      </div>
                      <div className="text-[11px] leading-relaxed space-y-2">
                        <div>
                          Salary benchmarks are calculated using verified compensation data submitted by professionals. Each standardized engineering level represents the market average of:
                        </div>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>
                            <strong>Base Salary</strong> – Fixed annual compensation.
                          </li>
                          <li>
                            <strong>Bonus</strong> – Performance-based cash incentives.
                          </li>
                          <li>
                            <strong>Equity</strong> – Company stock grants (RSUs or stock options).
                          </li>
                        </ul>
                        <div>
                          Benchmarks are continuously refined as more verified salary submissions are added, improving their accuracy and reliability.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OFFER EVALUATOR & COL NORMALIZER */}
              {activeTab === "evaluator" && (
                <div className="space-y-6">
                  {/* Explanatory introduction banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-2">
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-indigo-400/20">
                        Evaluator Engine
                      </span>
                      <h2 className="text-xl font-bold tracking-tight">Compare Job Offers & Multiplier Adjustments</h2>
                      <p className="text-xs text-indigo-200 leading-relaxed">
                        A higher absolute salary offer does not always equal higher quality of life. Input two competing compensation structures and adjust location cost indices side-by-side to calculate true domestic purchasing parity.
                      </p>
                    </div>
                    <div className="absolute right-6 bottom-0 opacity-10 pointer-events-none">
                      <Scale className="h-44 w-44 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* INPUTS PANEL A */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="bg-teal-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center font-bold font-mono">1</span>
                          Offer Package Alpha
                        </h3>
                        <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">Primary Target</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company</label>
                          <input
                            type="text"
                            value={offerA.companyName}
                            onChange={(e) => setOfferA({ ...offerA, companyName: e.target.value })}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company Level (Nominal)</label>
                          <input
                            type="text"
                            value={offerA.levelCode}
                            onChange={(e) => setOfferA({ ...offerA, levelCode: e.target.value })}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Base Salary (INR/Yr)</label>
                          <input
                            type="number"
                            value={offerA.baseSalary}
                            onChange={(e) => setOfferA({ ...offerA, baseSalary: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Annual Stock (INR/Yr)</label>
                          <input
                            type="number"
                            value={offerA.equity}
                            onChange={(e) => setOfferA({ ...offerA, equity: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Annual Bonus (INR)</label>
                          <input
                            type="number"
                            value={offerA.bonus}
                            onChange={(e) => setOfferA({ ...offerA, bonus: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Geographical Hub</label>
                          <select
                            value={offerLocationA}
                            onChange={(e) => setOfferLocationA(e.target.value)}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none cursor-pointer"
                          >
                            {locations.map((l) => (
                              <option key={l.name} value={l.name}>{l.name} (Index: {l.costOfLivingIndex})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-slate-500 uppercase">Absolute Annual TC:</span>
                        <span className="text-teal-600 text-sm">{formatINR(rawTotalA)}</span>
                      </div>
                    </div>

                    {/* INPUTS PANEL B */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="bg-indigo-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center font-bold font-mono">2</span>
                          Offer Package Beta
                        </h3>
                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Competitor Target</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company</label>
                          <input
                            type="text"
                            value={offerB.companyName}
                            onChange={(e) => setOfferB({ ...offerB, companyName: e.target.value })}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Company Level (Nominal)</label>
                          <input
                            type="text"
                            value={offerB.levelCode}
                            onChange={(e) => setOfferB({ ...offerB, levelCode: e.target.value })}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Base Salary (INR/Yr)</label>
                          <input
                            type="number"
                            value={offerB.baseSalary}
                            onChange={(e) => setOfferB({ ...offerB, baseSalary: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Annual Stock (INR/Yr)</label>
                          <input
                            type="number"
                            value={offerB.equity}
                            onChange={(e) => setOfferB({ ...offerB, equity: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Annual Bonus (INR)</label>
                          <input
                            type="number"
                            value={offerB.bonus}
                            onChange={(e) => setOfferB({ ...offerB, bonus: Number(e.target.value) || 0 })}
                            className="bg-slate-50 font-mono text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Geographical Hub</label>
                          <select
                            value={offerLocationB}
                            onChange={(e) => setOfferLocationB(e.target.value)}
                            className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none cursor-pointer"
                          >
                            {locations.map((l) => (
                              <option key={l.name} value={l.name}>{l.name} (Index: {l.costOfLivingIndex})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-slate-500 uppercase">Absolute Annual TC:</span>
                        <span className="text-indigo-600 text-sm">{formatINR(rawTotalB)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE ANALYTICS RESULTS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Side-By-Side Purchasing Power Adjustments</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                      {/* STAT 1: PARITY COMPARISON */}
                      <div className="space-y-4">
                        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Adjusted Parity: Alpha</span>
                          <span className="text-2xl font-mono font-bold text-teal-600">{formatINR(normalizedTotalA)}</span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Relative value in normalized standard baseline market index (baseline 100).
                          </p>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Adjusted Parity: Beta</span>
                          <span className="text-2xl font-mono font-bold text-indigo-600">{formatINR(normalizedTotalB)}</span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Relative value in normalized standard baseline market index (baseline 100).
                          </p>
                        </div>
                      </div>

                      {/* STAT 2: DELTA COMPARISON SUMMARY CARD */}
                      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between h-full min-h-[190px]">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-teal-300 block">CompIntel Recommendation</span>
                          <h4 className="text-sm font-semibold leading-snug">Which offer is financially superior?</h4>
                        </div>

                        <div className="my-3 rounded-xl border border-white/10 bg-white/5 p-3">
                          {normalizedTotalA > normalizedTotalB ? (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/15 px-2.5 py-1">
                                <span className="h-2 w-2 rounded-full bg-teal-300" />
                                <span className="text-sm font-semibold text-teal-200">{offerA.companyName}</span>
                                <span className="text-[11px] text-slate-300">wins by parity</span>
                              </div>
                              <p className="text-sm leading-6 text-slate-200">
                                Purchasing power in <span className="font-semibold text-white">{offerLocationA}</span> exceeds <span className="font-semibold text-white">{offerB.companyName}</span>'s in <span className="font-semibold text-white">{offerLocationB}</span> by <span className="font-semibold text-teal-200">{formatINR(normalizedTotalA - normalizedTotalB)}</span>.
                              </p>
                            </div>
                          ) : normalizedTotalB > normalizedTotalA ? (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-400/15 px-2.5 py-1">
                                <span className="h-2 w-2 rounded-full bg-indigo-300" />
                                <span className="text-sm font-semibold text-indigo-200">{offerB.companyName}</span>
                                <span className="text-[11px] text-slate-300">wins by parity</span>
                              </div>
                              <p className="text-sm leading-6 text-slate-200">
                                Purchasing power in <span className="font-semibold text-white">{offerLocationB}</span> exceeds <span className="font-semibold text-white">{offerA.companyName}</span>'s in <span className="font-semibold text-white">{offerLocationA}</span> by <span className="font-semibold text-indigo-200">{formatINR(normalizedTotalB - normalizedTotalA)}</span>.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-300">Offers have equivalent baseline spending indexes.</p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setAiQuery(`Please compare my Google offer at level ${offerA.levelCode} in ${offerLocationA} against my Meta offer at level ${offerB.levelCode} in ${offerLocationB}. How should I negotiate base and equity?`);
                            setActiveTab("advisor");
                          }}
                          className="text-[11px] text-teal-300 font-semibold hover:text-teal-200 flex items-center gap-1.5 mt-1 self-start"
                        >
                          Send offers to AI Negotiation Advisor
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        </button>
                      </div>

                      {/* CHART: SIDE BY SIDE PARITY */}
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: offerA.companyName || "Alpha", Raw: rawTotalA, Adjusted: normalizedTotalA },
                              { name: offerB.companyName || "Beta", Raw: rawTotalB, Adjusted: normalizedTotalB }
                            ]}
                          >
                            <XAxis dataKey="name" fontSize={11} tickLine={false} />
                            <YAxis fontSize={10} tickLine={false} />
                            <Tooltip 
                              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                              contentStyle={{ 
                                fontSize: '11px', 
                                padding: '5px 8px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: '#ffffff', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                              }}
                              itemStyle={{ padding: '0px', fontSize: '11px' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '2px', fontSize: '11px' }}
                            />
                            <Bar dataKey="Raw" fill="#94a3b8" name="Absolute Value" />
                            <Bar dataKey="Adjusted" fill="#14b8a6" name="COL Adjusted" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI NEGOTIATOR COACH */}
              {activeTab === "advisor" && (
                <div className="space-y-6">
                  {/* Explanatory introduction banner */}
                  <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-2">
                      <h2 className="text-xl font-bold tracking-tight">AI Compensation Advisor & Negotiation Coach</h2>
                      <p className="text-xs text-teal-100 leading-relaxed">
                        Input negotiation questions, review vesting risks, or drafts copy-paste messages to recruiters. Pre-populated automatically with the active details from your Offer Evaluator tab!
                      </p>
                    </div>
                    <div className="absolute right-6 bottom-0 opacity-10 pointer-events-none">
                      <Sparkles className="h-44 w-44 text-teal-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT PANEL: CHAT INPUT */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 text-sm">Consultation Assistant</h3>
                        <p className="text-xs text-slate-400">Ask strategic questions about target companies, levels, or drafting counter-offers.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase font-bold block">Preset Negotiation Queries</label>
                        {[
                          "Draft a highly persuasive email asking for $15k more base salary to offset location costs.",
                          "How can I leverage my Google L4 offer to request an E4 sign-on bonus from Meta?",
                          "Analyze the stock vesting cliff and general stock equity dilution risks for early pre-IPO scaleups."
                        ].map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => setAiQuery(preset)}
                            className="w-full text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-[11px] text-slate-600 p-2.5 rounded-lg border border-slate-200 transition-all block font-medium"
                          >
                            "{preset}"
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold block">Custom query instructions</label>
                        <textarea
                          rows={4}
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          placeholder="E.g., I've received an offer for Google L5 in Bangalore. They offered ₹4,500,000 base. How much stock should I ask for to match Mumbai averages adjusted for index cost?"
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 w-full text-xs focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none font-medium resize-none"
                        />
                      </div>

                      <button
                        onClick={triggerAICoach}
                        disabled={aiLoading}
                        className="w-full py-3 px-4 font-bold text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {aiLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                            Analyzing Market Trends...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Analyze & Draft Negotiation
                          </>
                        )}
                      </button>
                    </div>

                    {/* RIGHT PANEL: COMPREHENSIVE RESULT DISPLAY */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 min-h-[400px] flex flex-col justify-between">
                      {aiError ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          {aiError.includes("Groq API key is not configured") ? (
                            <div className="space-y-4 max-w-lg text-left w-full">
                              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-sm font-bold">Groq API Key Required</h4>
                                  <p className="text-xs mt-1 leading-relaxed text-amber-700">
                                    The advisor uses Groq. Add your Groq API key to your app's environment settings or secrets configuration before retrying.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Key className="h-3.5 w-3.5 text-indigo-500" />
                                  How to Get a Groq API Key:
                                </h5>
                                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                                  <li>
                                    Open the <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5">Groq Console <ExternalLink className="h-3 w-3" /></a> and sign in.
                                  </li>
                                  <li>
                                    Click <strong className="text-slate-800">"Create API Key"</strong>.
                                  </li>
                                  <li>
                                    Copy your newly generated API key.
                                  </li>
                                  <li>
                                    In your app's environment settings or secrets configuration, add the key as <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold font-mono text-slate-800">GROQ_API_KEY</code>.
                                  </li>
                                </ol>
                              </div>

                              <div className="flex justify-center pt-2">
                                <button
                                  onClick={triggerAICoach}
                                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                                  Retry with Groq Key
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                                <Info className="h-6 w-6" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-800">Advisory Session Failed</h4>
                              <p className="text-xs text-rose-600 max-w-md mt-2 bg-rose-50 border border-rose-100 p-3 rounded-lg leading-relaxed font-medium">
                                {aiError}
                              </p>
                              <div className="mt-4 text-xs text-slate-500 max-w-sm">
                                Make sure you have added your <strong className="text-slate-700">GROQ_API_KEY</strong> environment variable in your app's secrets or environment configuration.
                              </div>
                              <button
                                onClick={triggerAICoach}
                                className="mt-5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                              >
                                Retry Consultation
                              </button>
                            </>
                          )}
                        </div>
                      ) : aiResponse ? (
                        <div className="space-y-6">
                          {/* 1. Comparison Audit */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Section 1: Comparative Audit & Rating</span>
                            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl text-xs text-teal-900 leading-relaxed whitespace-pre-wrap">
                              {aiResponse.analysis}
                            </div>
                          </div>

                          {/* 2. Strategy Checklist */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Section 2: Tactical Action Plan Checklist</span>
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">
                              {aiResponse.negotiationStrategy}
                            </div>
                          </div>

                          {/* 3. Copiable Recruiter Message */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section 3: Draft Counter-Offer Template</span>
                              <button
                                onClick={() => copyToClipboard(aiResponse.draftMessage)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-all"
                              >
                                {copiedText ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy message
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-y-auto max-h-60 border border-slate-800">
                              {aiResponse.draftMessage}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                          <Sparkles className="h-10 w-10 text-slate-300 mb-3 animate-pulse" />
                          <h4 className="text-sm font-semibold text-slate-700">Consultation Session Idle</h4>
                          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                            Click <strong>"Analyze & Draft"</strong> to consult our AI Compensation Coach. It will audit your packages, formulate tactics, and write a personalized response.
                          </p>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-4 mt-6 flex items-center gap-2 text-[11px] text-slate-400">
                        <Info className="h-3.5 w-3.5 text-indigo-400" />
                        <span>All consultations are stored locally in secure sandboxed session scopes. No external telemetry logs are preserved.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-teal-500/10 p-3">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Your profile</h2>
                      <p className="text-xs text-slate-500">Manage your details, contributions, and career context.</p>
                    </div>
                  </div>
                  <ProfilePage />
                </div>
              )}

              {/* TAB 7: ANONYMOUS SALARY SHARE */}
              {activeTab === "share" && (
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)] gap-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="rounded-2xl bg-blue-500/10 p-3 ring-1 ring-blue-500/10">
                            <Share2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Anonymous Compensation Submission</h2>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed pl-1">
                          Contribute compensation data anonymously to improve market transparency.
                        </p>
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                          <div className="rounded-xl bg-blue-100 p-2">
                            <Lock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-800">Anonymous submission</span>
                            <span className="text-xs text-slate-500">No personal identifiers are stored. Only aggregated statistics are used.</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSalarySubmit} className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_16px_50px_-24px_rgba(37,99,235,0.4)]">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="rounded-2xl bg-slate-100 p-2">
                              <Building className="h-4 w-4 text-slate-600" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Company Information</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Company Name</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Google, Meta, Stripe"
                                value={submitForm.companyName}
                                onChange={(e) => setSubmitForm({ ...submitForm, companyName: e.target.value })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all duration-200"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Company Tier</label>
                              <select
                                value={submitForm.tier}
                                onChange={(e) => setSubmitForm({ ...submitForm, tier: e.target.value as CompanyTier })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none cursor-pointer transition-all duration-200"
                              >
                                {Object.values(CompanyTier).map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Functional Job Role</label>
                              <select
                                value={submitForm.role}
                                onChange={(e) => setSubmitForm({ ...submitForm, role: e.target.value as RoleType })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none cursor-pointer transition-all duration-200"
                              >
                                {Object.values(RoleType).map((role) => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Internal Title</label>
                              <input
                                type="text"
                                placeholder="e.g. SDE II, Senior"
                                value={submitForm.levelCode}
                                onChange={(e) => setSubmitForm({ ...submitForm, levelCode: e.target.value })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all duration-200"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Standardized Level</label>
                              <select
                                value={submitForm.standardLevel}
                                onChange={(e) => setSubmitForm({ ...submitForm, standardLevel: e.target.value })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none cursor-pointer transition-all duration-200"
                              >
                                <option value="L1">L1 - Entry/Assoc</option>
                                <option value="L2">L2 - Mid-Level</option>
                                <option value="L3">L3 - Senior</option>
                                <option value="L4">L4 - Staff</option>
                                <option value="L5">L5 - Senior Staff</option>
                                <option value="L6">L6 - Principal</option>
                                <option value="L7">L7 - Distinguished</option>
                                <option value="L8">L8 - Fellow</option>
                              </select>
                            </div>
                          </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_16px_50px_-24px_rgba(37,99,235,0.4)]">
                          <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl bg-slate-100 p-2">
                                <DollarSign className="h-4 w-4 text-slate-600" />
                              </div>
                              <h3 className="text-base font-semibold text-slate-900">Compensation</h3>
                            </div>
                            <div className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">
                              Live
                            </div>
                          </div>

                          <div className="rounded-3xl bg-slate-900 px-5 py-5 text-white shadow-lg">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">Total Compensation</span>
                            <motion.div
                              key={totalCompensation}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              className="mt-2 text-4xl font-semibold tracking-tight"
                            >
                              {formatINR(totalCompensation)}
                            </motion.div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Base Salary</label>
                              <input
                                type="number"
                                required
                                value={submitForm.baseSalary}
                                onChange={(e) => setSubmitForm({ ...submitForm, baseSalary: Number(e.target.value) || 0 })}
                                className="bg-white text-sm border border-slate-200 rounded-2xl px-3 py-3 w-full focus:ring-2 focus:ring-blue-400 outline-none font-mono font-semibold transition-all duration-200"
                              />
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Annual Bonus</label>
                              <input
                                type="number"
                                required
                                value={submitForm.bonus}
                                onChange={(e) => setSubmitForm({ ...submitForm, bonus: Number(e.target.value) || 0 })}
                                className="bg-white text-sm border border-slate-200 rounded-2xl px-3 py-3 w-full focus:ring-2 focus:ring-blue-400 outline-none font-mono font-semibold transition-all duration-200"
                              />
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Annual Stock</label>
                              <input
                                type="number"
                                required
                                value={submitForm.equity}
                                onChange={(e) => setSubmitForm({ ...submitForm, equity: Number(e.target.value) || 0 })}
                                className="bg-white text-sm border border-slate-200 rounded-2xl px-3 py-3 w-full focus:ring-2 focus:ring-blue-400 outline-none font-mono font-semibold transition-all duration-200"
                              />
                            </div>
                          </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_16px_50px_-24px_rgba(37,99,235,0.4)]">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="rounded-2xl bg-slate-100 p-2">
                              <Briefcase className="h-4 w-4 text-slate-600" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Experience</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Years of Experience</label>
                              <input
                                type="number"
                                value={submitForm.yearsOfExperience}
                                onChange={(e) => setSubmitForm({ ...submitForm, yearsOfExperience: Number(e.target.value) || 0 })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none font-mono transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Years at Company</label>
                              <input
                                type="number"
                                value={submitForm.yearsAtCompany}
                                onChange={(e) => setSubmitForm({ ...submitForm, yearsAtCompany: Number(e.target.value) || 0 })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none font-mono transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 block mb-2">Office Location</label>
                              <select
                                value={submitForm.location}
                                onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                                className="bg-slate-50 text-sm border border-slate-200 rounded-2xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none cursor-pointer transition-all duration-200"
                              >
                                {locations.map((l) => (
                                  <option key={l.name} value={l.name}>{l.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </section>

                        <div className="md:sticky md:bottom-6 pt-2">
                          <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-2xl shadow-[0_10px_30px_-12px_rgba(37,99,235,0.8)] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Post Salary Record Anonymously
                          </button>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-700 block">Automatic Vetting Active</span>
                            <p className="mt-0.5">
                              Compensation entries are instantly evaluated. Values outside normal brackets for standard level ranges will flag the post as <strong>unverified</strong> automatically.
                            </p>
                          </div>
                        </div>

                        {formFeedback && (
                          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
                            formFeedback.type === "success"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            <span>{formFeedback.message}</span>
                          </div>
                        )}
                      </form>
                    </div>

                    <aside className="xl:sticky xl:top-6 self-start space-y-6">
                      <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)]"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <div className="rounded-2xl bg-slate-100 p-2">
                              <TrendingUp className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">Live Compensation Summary</span>
                          </div>
                        </div>

                        <div className="rounded-3xl bg-slate-900 px-4 py-4 text-white">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">Total Compensation</span>
                          <motion.div
                            key={totalCompensation}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 text-3xl font-semibold tracking-tight"
                          >
                            {formatINR(totalCompensation)}
                          </motion.div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {compensationBreakdown.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                                <span className="text-xs font-semibold text-slate-500 font-mono">{formatINR(item.value)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.width}%` }}
                                  transition={{ duration: 0.3 }}
                                  className={`h-full rounded-full ${item.color}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.section>

                      <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)]"
                      >
                        <div className="flex items-center gap-2 mb-5">
                          <div className="rounded-2xl bg-slate-100 p-2">
                            <ShieldCheck className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Verification Status</span>
                        </div>

                        <div className="flex items-center justify-center">
                          <div
                            className="relative h-32 w-32 rounded-full p-2"
                            style={{
                              background: `conic-gradient(#2563eb 0deg, #2563eb ${verifiedProbability * 3.6}deg, #e2e8f0 ${verifiedProbability * 3.6}deg, #e2e8f0 360deg)`,
                            }}
                          >
                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                              <span className="text-3xl font-semibold text-slate-900">{verifiedProbability}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-center">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Overall Verification Score</span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            {compensationWithinExpectedRange ? <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />}
                            <span className="text-xs text-slate-700">Compensation within expected range</span>
                          </div>
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            {experienceMatchesLevel ? <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />}
                            <span className="text-xs text-slate-700">Experience matches level</span>
                          </div>
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                            {bonusUnusuallyHigh ? <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" /> : <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />}
                            <span className="text-xs text-slate-700">{bonusUnusuallyHigh ? "Bonus slightly above market" : "Bonus within market range"}</span>
                          </div>
                        </div>
                      </motion.section>
                    </aside>
                  </div>
                </div>
              )}


            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-400" />
            <span className="font-bold text-slate-200">CompIntel Platform</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showProfileCompletion && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileCompletion(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Onboarding</p>
                  <h3 className="text-sm font-bold text-slate-800">Finish your profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileCompletion(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                Add a few details so CompIntel can tailor salary insights and negotiation suggestions to your background.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Current job title</label>
                  <input
                    value={profileForm.currentJobTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, currentJobTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Experience (years)</label>
                  <input
                    type="number"
                    value={profileForm.experienceYears}
                    onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                    placeholder="6"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Company</label>
                  <input
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Country</label>
                  <input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                    placeholder="India"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Preferred currency</label>
                  <select
                    value={profileForm.preferredCurrency}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredCurrency: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Expected salary</label>
                  <input
                    type="number"
                    value={profileForm.expectedSalary}
                    onChange={(e) => setProfileForm({ ...profileForm, expectedSalary: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                    placeholder="3000000"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Preferred location</label>
                <input
                  value={profileForm.preferredLocation}
                  onChange={(e) => setProfileForm({ ...profileForm, preferredLocation: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-400"
                  placeholder="Bangalore, India"
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleProfileSubmit(false)}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Save profile
                </button>
                <button
                  onClick={() => handleProfileSubmit(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION MODAL */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <Lock className="h-4 w-4 text-teal-500" />
                  {authMode === "register" ? "Create Verified Account" : authMode === "forgot" ? "Reset Password" : "Sign In to CompIntel"}
                </h3>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-mono text-base font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {authMode === "register"
                  ? "Create a secure account to keep your verified submissions and access premium negotiation tools. We’ll send a verification link to your inbox."
                  : authMode === "forgot"
                    ? "Set a new password for your account and continue using CompIntel securely."
                    : "Sign in with your email or continue with Google. Demo credentials: candidate@compintel.com / candidate123 or admin@compintel.com / password123."}
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold">
                  {authSuccess}
                </div>
              )}

              {(authMode === "login" || authMode === "register") && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span>or continue with</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  {googleClientId ? (
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        width="280"
                        logo_alignment="left"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center">Add VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</p>
                  )}
                  {authLoading && (
                    <p className="text-[11px] text-slate-500 text-center">Signing you in...</p>
                  )}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthError(null);
                  setAuthSuccess(null);
                  setAuthLoading(true);

                  const passwordStrength = getPasswordStrength(authPassword);
                  if (authMode === "register" && passwordStrength.score < 3) {
                    setAuthLoading(false);
                    setAuthError("Use a stronger password with uppercase, lowercase, a number, and a symbol.");
                    return;
                  }

                  if (authMode === "register" && authPassword !== authConfirmPassword) {
                    setAuthLoading(false);
                    setAuthError("Passwords do not match.");
                    return;
                  }

                  try {
                    const endpoint = authMode === "register"
                      ? "/api/auth/register"
                      : authMode === "forgot"
                        ? "/api/auth/forgot-password"
                        : "/api/auth/login";
                    const payload = authMode === "register"
                      ? { name: authName, email: authEmail, password: authPassword, confirmPassword: authConfirmPassword }
                      : authMode === "forgot"
                        ? { email: authEmail, password: authPassword, confirmPassword: authConfirmPassword }
                        : { email: authEmail, password: authPassword };

                    const res = await fetch(endpoint, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      if (authMode === "login") {
                        const storedUser = { token: data.token, user: data.user, email: data.user.email };
                        persistUserSession(storedUser, rememberMe);
                        setAuthModalOpen(false);
                        setAuthEmail("");
                        setAuthPassword("");
                        setAuthConfirmPassword("");
                        setAuthName("");
                      } else if (authMode === "register" && data.requiresProfile) {
                        const storedUser = { token: data.token, user: data.user, email: data.user.email };
                        persistUserSession(storedUser, rememberMe);
                        setAuthModalOpen(false);
                        setAuthEmail("");
                        setAuthPassword("");
                        setAuthConfirmPassword("");
                        setAuthName("");
                        setShowProfileCompletion(true);
                        setAuthSuccess(data.message || "Account created successfully. Please complete your profile.");
                      } else {
                        setAuthSuccess(data.message || "Request completed successfully.");
                        setAuthMode("login");
                        setAuthPassword("");
                        setAuthConfirmPassword("");
                      }
                    } else {
                      setAuthError(data.error || "Authentication failed");
                    }
                  } catch (err) {
                    setAuthError("Network communication error.");
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                className="space-y-4"
              >
                {authMode === "register" && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Asha Rao"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@compintel.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                  />
                  {authMode !== "login" && (
                    <div className="mt-2 text-[10px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Password strength</span>
                        <span className={`font-semibold ${getPasswordStrength(authPassword).color}`}>
                          {getPasswordStrength(authPassword).label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all ${authPassword ? "bg-teal-500" : "bg-slate-200"}`}
                          style={{ width: `${Math.min(100, (getPasswordStrength(authPassword).score / 5) * 100)}%` }}
                        />
                      </div>
                      {getPasswordStrength(authPassword).feedback.slice(0, 2).map((item) => (
                        <p key={item} className="text-slate-500">• {item}</p>
                      ))}
                    </div>
                  )}
                </div>

                {(authMode === "register" || authMode === "forgot") && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-teal-400 focus:bg-white outline-none"
                    />
                  </div>
                )}

                {authMode === "login" && (
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    Remember me
                  </label>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-teal-400" />
                  {authLoading ? "Please wait..." : authMode === "register" ? "Create Account" : authMode === "forgot" ? "Reset Password" : "Sign In Session"}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : authMode === "register" ? "login" : "login");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer block w-full"
                >
                  {authMode === "register" ? "Already have an account? Sign In" : authMode === "forgot" ? "Back to sign in" : "Don't have an account yet? Create one"}
                </button>
                {authMode === "login" && (
                  <button
                    onClick={() => {
                      setAuthMode("forgot");
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer block w-full"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPENSATION SPECTRUM DETAILS MODAL */}
      <AnimatePresence>
        {selectedChartItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChartItem(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4.5 w-full max-w-sm relative z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-500/10 p-2 rounded-xl text-teal-600 border border-teal-500/20">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Spectrum Pay Details
                    </h3>
                    <p className="text-[10px] text-slate-400">Itemized compensation structure</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedChartItem(null)}
                  className="text-slate-400 hover:text-slate-600 font-mono text-lg font-bold cursor-pointer h-7 w-7 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all"
                >
                  &times;
                </button>
              </div>

              {/* Core Details */}
              <div className="space-y-4">
                {/* Company & Role Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CompanyLogo name={selectedChartItem.companyName} className="h-10 w-10 text-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">{selectedChartItem.companyName}</span>
                      {selectedChartItem.verified ? (
                        <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide">
                          Self-Reported
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 truncate">{selectedChartItem.role}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {selectedChartItem.levelCode} ({selectedChartItem.standardLevel}) • {selectedChartItem.location}
                    </p>
                  </div>
                </div>

                {/* Split breakdown visualization info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Company Tier</span>
                    <TierBadge tier={selectedChartItem.tier} className="self-start py-0.5" />
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Experience & Tenure</span>
                    <span className="text-[11px] font-bold text-slate-700 truncate block">
                      {selectedChartItem.yearsOfExperience}y Exp • {selectedChartItem.yearsAtCompany}y Co
                    </span>
                  </div>
                </div>

                {/* Highlight TC Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-5 text-white pointer-events-none">
                    <TrendingUp className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-teal-400 uppercase font-bold tracking-wider">Total Annual Compensation</span>
                      <h4 className="text-lg font-bold font-mono tracking-tight mt-0.5 text-teal-300">
                        ₹{selectedChartItem.totalCompensation.toLocaleString("en-IN")}
                      </h4>
                    </div>
                    <span className="text-[9px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono border border-teal-500/10 font-bold uppercase tracking-wider">
                      CTC / YR
                    </span>
                  </div>
                </div>

                {/* Interactive bar splits */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Annualized Pay Splits</h4>
                  
                  {/* Base Salary */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                        Base Salary
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{selectedChartItem.baseSalary.toLocaleString("en-IN")}{" "}
                        <span className="text-slate-400 text-[10px] font-normal">
                          ({Math.round((selectedChartItem.baseSalary / selectedChartItem.totalCompensation) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#3b82f6] rounded-full transition-all duration-500" 
                        style={{ width: `${(selectedChartItem.baseSalary / selectedChartItem.totalCompensation) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Annual Bonus */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                        Annual Bonus
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{selectedChartItem.bonus.toLocaleString("en-IN")}{" "}
                        <span className="text-slate-400 text-[10px] font-normal">
                          ({Math.round((selectedChartItem.bonus / selectedChartItem.totalCompensation) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#4ade80] rounded-full transition-all duration-500" 
                        style={{ width: `${(selectedChartItem.bonus / selectedChartItem.totalCompensation) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Equity Value */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                        Annualized Equity
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{selectedChartItem.equity.toLocaleString("en-IN")}{" "}
                        <span className="text-slate-400 text-[10px] font-normal">
                          ({Math.round((selectedChartItem.equity / selectedChartItem.totalCompensation) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#94a3b8] rounded-full transition-all duration-500" 
                        style={{ width: `${(selectedChartItem.equity / selectedChartItem.totalCompensation) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
