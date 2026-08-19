"use client";

import { useState } from "react";

export default function InboxPage() {
  const [taskTitle, setTaskTitle] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    // Phase 3 will wire this up
    setTaskTitle("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="mt-1 text-sm text-text-muted">Capture everything.</p>
      </div>

      {/* Quick add */}
      <div className="px-6 pb-4">
        <form onSubmit={handleAddTask} className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 transition-colors focus-within:border-primary">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a task... (e.g., Call Rahul tomorrow)"
              className="w-full bg-transparent text-sm text-text placeholder-text-dim outline-none"
            />
          </div>
        </form>
      </div>

      {/* Task list */}
      <div className="flex-1 px-6">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl opacity-20">&#x1F4CB;</div>
          <p className="text-sm text-text-dim">Nothing here yet. Capture something.</p>
        </div>
      </div>
    </div>
  );
}
