import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";
import { createTaskSchema } from "@/lib/validations";

const DATE_PATTERNS = [
  { regex: /\btomorrow\b/i, get: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; } },
  { regex: /\btoday\b/i, get: () => new Date().toISOString().split("T")[0] },
  { regex: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, get: (m: RegExpMatchArray) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const target = days.indexOf(m[1].toLowerCase());
    const d = new Date();
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }},
  { regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})\b/i, get: (m: RegExpMatchArray) => {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mi = months.findIndex(x => m[1].toLowerCase().startsWith(x));
    const d = new Date();
    d.setMonth(mi, parseInt(m[2]));
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }},
  { regex: /\b(\d{1,2})[/-](\d{1,2})\b/, get: (m: RegExpMatchArray) => {
    const d = new Date();
    d.setMonth(parseInt(m[2]) - 1, parseInt(m[1]));
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }},
];

const TIME_PATTERNS = [
  { regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i, get: (m: RegExpMatchArray) => {
    let h = parseInt(m[1]);
    const min = m[2];
    if (m[3].toLowerCase() === "pm" && h < 12) h += 12;
    if (m[3].toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${min}`;
  }},
  { regex: /\b(\d{1,2})\s*(am|pm)\b/i, get: (m: RegExpMatchArray) => {
    let h = parseInt(m[1]);
    if (m[2].toLowerCase() === "pm" && h < 12) h += 12;
    if (m[2].toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:00`;
  }},
];

const PRIORITY_PATTERNS = [
  { regex: /\b(high\s*priority|p1|urgent)\b/i, value: 4 },
  { regex: /\b(medium\s*priority|p2)\b/i, value: 3 },
  { regex: /\b(low\s*priority|p3)\b/i, value: 2 },
  { regex: /\b(p4)\b/i, value: 1 },
];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  await connectDB();

  let title = text.trim();
  let dueDate: string | undefined;
  let dueTime: string | undefined;
  let priority = 0;

  // Extract date
  for (const pattern of DATE_PATTERNS) {
    const match = title.match(pattern.regex);
    if (match) {
      dueDate = pattern.get(match);
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  // Extract time
  for (const pattern of TIME_PATTERNS) {
    const match = title.match(pattern.regex);
    if (match) {
      dueTime = pattern.get(match);
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  // Extract priority
  for (const pattern of PRIORITY_PATTERNS) {
    const match = title.match(pattern.regex);
    if (match) {
      priority = pattern.value;
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  if (!title) {
    return NextResponse.json({ error: "Could not parse task" }, { status: 400 });
  }

  const lastTask = await Task.findOne({ spaceId: user.spaceId, parentTaskId: null, projectId: null }).sort({ position: -1 });

  const task = await Task.create({
    spaceId: user.spaceId,
    title,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    dueTime: dueTime || null,
    position: (lastTask?.position || 0) + 1,
  });

  return NextResponse.json({
    task,
    interpretation: { title, dueDate: dueDate || null, dueTime: dueTime || null, priority },
  }, { status: 201 });
}
