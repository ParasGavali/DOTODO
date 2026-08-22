"use client";

import { useState } from "react";
import { useProjects, useCreateProject } from "@/hooks/use-data";
import { useRouter } from "next/navigation";
import { Plus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createMutation.mutateAsync({ name: name.trim() });
    setName("");
    setShowNew(false);
  };

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-text-muted">Organize your work.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dim">
          <Plus size={14} /> New Project
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary" />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dim">Create</button>
          <button type="button" onClick={() => setShowNew(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-dim hover:text-text">Cancel</button>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-1" />)}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <button key={p._id} onClick={() => router.push(`/projects/${p._id}`)}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-1">
              <div className="rounded-lg p-2" style={{ backgroundColor: p.color + "20" }}>
                <Folder size={18} style={{ color: p.color }} />
              </div>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-text-dim">{(p as any).taskCount || 0} tasks</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-4xl opacity-20">&#x1F4C2;</div>
          <p className="text-sm text-text-dim">No projects yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
