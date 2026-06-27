/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import { z } from "zod";

import { SEED_COMPENSATIONS, LEVEL_MATRICES, STAGE_LOCATIONS } from "./src/data.ts";
import { CompensationRecord, RoleType, CompanyTier } from "./src/types.ts";
import { db } from "./src/lib/db.ts";

// Load environment variables from the local project files.
dotenv.config();
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.example" });

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename?: string) => void) => {
      const extension = path.extname(file.originalname || "resume.pdf") || ".pdf";
      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are supported."));
    }
  },
});

app.use("/uploads", express.static(uploadDir));

// Log incoming requests
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} (Body: ${JSON.stringify(req.body)})\n`;
  fs.appendFileSync(path.join(process.cwd(), "server_log.txt"), logMsg);
  next();
});

// Initialize Gemini AI Client
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiApiKey) {
  ai = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'compensation-intelligence-build',
      }
    }
  });
}

// In-memory compensation state
let compensations: CompensationRecord[] = [...SEED_COMPENSATIONS];

// In-memory role views tracker (Trending Roles)
let roleViews: Record<string, number> = {
  "Software Engineer": 1520,
  "Product Manager": 840,
  "Data Scientist": 620,
  "Product Designer": 410
};

const JWT_SECRET = process.env.JWT_SECRET || "compintel-dev-secret";
const appUrl = process.env.APP_URL || "http://localhost:3000";
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

interface AuthUserPayload {
  id: string;
  email: string;
  name?: string | null;
  isAdmin: boolean;
  profileCompleted?: boolean;
}

const profilePayloadSchema = z.object({
  fullName: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  currentCompany: z.string().trim().max(120).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  yearsOfExperience: z.coerce.number().int().min(0).max(60).optional().nullable(),
  preferredJobLocation: z.string().trim().max(120).optional().or(z.literal("")),
  preferredCurrency: z.string().trim().max(8).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  // Allow larger data URLs for avatar images (base64 expands size).
  // Client enforces a 200KB file size limit; set a generous character limit
  // to accommodate the `data:image/...;base64,` prefix and base64 expansion.
  avatarUrl: z.string().trim().max(500000).optional().or(z.literal("")),
  // Resume URLs are typically short paths, but keep them generous as well.
  resumeUrl: z.string().trim().max(200000).optional().or(z.literal("")),
});

function getProfileCompletionPercent(user: {
  name: string | null;
  email: string;
  companyName: string | null;
  currentJobTitle: string | null;
  experienceYears: number | null;
  preferredLocation: string | null;
  preferredCurrency: string | null;
  bio: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
}) {
  const fields = [
    user.name,
    user.email,
    user.companyName,
    user.currentJobTitle,
    user.experienceYears !== null && user.experienceYears !== undefined,
    user.preferredLocation,
    user.preferredCurrency,
    user.bio,
    user.avatarUrl,
    user.resumeUrl,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function getContributionLevel(reportsSubmitted: number, negotiationsCreated: number) {
  const score = reportsSubmitted + negotiationsCreated;
  if (score >= 20) return "Power Contributor";
  if (score >= 10) return "Active Contributor";
  if (score >= 4) return "Rising Contributor";
  return "Emerging Contributor";
}

function buildToken(user: AuthUserPayload) {
  return jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, isAdmin: true, profileCompleted: true },
  });

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, profileCompleted: user.profileCompleted } satisfies AuthUserPayload;
}

async function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as express.Request & { user?: AuthUserPayload }).user = user;
  next();
}

function createVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendVerificationEmail(email: string, name: string | null, token: string) {
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@compintel.local",
      to: email,
      subject: "Verify your CompIntel account",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to CompIntel</h2>
          <p>Hi ${name || "there"},</p>
          <p>Please verify your email address to activate your account.</p>
          <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p>${verifyUrl}</p>
        </div>
      `,
    });
    return true;
  }

  console.info(`[auth] Verification email for ${email}: ${verifyUrl}`);
  return true;
}

async function verifyGoogleToken(credential: string) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const payload = await response.json() as {
    email?: string;
    email_verified?: string | boolean;
    sub?: string;
    name?: string;
    picture?: string;
    aud?: string;
  };

  if (!response.ok || !payload.email || (payload.email_verified !== true && payload.email_verified !== "true") || payload.aud !== googleClientId) {
    throw new Error("Google authentication failed. Please try again.");
  }

  return payload;
}

async function seedDemoUsers() {
  const demoUsers = [
    { email: "candidate@compintel.com", password: "candidate123", name: "Candidate Demo", isAdmin: false },
    { email: "admin@compintel.com", password: "password123", name: "Admin Demo", isAdmin: true },
  ];

  for (const entry of demoUsers) {
    const email = entry.email.toLowerCase();
    const passwordHash = await bcrypt.hash(entry.password, 10);

    await db.user.upsert({
      where: { email },
      create: {
        email,
        name: entry.name,
        passwordHash,
        isAdmin: entry.isAdmin,
        authProvider: "email",
        emailVerified: true,
        profileCompleted: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
      update: {
        name: entry.name,
        passwordHash,
        isAdmin: entry.isAdmin,
        authProvider: "email",
        emailVerified: true,
        profileCompleted: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
  }
}

void seedDemoUsers().catch((error) => {
  console.warn("Failed to seed demo users:", error);
});

// --- API ENDPOINTS ---

// Auth Endpoint: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: "Email, password, and confirmation are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = createVerificationToken();
    const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
        isAdmin: false,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      },
      select: { id: true, email: true, name: true, isAdmin: true, emailVerified: true, profileCompleted: true },
    });

    await sendVerificationEmail(normalizedEmail, user.name, verificationToken);
    const token = buildToken({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, profileCompleted: user.profileCompleted });

    res.status(201).json({
      token,
      user,
      requiresProfile: true,
      message: "Account created successfully. Please complete your profile to personalize CompIntel."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// Profile Endpoint: Get profile
app.post("/api/profile/resume", authenticateToken, (req, res, next) => {
  resumeUpload.single("resume")(req, res, (error: any) => {
    if (error) {
      return res.status(400).json({ error: error.message || "Unable to upload resume." });
    }
    next();
  });
}, async (req: express.Request, res: express.Response) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Please choose a resume file." });
  }

  const resumeUrl = `/uploads/${req.file.filename}`;
  await db.user.update({
    where: { id: user.id },
    data: { resumeUrl },
  });

  return res.json({ resumeUrl });
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const authUser = (req as express.Request & { user?: AuthUserPayload }).user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        currentJobTitle: true,
        experienceYears: true,
        preferredLocation: true,
        preferredCurrency: true,
        avatarUrl: true,
        bio: true,
        resumeUrl: true,
        reportsSubmitted: true,
        negotiationsCreated: true,
        emailVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      profile: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        currentCompany: user.companyName,
        jobTitle: user.currentJobTitle,
        yearsOfExperience: user.experienceYears,
        preferredJobLocation: user.preferredLocation,
        preferredCurrency: user.preferredCurrency,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        resumeUrl: user.resumeUrl,
        reportsSubmitted: user.reportsSubmitted,
        negotiationsCreated: user.negotiationsCreated,
        verified: user.emailVerified,
        profileCompleted: user.profileCompleted,
        profileCompletionPercent: getProfileCompletionPercent({
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          currentJobTitle: user.currentJobTitle,
          experienceYears: user.experienceYears,
          preferredLocation: user.preferredLocation,
          preferredCurrency: user.preferredCurrency,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          resumeUrl: user.resumeUrl,
        }),
        contributionLevel: getContributionLevel(user.reportsSubmitted, user.negotiationsCreated),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unable to load profile" });
  }
});

// Profile Endpoint: Update profile
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const authUser = (req as express.Request & { user?: AuthUserPayload }).user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = profilePayloadSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Validation failed" });
    }

    const payload = parsed.data;
    // If client sent a data URL for the avatar, validate its decoded size (bytes)
    if (payload.avatarUrl && typeof payload.avatarUrl === "string" && payload.avatarUrl.startsWith("data:")) {
      const commaIndex = payload.avatarUrl.indexOf(",");
      const b64 = commaIndex >= 0 ? payload.avatarUrl.slice(commaIndex + 1) : payload.avatarUrl;
      try {
        const byteLen = Buffer.from(b64, "base64").length;
        const MAX_BYTES = 5 * 1024 * 1024; // 5MB
        if (byteLen > MAX_BYTES) {
          return res.status(400).json({ error: "Profile photo must be 5MB or smaller." });
        }
      } catch (e) {
        // If base64 parsing fails, let the normal validation handle it later
      }
    }
    const normalizedEmail = payload.email?.toLowerCase().trim();

    if (normalizedEmail && normalizedEmail !== authUser.email) {
      const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser && existingUser.id !== authUser.id) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
    }

    const updateData = {
      name: payload.fullName || null,
      email: normalizedEmail || authUser.email,
      companyName: payload.currentCompany || null,
      currentJobTitle: payload.jobTitle || null,
      experienceYears: payload.yearsOfExperience ?? null,
      preferredLocation: payload.preferredJobLocation || null,
      preferredCurrency: payload.preferredCurrency || null,
      bio: payload.bio || null,
      avatarUrl: payload.avatarUrl || null,
      resumeUrl: payload.resumeUrl || null,
      profileCompleted: true,
      emailVerified: normalizedEmail && normalizedEmail !== authUser.email ? false : undefined,
    };

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        currentJobTitle: true,
        experienceYears: true,
        preferredLocation: true,
        preferredCurrency: true,
        avatarUrl: true,
        bio: true,
        resumeUrl: true,
        reportsSubmitted: true,
        negotiationsCreated: true,
        emailVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      profile: {
        id: updatedUser.id,
        fullName: updatedUser.name,
        email: updatedUser.email,
        currentCompany: updatedUser.companyName,
        jobTitle: updatedUser.currentJobTitle,
        yearsOfExperience: updatedUser.experienceYears,
        preferredJobLocation: updatedUser.preferredLocation,
        preferredCurrency: updatedUser.preferredCurrency,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        resumeUrl: updatedUser.resumeUrl,
        reportsSubmitted: updatedUser.reportsSubmitted,
        negotiationsCreated: updatedUser.negotiationsCreated,
        verified: updatedUser.emailVerified,
        profileCompleted: updatedUser.profileCompleted,
        profileCompletionPercent: getProfileCompletionPercent({
          name: updatedUser.name,
          email: updatedUser.email,
          companyName: updatedUser.companyName,
          currentJobTitle: updatedUser.currentJobTitle,
          experienceYears: updatedUser.experienceYears,
          preferredLocation: updatedUser.preferredLocation,
          preferredCurrency: updatedUser.preferredCurrency,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          resumeUrl: updatedUser.resumeUrl,
        }),
        contributionLevel: getContributionLevel(updatedUser.reportsSubmitted, updatedUser.negotiationsCreated),
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      message: "Profile updated successfully.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unable to update profile" });
  }
});

// Profile Endpoint: Change password
app.put("/api/profile/password", authenticateToken, async (req, res) => {
  try {
    const authUser = (req as express.Request & { user?: AuthUserPayload }).user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Current password, new password, and confirmation are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match." });
    }

    const storedUser = await db.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, passwordHash: true, authProvider: true },
    });

    if (!storedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!storedUser.passwordHash) {
      return res.status(400).json({ error: "This account relies on Google sign-in and does not have a password to change." });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, storedUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Your current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: storedUser.id },
      data: { passwordHash },
    });

    res.json({ message: "Password updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unable to update password" });
  }
});

// Auth Endpoint: Complete profile
app.post("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const authUser = (req as express.Request & { user?: AuthUserPayload }).user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body || {};
    const skip = Boolean(body.skip);

    const updateData = skip
      ? { profileCompleted: true }
      : {
          currentJobTitle: typeof body.currentJobTitle === "string" ? body.currentJobTitle.trim() || null : null,
          experienceYears: body.experienceYears !== undefined && body.experienceYears !== null ? Number(body.experienceYears) : null,
          companyName: typeof body.companyName === "string" ? body.companyName.trim() || null : null,
          country: typeof body.country === "string" ? body.country.trim() || null : null,
          preferredCurrency: typeof body.preferredCurrency === "string" ? body.preferredCurrency.trim() || null : null,
          expectedSalary: body.expectedSalary !== undefined && body.expectedSalary !== null ? Number(body.expectedSalary) : null,
          preferredLocation: typeof body.preferredLocation === "string" ? body.preferredLocation.trim() || null : null,
          profileCompleted: true,
        };

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        profileCompleted: true,
        currentJobTitle: true,
        experienceYears: true,
        companyName: true,
        country: true,
        preferredCurrency: true,
        expectedSalary: true,
        preferredLocation: true,
      },
    });

    res.json({
      user: updatedUser,
      message: skip ? "Profile skipped. You can complete it later from your account settings." : "Profile completed successfully."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Profile update failed" });
  }
});

// Auth Endpoint: Google OAuth
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Google credential is missing." });
    }

    const googlePayload = await verifyGoogleToken(credential);
    const normalizedEmail = String(googlePayload.email || "").toLowerCase().trim();

    let user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: googlePayload.name || null,
          passwordHash: null,
          authProvider: "google",
          googleId: googlePayload.sub || null,
          avatarUrl: googlePayload.picture || null,
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiresAt: null,
        },
      });
    } else if (!user.googleId && googlePayload.sub) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          authProvider: "google",
          googleId: googlePayload.sub,
          avatarUrl: googlePayload.picture || user.avatarUrl,
          emailVerified: true,
        },
      });
    }

    const token = buildToken({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, profileCompleted: user.profileCompleted });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, profileCompleted: user.profileCompleted },
      message: "Signed in with Google successfully."
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Google authentication failed" });
  }
});

// Auth Endpoint: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const storedUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, isAdmin: true, passwordHash: true, emailVerified: true, authProvider: true, profileCompleted: true },
    });

    if (!storedUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!storedUser.emailVerified) {
      return res.status(403).json({ error: "Please verify your email before signing in. We sent a verification link to your inbox." });
    }

    if (storedUser.authProvider === "google" && !storedUser.passwordHash) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please use the Google button to continue." });
    }

    const isValidPassword = await bcrypt.compare(password, storedUser.passwordHash!);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = buildToken({ id: storedUser.id, email: storedUser.email, name: storedUser.name, isAdmin: storedUser.isAdmin, profileCompleted: storedUser.profileCompleted });
    res.json({
      token,
      user: { id: storedUser.id, email: storedUser.email, name: storedUser.name, isAdmin: storedUser.isAdmin, profileCompleted: storedUser.profileCompleted },
      message: "Signed in successfully"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// Auth Endpoint: Me
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  const authUser = (req as express.Request & { user?: AuthUserPayload }).user;
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ user: authUser });
});

// Auth Endpoint: Verify Email
app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) {
      return res.status(400).send("Missing verification token.");
    }

    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiresAt: { gt: new Date() },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(400).send("This verification link is invalid or has expired.");
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    res.send("Email verified successfully. You can now sign in to CompIntel.");
  } catch (err: any) {
    res.status(500).send(err.message || "Verification failed");
  }
});

// Auth Endpoint: Forgot Password
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: "Email and a new password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!existingUser) {
      return res.status(404).json({ error: "No account found for this email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: existingUser.id },
      data: { passwordHash },
    });

    res.json({ message: "Password updated successfully. You can sign in with your new password." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Password reset failed" });
  }
});

// Trending Endpoint: Get Trending Roles
app.get("/api/trending", (req, res) => {
  const trending = Object.entries(roleViews).map(([role, views]) => ({
    role,
    views,
    change: `+${(views % 15) + 5}%`
  })).sort((a, b) => b.views - a.views);
  res.json(trending);
});

// Trending Endpoint: Record Role View
app.post("/api/trending/view", (req, res) => {
  const { role } = req.body;
  if (role && roleViews[role] !== undefined) {
    roleViews[role] += 1;
  }
  res.json({ success: true, views: roleViews[role] || 0 });
});

// 1. Get all compensations (with filters)
app.get("/api/compensations", (req, res) => {
  try {
    let filtered = [...compensations];

    const { role, company, level, location, search } = req.query;

    if (role) {
      filtered = filtered.filter(item => item.role === role);
    }
    if (company) {
      filtered = filtered.filter(item => item.companyName.toLowerCase() === (company as string).toLowerCase());
    }
    if (level) {
      filtered = filtered.filter(item => item.standardLevel === level);
    }
    if (location) {
      filtered = filtered.filter(item => item.location === location);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(item => 
        item.companyName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.levelCode.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load compensations" });
  }
});

// 2. Submit new compensation
app.post("/api/compensations", async (req, res) => {
  try {
    const {
      companyName,
      tier,
      role,
      levelCode,
      standardLevel,
      baseSalary,
      bonus,
      equity,
      location,
      yearsOfExperience,
      yearsAtCompany
    } = req.body;

    // Server-side basic validation
    if (!companyName || !role || !standardLevel || !location) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const baseVal = Number(baseSalary) || 0;
    const bonusVal = Number(bonus) || 0;
    const equityVal = Number(equity) || 0;
    const totalComp = baseVal + bonusVal + equityVal;

    // Authentication and Verification check
    const authedUser = await getAuthenticatedUser(req);
    let verified = false;

    if (authedUser) {
      // Authenticated users get their submissions instantly verified!
      verified = true;
    } else {
      // For anonymous/unauthenticated users, run statistical validation
      verified = true;
      if (totalComp > 5000000 || totalComp < 15000 || baseVal < 5000) {
        verified = false;
      }
    }

    const newRecord: CompensationRecord = {
      id: String(compensations.length + 1),
      companyName,
      tier: tier || CompanyTier.TIER_3,
      role: role as RoleType,
      levelCode: levelCode || standardLevel,
      standardLevel,
      baseSalary: baseVal,
      bonus: bonusVal,
      equity: equityVal,
      totalCompensation: totalComp,
      location,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      yearsAtCompany: Number(yearsAtCompany) || 0,
      verified,
      submittedAt: new Date().toISOString()
    };

    compensations.unshift(newRecord);
    res.status(201).json(newRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit compensation" });
  }
});

// 3. Get level matrices
app.get("/api/levels", (req, res) => {
  res.json(LEVEL_MATRICES);
});

// 4. Get available locations
app.get("/api/locations", (req, res) => {
  res.json(STAGE_LOCATIONS);
});

// 5. AI Advisor Endpoint (Groq)
app.get("/api/advisor", (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  res.json({
    status: "online",
    message: "Compensation Intelligence AI Advisor endpoint is ready.",
    apiKeyConfigured: !!apiKey,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/advisor", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Groq API key is not configured. Please add the GROQ_API_KEY environment variable in your app's secrets or environment configuration."
    });
  }

  const groq = new Groq({
    apiKey: apiKey,
  });

  try {
    const { currentOffer, competingOffer, marketStats, userQuery } = req.body;

    const promptContext = `
      Current Offer: ${currentOffer ? JSON.stringify(currentOffer) : "None provided"}
      Competing Offer: ${competingOffer ? JSON.stringify(competingOffer) : "None provided"}
      Market Benchmark Statistics: ${marketStats ? JSON.stringify(marketStats) : "None provided"}
      User Query: "${userQuery || "Please analyze this offer and provide negotiation advice."}"
    `;

    const systemPrompt = `You are an elite, human-centric tech salary negotiation consultant and compensation intelligence advisor. 
        Your goal is to maximize the candidate's compensation while retaining an excellent relationship with the hiring company.
        Analyze the offer parameters (base, bonus, equity) relative to market stats and any competing offers.
        Outline key tactical leverage areas (such as vesting schedules, sign-on bonuses, relocation, level alignment).
        Provide a customized, ready-to-send draft response email to the recruiter.
        Respond STRICTLY in a valid JSON object with the following schema:
        {
          "analysis": "A detailed breakdown and comparative rating of the offer. Contrast base, bonus, and equity ratios.",
          "negotiationStrategy": "Strategic checklist. Highlight specific numbers to ask for and standard trade-offs.",
          "draftMessage": "The verbatim draft message or email template. Ready for the user to copy, edit, and send."
        }
        Do not output any markdown or conversational text outside of the JSON object.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: promptContext
        }
      ],
      response_format: { type: "json_object" }
    });

    const contentText = response.choices[0]?.message?.content || "{}";
    const parsedData = JSON.parse(contentText);
    res.json(parsedData);
  } catch (err: any) {
    console.error("AI Advisor error:", err);
    res.status(500).json({ error: err.message || "Groq query failed" });
  }
});

// 6. Image Generation Endpoint (gemini-3-pro-image-preview)
app.post("/api/generate-image", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Gemini API key is not configured. Please add the GEMINI_API_KEY environment variable in your app's secrets or environment configuration."
    });
  }

  // Lazy-initialize Gemini client to ensure any key changes are picked up live
  const aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'compensation-intelligence-build',
      }
    }
  });

  try {
    const { offerName, companyName, role, level, totalComp, baseSalary, bonus, equity, size } = req.body;

    if (!offerName || !companyName || !totalComp) {
      return res.status(400).json({ error: "Missing required offer statistics for image generation" });
    }

    const imageSize = size || "1K"; // 1K, 2K, or 4K

    const promptText = `
      Create a highly professional, beautiful infographic card celebrating a software career milestone: "OFFER SECURED"!
      The design must have:
      - Dark premium slate/metallic aesthetic background with subtle neon teal and indigo geometric lighting
      - Crisp, elegant typography stating "OFFER SECURED" at the top
      - Dynamic visual stats block showing:
        * Company: ${companyName}
        * Role: ${role} (${level})
        * Total Annual Compensation: $${totalComp.toLocaleString()} USD
        * Breakdown: Base Salary $${baseSalary.toLocaleString()} | Bonus $${bonus.toLocaleString()} | Annual Equity $${equity.toLocaleString()}
      - Aesthetic visual charts or metric progress bars illustrating the pay distribution
      - Absolute flat graphic design with professional layouts (NO laptops, phones, real hand models, or realistic frames). Just the card design itself.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: promptText }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: imageSize
        }
      }
    });

    let base64Image: string | undefined;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      return res.status(500).json({ error: "Failed to generate inline image bytes from the model" });
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (err: any) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate card infographic" });
  }
});


// --- INTEGRATE VITE DEVELOPER SERVER & STATIC ASSETS ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = DEFAULT_PORT;
  const listenHost = HOST || "0.0.0.0";
  const server = app.listen(port, listenHost, () => {
    console.log(`Compensation Intelligence Server running on ${listenHost}:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the existing process or set PORT to a different value.`);
      process.exit(1);
    }
    console.error("Server startup error:", error);
    process.exit(1);
  });
}

startServer();
