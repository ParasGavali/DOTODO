"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useCreateTask } from "@/hooks/use-data";
import { parseTask } from "@/lib/nlp";
import { X } from "lucide-react";

export function QuickAdd() {
  const { quickAddOpen, closeQuickAdd } = useUIStore();
  const [text, setText] = useState("");
  const [interpretation, setInterpretation] = useState<ReturnType<typeof parseTask> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateTask();

  useEffect(() => {
    if (quickAddOpen) {
      setText("");
      setInterpretation(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickAddOpen]);

  useEffect(() => {
    if (text.length > 3) {
      const parsed = parseTask(text);
      if (parsed.dueDate || parsed.dueTime || parsed.priority > 0) {
        setInterpretation(parsed);
      } else {
        setInterpretation(null);
      }
    } else {
      setInterpretation(null);
    }
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const parsed = parseTask(text);

    await createMutation.mutateAsync({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate || undefined,
      dueTime: parsed.dueTime || undefined,
    });

    closeQuickAdd();
  };

  if (!quickAddOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeQuickAdd} />
      <div className="animate-fade-in relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 px-4 py-3">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a task... (e.g., Call Rahul tomorrow 5pm)"
              className="flex-1 bg-transparent text-sm text-text placeholder-text-dim outline-none"
            />
            <button type="button" onClick={closeQuickAdd} className="text-text-dim hover:text-text">
              <X size={16} />
            </button>
          </div>

          {interpretation && (
            <div className="border-t border-border px-4 py-2">
              <div className="flex flex-wrap gap-2 text-xs">
                {interpretation.dueDate && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary-1">
                    {interpretation.dueDate}
                  </span>
                )}
                {interpretation.dueTime && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary-1">
                    {interpretation.dueTime}
                  </span>
                )}
                {interpretation.priority > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary-1">
                    P{5 - interpretation.priority}
                  </span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
