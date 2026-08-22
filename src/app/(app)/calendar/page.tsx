"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-data";
import { useUIStore } from "@/stores/ui-store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const { data: tasks } = useTasks({ completed: false });
  const openDetail = useUIStore((s) => s.openDetail);

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startDay = monthStart.getDay();

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [startDay, daysInMonth]);

  const getTasksForDay = (day: number) => {
    if (!tasks) return [];
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const td = new Date(t.dueDate);
      return td.getFullYear() === date.getFullYear() && td.getMonth() === date.getMonth() && td.getDate() === date.getDate();
    });
  };

  const today = new Date();

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
            className="rounded-lg border border-border p-1.5 text-text-dim hover:text-text">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
            className="rounded-lg border border-border p-1.5 text-text-dim hover:text-text">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setViewDate(new Date())}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim hover:text-text">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-surface-1 px-2 py-2 text-center text-xs font-semibold text-text-dim">{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="bg-surface min-h-[100px]" />;
          const dayTasks = getTasksForDay(day);
          const isToday = today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
          return (
            <div key={day} className={cn("bg-surface min-h-[100px] p-1.5", isToday && "bg-primary/5")}>
              <span className={cn("text-xs font-medium", isToday ? "text-primary-1" : "text-text-dim")}>{day}</span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <button key={t._id} onClick={() => openDetail(t._id)}
                    className={cn("block w-full truncate rounded px-1 py-0.5 text-[10px] text-left",
                      t.completed ? "bg-success/10 text-success" : "bg-primary/10 text-primary-1")}>
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-[10px] text-text-dim">+{dayTasks.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
