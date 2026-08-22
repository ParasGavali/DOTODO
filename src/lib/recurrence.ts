export interface RecurrenceRule {
  type: "daily" | "weekly" | "monthly" | "yearly" | "weekdays" | "custom";
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export function getNextOccurrence(
  rule: RecurrenceRule,
  fromDate: Date = new Date()
): Date {
  const next = new Date(fromDate);

  switch (rule.type) {
    case "daily":
      next.setDate(next.getDate() + rule.interval);
      break;

    case "weekdays": {
      next.setDate(next.getDate() + 1);
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
      break;
    }

    case "weekly":
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);
        let found = false;
        for (const day of sortedDays) {
          if (day > currentDay) {
            next.setDate(next.getDate() + (day - currentDay));
            found = true;
            break;
          }
        }
        if (!found) {
          next.setDate(next.getDate() + (7 - currentDay + sortedDays[0]));
        }
      } else {
        next.setDate(next.getDate() + 7 * rule.interval);
      }
      break;

    case "monthly":
      next.setMonth(next.getMonth() + rule.interval);
      break;

    case "yearly":
      next.setFullYear(next.getFullYear() + rule.interval);
      break;

    case "custom":
      next.setDate(next.getDate() + rule.interval);
      break;
  }

  return next;
}

export function formatRecurrence(rule: RecurrenceRule): string {
  switch (rule.type) {
    case "daily":
      return rule.interval === 1 ? "Every day" : `Every ${rule.interval} days`;
    case "weekdays":
      return "Every weekday";
    case "weekly":
      if (rule.daysOfWeek?.length) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return `Every ${rule.daysOfWeek.map((d) => dayNames[d]).join(", ")}`;
      }
      return rule.interval === 1 ? "Every week" : `Every ${rule.interval} weeks`;
    case "monthly":
      return rule.interval === 1 ? "Every month" : `Every ${rule.interval} months`;
    case "yearly":
      return rule.interval === 1 ? "Every year" : `Every ${rule.interval} years`;
    case "custom":
      return `Every ${rule.interval} days`;
    default:
      return "Recurring";
  }
}
