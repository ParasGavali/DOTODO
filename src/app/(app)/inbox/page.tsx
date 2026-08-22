"use client";

import { useTasks } from "@/hooks/use-data";
import { TaskItem } from "@/components/task/task-item";
import { TaskInput } from "@/components/task/task-input";

export default function InboxPage() {
  const { data: tasks, isLoading } = useTasks({ inbox: true, completed: false });

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="mt-1 text-sm text-text-muted">Capture everything.</p>
      </div>

      <div className="px-6 pb-4 border-b border-border">
        <TaskInput placeholder="Add a task... (e.g., Call Rahul tomorrow)" />
      </div>

      <div className="flex-1 px-6 py-2">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-1" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-0.5 py-2">
            {tasks.map((task) => <TaskItem key={task._id} task={task} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-4xl opacity-20">&#x1F4CB;</div>
            <p className="text-sm text-text-dim">Nothing here yet. Capture something.</p>
          </div>
        )}
      </div>
    </div>
  );
}
