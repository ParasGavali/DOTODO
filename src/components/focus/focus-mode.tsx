"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useTasks, useCompleteTask } from "@/hooks/use-data";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";

export function FocusMode() {
  const { focusMode, setFocusMode, selectedTaskId, openDetail, closeDetail } = useUIStore();
  const { data: tasks } = useTasks({ completed: false });
  const completeMutation = useCompleteTask();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const incompleteTasks = tasks?.filter((t) => !t.completed && !t.parentTaskId) || [];
  const currentTask = incompleteTasks[currentIndex];

  useEffect(() => {
    if (!focusMode) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [focusMode, currentIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!focusMode) return;
      if (e.key === "Escape") setFocusMode(false);
      if (e.key === "c" || e.key === "C") handleComplete();
      if (e.key === "ArrowRight" || e.key === "n") handleNext();
      if (e.key === "ArrowLeft" || e.key === "p") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusMode, currentIndex, incompleteTasks]);

  const handleComplete = () => {
    if (currentTask) {
      completeMutation.mutate(currentTask._id);
      if (currentIndex >= incompleteTasks.length - 1) {
        setCurrentIndex(Math.max(0, incompleteTasks.length - 2));
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < incompleteTasks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setElapsed(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setElapsed(0);
    }
  };

  if (!focusMode) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg">
      <button onClick={() => setFocusMode(false)}
        className="absolute top-6 right-6 text-text-dim hover:text-text">
        <X size={24} />
      </button>

      {currentTask ? (
        <div className="animate-fade-in max-w-lg px-8 text-center">
          <p className="mb-2 text-xs text-text-dim">
            {currentIndex + 1} / {incompleteTasks.length}
          </p>
          <h1 className="mb-8 text-3xl font-bold leading-tight">{currentTask.title}</h1>

          <div className="mb-8 flex items-center justify-center gap-2 text-2xl font-mono text-primary-1">
            <Clock size={20} />
            {formatTime(elapsed)}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={handlePrev} disabled={currentIndex === 0}
              className="rounded-lg border border-border p-3 text-text-dim hover:text-text disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleComplete}
              className="rounded-lg bg-success px-8 py-3 text-sm font-medium text-white hover:opacity-90">
              Complete
            </button>
            <button onClick={handleNext} disabled={currentIndex === incompleteTasks.length - 1}
              className="rounded-lg border border-border p-3 text-text-dim hover:text-text disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>

          <p className="mt-8 text-xs text-text-dim">
            C = complete · Arrow keys = navigate · Esc = exit
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-text-muted">No tasks to focus on.</p>
          <button onClick={() => setFocusMode(false)}
            className="mt-4 text-sm text-primary hover:text-primary-1">Exit Focus Mode</button>
        </div>
      )}
    </div>
  );
}
