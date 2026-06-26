export interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
  feedback: string[];
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a lowercase letter");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add an uppercase letter");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a special character");
  }

  if (score <= 2) {
    return { score, label: "Weak", color: "text-rose-600", feedback };
  }

  if (score <= 3) {
    return { score, label: "Fair", color: "text-amber-600", feedback };
  }

  if (score <= 4) {
    return { score, label: "Good", color: "text-sky-600", feedback };
  }

  return { score, label: "Strong", color: "text-emerald-600", feedback };
}
