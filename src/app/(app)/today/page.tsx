"use client";

import { useTasks } from "@/hooks/use-data";
import { TaskItem } from "@/components/task/task-item";
import { TaskInput } from "@/components/task/task-input";

export default function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const { data: allTasks, isLoading } = useTasks({ completed: false });

  const todayTasks = allTasks?.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toISOString().split("T")[0] === today;
  }) || [];

  const overdueTasks = allTasks?.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(23, 59, 59, 999);
    return d < new Date() && !t.completed;
  }) || [];

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Today</h1>
      <p className="mt-1 text-sm text-text-muted">
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      <div className="mt-4 px-6 pb-4 border-b border-border">
        <TaskInput placeholder="Add a task for today..." />
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4 px-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-1" />)}
        </div>
      ) : (
        <div className="px-6 py-4 space-y-6">
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-danger">Overdue</h2>
              <div className="space-y-0.5">
                {overdueTasks.map((task) => <TaskItem key={task._id} task={task} />)}
              </div>
            </div>
          )}

          {todayTasks.length > 0 ? (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-dim">Due Today</h2>
              <div className="space-y-0.5">
                {todayTasks.map((task) => <TaskItem key={task._id} task={task} />)}
              </div>
            </div>
          ) : overdueTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-4xl opacity-20">&#x2728;</div>
              <p className="text-sm text-text-dim">You&apos;re clear for today.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
