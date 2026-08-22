"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, GripVertical } from "lucide-react";
import { useCompleteTask } from "@/hooks/use-data";
import { useUIStore } from "@/stores/ui-store";

interface TaskItemProps {
  task: {
    _id: string;
    title: string;
    completed: boolean;
    priority: number;
    dueDate?: string;
    dueTime?: string;
    labels?: string[];
  };
  showProject?: boolean;
}

const PRIORITY_COLORS: Record<number, string> = {
  0: "",
  1: "text-blue-500",
  2: "text-amber-500",
  3: "text-orange-500",
  4: "text-red-500",
};

export function TaskItem({ task, showProject }: TaskItemProps) {
  const completeMutation = useCompleteTask();
  const openDetail = useUIStore((s: { openDetail: (id: string) => void }) => s.openDetail);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeMutation.mutate(task._id);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff < -1) return `${Math.abs(diff)}d overdue`;
    if (diff <= 7) return `${diff}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={() => openDetail(task._id)}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface cursor-pointer",
        task.completed && "opacity-50"
      )}
    >
      <button onClick={handleToggle} className="flex-shrink-0">
        {task.completed ? (
          <Check size={18} className="text-success" />
        ) : (
          <Circle size={18} className="text-border-1 transition-colors hover:text-primary" />
        )}
      </button>

      <span
        className={cn(
          "flex-1 text-sm",
          task.completed && "line-through text-text-dim"
        )}
      >
        {task.title}
      </span>

      <div className="flex items-center gap-2">
        {task.priority > 0 && (
          <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>
            P{5 - task.priority}
          </span>
        )}
        {task.dueDate && (
          <span
            className={cn(
              "text-xs",
              new Date(task.dueDate) < new Date() && !task.completed
                ? "text-danger"
                : "text-text-dim"
            )}
          >
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
