"use client";

import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import { RotateCcw, Trash2 } from "lucide-react";

export default function CompletedPage() {
  const { data: tasks, isLoading } = useTasks({ completed: true });
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const handleRestore = (id: string) => {
    updateMutation.mutate({ id, completed: false, completedAt: undefined } as never);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Completed</h1>
      <p className="mt-1 text-sm text-text-muted">Everything you&apos;ve done.</p>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-1" />)}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="mt-4 space-y-0.5">
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-text-dim">
              <span className="text-success">&#x2713;</span>
              <span className="flex-1 text-sm line-through">{task.title}</span>
              {task.completedAt && (
                <span className="text-xs">{new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              )}
              <button onClick={() => handleRestore(task._id)} className="text-text-dim hover:text-primary" title="Restore">
                <RotateCcw size={14} />
              </button>
              <button onClick={() => handleDelete(task._id)} className="text-text-dim hover:text-danger" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl opacity-20">&#x2705;</div>
          <p className="text-sm text-text-dim">Nothing completed yet.</p>
        </div>
      )}
    </div>
  );
}
