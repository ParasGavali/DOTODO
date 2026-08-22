export interface NLPResult {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: number;
  projectId: string | null;
  labels: string[];
}

const DATE_PATTERNS: { regex: RegExp; get: (m: RegExpMatchArray) => string }[] = [
  { regex: /\btomorrow\b/i, get: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; } },
  { regex: /\btoday\b/i, get: () => new Date().toISOString().split("T")[0] },
  { regex: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, get: (m) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const target = days.indexOf(m[1].toLowerCase());
    const d = new Date();
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }},
  { regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})\b/i, get: (m) => {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mi = months.findIndex(x => m[1].toLowerCase().startsWith(x));
    const d = new Date();
    d.setMonth(mi, parseInt(m[2]));
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }},
];

const TIME_PATTERNS: { regex: RegExp; get: (m: RegExpMatchArray) => string }[] = [
  { regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i, get: (m) => {
    let h = parseInt(m[1]);
    if (m[3].toLowerCase() === "pm" && h < 12) h += 12;
    if (m[3].toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m[2]}`;
  }},
  { regex: /\b(\d{1,2})\s*(am|pm)\b/i, get: (m) => {
    let h = parseInt(m[1]);
    if (m[2].toLowerCase() === "pm" && h < 12) h += 12;
    if (m[2].toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:00`;
  }},
];

const PRIORITY_MAP: [RegExp, number][] = [
  [/\b(high\s*priority|p1|urgent)\b/i, 4],
  [/\b(medium\s*priority|p2)\b/i, 3],
  [/\b(low\s*priority|p3)\b/i, 2],
  [/\b(p4)\b/i, 1],
];

export function parseTask(text: string): NLPResult {
  let title = text.trim();
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let priority = 0;

  for (const p of DATE_PATTERNS) {
    const match = title.match(p.regex);
    if (match) {
      dueDate = p.get(match);
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  for (const p of TIME_PATTERNS) {
    const match = title.match(p.regex);
    if (match) {
      dueTime = p.get(match);
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  for (const [regex, value] of PRIORITY_MAP) {
    const match = title.match(regex);
    if (match) {
      priority = value;
      title = title.replace(match[0], "").replace(/\s+/g, " ").trim();
      break;
    }
  }

  return { title, dueDate, dueTime, priority, projectId: null, labels: [] };
}
