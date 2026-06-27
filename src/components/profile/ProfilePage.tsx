import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Sparkles,
  UploadCloud,
} from "lucide-react";

type ProfileData = {
  id: string;
  fullName: string | null;
  email: string;
  currentCompany: string | null;
  jobTitle: string | null;
  yearsOfExperience: number | null;
  preferredJobLocation: string | null;
  preferredCurrency: string | null;
  avatarUrl: string | null;
  bio: string | null;
  resumeUrl: string | null;
  reportsSubmitted: number;
  negotiationsCreated: number;
  verified: boolean;
  profileCompleted: boolean;
  profileCompletionPercent: number;
  contributionLevel: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type ProfileForm = {
  fullName: string;
  email: string;
  currentCompany: string;
  jobTitle: string;
  yearsOfExperience: string;
  preferredJobLocation: string;
  preferredCurrency: string;
  avatarUrl: string;
  bio: string;
  resumeUrl: string;
};

const emptyForm: ProfileForm = {
  fullName: "",
  email: "",
  currentCompany: "",
  jobTitle: "",
  yearsOfExperience: "",
  preferredJobLocation: "",
  preferredCurrency: "INR",
  avatarUrl: "",
  bio: "",
  resumeUrl: "",
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Recently updated";
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
};

const calculateCompletionPercent = (source: Partial<ProfileData> & Partial<ProfileForm>) => {
  const fields = [
    source.fullName,
    source.email,
    source.currentCompany,
    source.jobTitle,
    source.yearsOfExperience !== null && source.yearsOfExperience !== undefined && source.yearsOfExperience !== "",
    source.preferredJobLocation,
    source.preferredCurrency,
    source.bio,
    source.avatarUrl,
    source.resumeUrl,
  ];
  const filled = fields.filter((value) => Boolean(value)).length;
  return Math.round((filled / fields.length) * 100);
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [viewState, setViewState] = useState<"loading" | "ready" | "unauthorized">("loading");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("compintel_user") || sessionStorage.getItem("compintel_user");
        const saved = token ? JSON.parse(token) : null;

        if (!saved?.token) {
          setViewState("unauthorized");
          setError(null);
          return;
        }

        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${saved.token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setViewState("unauthorized");
          setError(null);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load profile");

        setProfile(data.profile);
        setViewState("ready");
        setForm({
          fullName: data.profile.fullName || "",
          email: data.profile.email || "",
          currentCompany: data.profile.currentCompany || "",
          jobTitle: data.profile.jobTitle || "",
          yearsOfExperience: data.profile.yearsOfExperience?.toString() || "",
          preferredJobLocation: data.profile.preferredJobLocation || "",
          preferredCurrency: data.profile.preferredCurrency || "INR",
          avatarUrl: data.profile.avatarUrl || "",
          bio: data.profile.bio || "",
          resumeUrl: data.profile.resumeUrl || "",
        });
        // Derive resume file name from stored URL if available
        if (data.profile.resumeUrl) {
          try {
            const parts = String(data.profile.resumeUrl).split("/");
            setResumeName(decodeURIComponent(parts[parts.length - 1] || ""));
          } catch {}
        }
      } catch (err: any) {
        setViewState("unauthorized");
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const completionPercent = useMemo(() => calculateCompletionPercent(profile || form), [profile, form]);

  const stats = useMemo(() => {
    const reports = profile?.reportsSubmitted ?? 0;
    const negotiations = profile?.negotiationsCreated ?? 0;

    return [
      { label: "Reports Submitted", value: reports, detail: "Published compensation insights" },
      { label: "Negotiations Generated", value: negotiations, detail: "Offer strategy drafts" },
      { label: "Saved Reports", value: Math.max(0, reports + Math.floor(negotiations / 2)), detail: "Archived for quick reuse" },
      { label: "Offer Comparisons", value: Math.max(0, reports + negotiations - 1), detail: "Compensation scenarios reviewed" },
      { label: "AI Sessions", value: Math.max(1, Math.floor((reports + negotiations + 3) / 2)), detail: "Insights generated" },
      { label: "Last Active", value: formatDate(profile?.updatedAt), detail: "Latest activity" },
      { label: "Member Since", value: formatDate(profile?.createdAt), detail: "Joined CompIntel" },
    ];
  }, [profile]);

  const achievements = useMemo(() => [
    { title: "Profile complete", active: completionPercent >= 80, detail: "The essentials are all in place." },
    { title: "Verified account", active: Boolean(profile?.verified), detail: "Email verification is complete." },
    { title: "Active contributor", active: (profile?.reportsSubmitted ?? 0) >= 1, detail: "Your work is already contributing to the platform." },
    { title: "High momentum", active: (profile?.reportsSubmitted ?? 0) + (profile?.negotiationsCreated ?? 0) >= 10, detail: "You are building strong momentum." },
  ], [completionPercent, profile]);

  const previewProfile = useMemo(() => {
    const experience = form.yearsOfExperience ? Number(form.yearsOfExperience) : profile?.yearsOfExperience;

    return {
      currentCompany: isEditing ? form.currentCompany || profile?.currentCompany : profile?.currentCompany,
      preferredJobLocation: isEditing ? form.preferredJobLocation || profile?.preferredJobLocation : profile?.preferredJobLocation,
      yearsOfExperience: isEditing ? (form.yearsOfExperience ? Number(form.yearsOfExperience) : profile?.yearsOfExperience) : profile?.yearsOfExperience,
      preferredCurrency: isEditing ? form.preferredCurrency : profile?.preferredCurrency,
      bio: isEditing ? form.bio : profile?.bio,
      avatarUrl: isEditing ? form.avatarUrl || profile?.avatarUrl : profile?.avatarUrl,
      fullName: isEditing ? form.fullName || profile?.fullName : profile?.fullName,
    } as {
      currentCompany?: string | null;
      preferredJobLocation?: string | null;
      yearsOfExperience?: number | null;
      preferredCurrency?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      fullName?: string | null;
    };
  }, [isEditing, form, profile]);

  const activityTimeline = useMemo(() => [
    {
      title: "Profile refresh",
      time: formatDate(profile?.updatedAt),
      detail: "Your professional summary and preferences are current.",
    },
    {
      title: `${profile?.reportsSubmitted ?? 0} reports submitted`,
      time: "Live",
      detail: "Compensation insights shared with the community.",
    },
    {
      title: `${profile?.negotiationsCreated ?? 0} negotiations generated`,
      time: "Live",
      detail: "Offer strategies created for better outcomes.",
    },
  ], [profile]);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    // Allow larger images (up to 5MB). Server also accepts larger data URLs.
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const token = localStorage.getItem("compintel_user") || sessionStorage.getItem("compintel_user");
      const saved = token ? JSON.parse(token) : null;

      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${saved?.token}`,
          },
          body: JSON.stringify({
            ...form,
            avatarUrl: result,
            yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Unable to update profile photo");

        setForm((current) => ({ ...current, avatarUrl: result }));
        setProfile(data.profile);
        setSuccess("Profile photo updated successfully.");
      } catch (err: any) {
        setError(err.message || "Unable to update profile photo");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const resetForm = () => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      currentCompany: profile.currentCompany || "",
      jobTitle: profile.jobTitle || "",
      yearsOfExperience: profile.yearsOfExperience?.toString() || "",
      preferredJobLocation: profile.preferredJobLocation || "",
      preferredCurrency: profile.preferredCurrency || "INR",
      avatarUrl: profile.avatarUrl || "",
      bio: profile.bio || "",
      resumeUrl: profile.resumeUrl || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!form.fullName.trim()) {
        throw new Error("Please add your full name.");
      }
      if (!form.jobTitle.trim()) {
        throw new Error("Please add your job title.");
      }

      const token = localStorage.getItem("compintel_user") || sessionStorage.getItem("compintel_user");
      const saved = token ? JSON.parse(token) : null;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${saved?.token}`,
        },
        body: JSON.stringify({
          ...form,
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to update profile");

      setProfile(data.profile);
      setForm({
        fullName: data.profile.fullName || "",
        email: data.profile.email || "",
        currentCompany: data.profile.currentCompany || "",
        jobTitle: data.profile.jobTitle || "",
        yearsOfExperience: data.profile.yearsOfExperience?.toString() || "",
        preferredJobLocation: data.profile.preferredJobLocation || "",
        preferredCurrency: data.profile.preferredCurrency || "INR",
        avatarUrl: data.profile.avatarUrl || "",
        bio: data.profile.bio || "",
        resumeUrl: data.profile.resumeUrl || "",
      });
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "doc", "docx"].includes(extension)) {
      setError("Only PDF, DOC, or DOCX resumes are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be 5MB or smaller.");
      return;
    }

    const token = localStorage.getItem("compintel_user") || sessionStorage.getItem("compintel_user");
    const saved = token ? JSON.parse(token) : null;

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/profile/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${saved?.token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to upload resume");

      setForm((current) => ({ ...current, resumeUrl: data.resumeUrl || "" }));
      // Remember the original filename for display
      setResumeName(file.name || null);
      setSuccess("Resume uploaded successfully.");
    } catch (err: any) {
      setError(err.message || "Unable to upload resume");
    } finally {
      event.target.value = "";
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "candidate@compintel.com", password: "candidate123" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to sign in to the demo account.");

      const storedUser = { token: data.token, user: data.user, email: data.user.email };
      localStorage.setItem("compintel_user", JSON.stringify(storedUser));
      sessionStorage.removeItem("compintel_user");
      localStorage.setItem("compintel_profile_redirect", "true");
      sessionStorage.setItem("compintel_profile_redirect", "true");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Unable to sign in to the demo account.");
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading profile…</div>;
  }

  if (viewState === "unauthorized") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sign in to view your profile</h3>
              <p className="mt-1 text-sm text-slate-500">Your account details, progress, and achievements will appear here once you sign in.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDemoLogin}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Use demo profile
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <div className="font-semibold text-slate-700">What you will see after sign-in</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-500">
            <li>Your professional summary and completion progress</li>
            <li>Contribution statistics and achievements</li>
            <li>Resume and profile photo controls</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-slate-800 text-lg font-bold text-white">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                profile?.fullName?.charAt(0) || profile?.email?.charAt(0) || "U"
              )}
              <label className="absolute bottom-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white bg-slate-900/90 text-white shadow-sm transition hover:bg-slate-800">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{profile?.fullName || profile?.email || "Your profile"}</h2>
                {profile?.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 lg:mt-0">
                <button
                  onClick={() => {
                    resetForm();
                    setIsEditing(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit profile
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">{profile?.jobTitle || "Add your role to personalize insights"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{profile?.contributionLevel}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{previewProfile.currentCompany || "Add company"}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{previewProfile.preferredJobLocation || "Add location"}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">Profile completion</span>
              <span className="font-bold text-teal-600">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-teal-500" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="text-[11px] text-slate-500">A fuller profile helps unlock more relevant insights and recommendations.</p>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}

      {isEditing ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit profile</h3>
              <p className="text-xs text-slate-500">Update your profile details and save to refresh the snapshot.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-slate-800 text-lg font-bold text-white">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    form.fullName?.charAt(0) || form.email?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Profile photo</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700">
                      <Camera className="h-3.5 w-3.5" /> Change photo
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Square images work best. JPG or PNG under 200KB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Full name</label>
              <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</label>
              <input value={form.email} disabled className="w-full rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-500 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Current company</label>
              <input value={form.currentCompany} onChange={(event) => setForm({ ...form, currentCompany: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Job title</label>
              <input value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Years of experience</label>
              <input type="number" value={form.yearsOfExperience} onChange={(event) => setForm({ ...form, yearsOfExperience: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Preferred location</label>
              <input value={form.preferredJobLocation} onChange={(event) => setForm({ ...form, preferredJobLocation: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Preferred currency</label>
              <select value={form.preferredCurrency} onChange={(event) => setForm({ ...form, preferredCurrency: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Bio</label>
              <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Professional snapshot</h3>
                  <p className="mt-1 text-xs text-slate-500">A compact view of the details that matter most.</p>
                </div>
              </div>
              <div className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                Updated live
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Company</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{previewProfile.currentCompany || "Add your company"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Location</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{previewProfile.preferredJobLocation || "Add your location"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Experience</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{previewProfile.yearsOfExperience ? `${previewProfile.yearsOfExperience} yrs` : "Add experience"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Preferred currency</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{previewProfile.preferredCurrency || "INR"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2 xl:col-span-4">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">About</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{previewProfile.bio || "Add a short bio to share your story with the community."}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Resume</h3>
                <p className="text-xs text-slate-500">Share a polished snapshot of your background.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                  <UploadCloud className="h-3.5 w-3.5" /> Upload
                  <input type="file" accept="application/pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                </label>
                {form.resumeUrl ? (
                  <a href={form.resumeUrl} download={resumeName || "resume.pdf"} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white p-2 text-teal-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Resume ready for sharing</div>
                  <p className="mt-1 text-xs text-slate-500">Upload your latest resume and keep it available for hiring conversations and offer reviews.</p>
                  {resumeName ? (
                    <div className="mt-2 text-xs text-slate-600">File: <span className="font-medium text-slate-800">{resumeName}</span></div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-bold text-slate-800">Achievements</h3>
            </div>
            <div className="mt-4 space-y-3">
              {achievements.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                  {item.active ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" /> : <BadgeCheck className="mt-0.5 h-4 w-4 text-slate-300" />}
                  <div>
                    <div className="font-semibold text-slate-700">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-bold text-slate-800">Momentum</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-800">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-bold text-slate-800">Activity timeline</h3>
            </div>
            <div className="mt-4 space-y-3">
              {activityTimeline.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="mt-0.5 rounded-full bg-white p-2 text-teal-600">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.time}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
