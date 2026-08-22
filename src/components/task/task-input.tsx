"use client";

import { useState, useRef, useEffect } from "react";
import { useCreateTask } from "@/hooks/use-data";
import { Plus } from "lucide-react";

interface TaskInputProps {
  projectId?: string;
  parentTaskId?: string;
  placeholder?: string;
  onCreated?: () => void;
}

export function TaskInput({ projectId, parentTaskId, placeholder, onCreated }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateTask();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createMutation.mutateAsync({
      title: title.trim(),
      projectId,
      parentTaskId,
    });

    setTitle("");
    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 group">
      <div className="flex-shrink-0 text-text-dim group-focus-within:text-primary">
        <Plus size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder || "Add a task... (e.g., Call Rahul tomorrow)"}
        className="flex-1 bg-transparent text-sm text-text placeholder-text-dim outline-none"
      />
    </form>
  );
}
