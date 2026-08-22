"use client";

import { use, useState, useEffect } from "react";

interface SharedData {
  permission: string;
  spaceName: string;
  tasks: { _id: string; title: string; completed: boolean; priority: number; dueDate?: string }[];
  projects: { _id: string; name: string; color: string }[];
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error);
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Share Link Unavailable</h1>
        <p className="text-text-muted">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg font-bold">DOTODO</h1>
            <p className="text-xs text-text-dim">Shared space: {data.spaceName}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary-1 capitalize">{data.permission}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-text-dim">Projects</h2>
            <div className="flex gap-2 flex-wrap">
              {data.projects.map((p) => (
                <span key={p._id} className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: p.color + "20", color: p.color }}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold text-text-dim">Tasks</h2>
        {data.tasks.length > 0 ? (
          <div className="space-y-1">
            {data.tasks.map((t) => (
              <div key={t._id} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${t.completed ? "opacity-50" : ""}`}>
                <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${t.completed ? "border-success bg-success" : "border-border-1"}`} />
                <span className={`text-sm ${t.completed ? "line-through text-text-dim" : ""}`}>{t.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-dim py-8 text-center">No tasks in this space.</p>
        )}

        {data.permission === "viewer" && (
          <p className="mt-8 text-center text-xs text-text-dim">You&apos;re viewing as a read-only guest.</p>
        )}
      </main>
    </div>
  );
}
