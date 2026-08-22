"use client";

import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-data";
import { useUIStore } from "@/stores/ui-store";
import { TaskItem } from "./task-item";
import { cn } from "@/lib/utils";
import { X, Trash2, Calendar, Flag, Tag, Clock, ChevronDown, ChevronRight } from "lucide-react";

export function TaskDetail() {
  const { selectedTaskId, detailPanelOpen, closeDetail } = useUIStore();
  const { data: tasks } = useTasks();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const [showSubtasks, setShowSubtasks] = useState(true);

  const task = tasks?.find((t) => t._id === selectedTaskId);
  if (!task || !detailPanelOpen) return null;

  const handleUpdate = (field: string, value: unknown) => {
    updateMutation.mutate({ id: task._id, [field]: value } as Parameters<typeof updateMutation.mutate>[0]);
  };

  const handleDelete = () => {
    if (confirm("Delete this task and all subtasks?")) {
      deleteMutation.mutate(task._id);
      closeDetail();
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="animate-slide-in flex h-full w-80 flex-col border-l border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-text-muted">Task Details</h3>
        <button onClick={closeDetail} className="text-text-dim hover:text-text">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={task.title}
          onChange={(e) => handleUpdate("title", e.target.value)}
          className="w-full bg-transparent text-lg font-medium text-text outline-none"
        />

        {/* Description */}
        <textarea
          value={task.description || ""}
          onChange={(e) => handleUpdate("description", e.target.value)}
          placeholder="Add a description..."
          className="w-full resize-none rounded-lg border border-border bg-surface-1 p-3 text-sm text-text placeholder-text-dim outline-none focus:border-primary"
          rows={3}
        />

        {/* Priority */}
        <div className="flex items-center gap-3">
          <Flag size={16} className="text-text-dim" />
          <select
            value={task.priority}
            onChange={(e) => handleUpdate("priority", parseInt(e.target.value))}
            className="bg-transparent text-sm text-text outline-none cursor-pointer"
          >
            <option value={0}>No priority</option>
            <option value={1}>P4 - Low</option>
            <option value={2}>P3 - Medium</option>
            <option value={3}>P2 - High</option>
            <option value={4}>P1 - Urgent</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-text-dim" />
          <input
            type="date"
            value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
            onChange={(e) => handleUpdate("dueDate", e.target.value || null)}
            className="bg-transparent text-sm text-text outline-none cursor-pointer"
          />
        </div>

        {/* Due Time */}
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-text-dim" />
          <input
            type="time"
            value={task.dueTime || ""}
            onChange={(e) => handleUpdate("dueTime", e.target.value || null)}
            className="bg-transparent text-sm text-text outline-none cursor-pointer"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-dim">Notes</label>
          <textarea
            value={task.notes || ""}
            onChange={(e) => handleUpdate("notes", e.target.value)}
            placeholder="Add notes..."
            className="w-full resize-none rounded-lg border border-border bg-surface-1 p-3 text-sm text-text placeholder-text-dim outline-none focus:border-primary"
            rows={3}
          />
        </div>

        {/* Subtasks placeholder */}
        <div>
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex items-center gap-1 text-xs font-medium text-text-dim"
          >
            {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Subtasks
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-sm text-danger/70 hover:text-danger"
        >
          <Trash2 size={14} />
          Delete task
        </button>
      </div>

      {/* Meta */}
      <div className="border-t border-border px-4 py-2 text-xs text-text-dim">
        Created {formatDate(task.createdAt)}
        {task.completedAt && ` · Completed ${formatDate(task.completedAt)}`}
      </div>
    </div>
  );
}
