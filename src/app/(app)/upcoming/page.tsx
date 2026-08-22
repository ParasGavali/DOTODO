"use client";

import { useTasks } from "@/hooks/use-data";
import { TaskItem } from "@/components/task/task-item";

export default function UpcomingPage() {
  const { data: tasks, isLoading } = useTasks({ completed: false });

  const upcoming = tasks?.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d > today;
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()) || [];

  const grouped: Record<string, typeof upcoming> = {};
  upcoming.forEach((t) => {
    const date = new Date(t.dueDate!).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(t);
  });

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Upcoming</h1>
      <p className="mt-1 text-sm text-text-muted">What&apos;s on the horizon.</p>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-1" />)}
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="mt-4 space-y-6">
          {Object.entries(grouped).map(([date, tasks]) => (
            <div key={date}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-dim">{date}</h2>
              <div className="space-y-0.5">
                {tasks.map((task) => <TaskItem key={task._id} task={task} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl opacity-20">&#x1F4C5;</div>
          <p className="text-sm text-text-dim">No upcoming tasks.</p>
        </div>
      )}
    </div>
  );
}
