export const APP_NAME = "DOTODO";
export const APP_SLOGAN = "Think it. Do it.";
export const APP_DESCRIPTION = "Get things out of your head and get them done.";

export const SESSION_COOKIE_NAME = "dotodo_session";
export const SESSION_MAX_AGE_DAYS = 30;

export const PRIORITY_LABELS: Record<number, string> = {
  0: "None",
  1: "P4",
  2: "P3",
  3: "P2",
  4: "P1",
};

export const PRIORITY_COLORS: Record<number, string> = {
  0: "text-zinc-500",
  1: "text-blue-500",
  2: "text-amber-500",
  3: "text-orange-500",
  4: "text-red-500",
};

export const DEFAULT_PROJECTS = [
  { name: "Personal", icon: "user", color: "#6366f1" },
  { name: "College", icon: "graduation-cap", color: "#f59e0b" },
  { name: "Work", icon: "briefcase", color: "#22c55e" },
];

export const TIME_PERIODS = ["morning", "afternoon", "evening", "anytime"] as const;
