import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchResult {
  tasks: { _id: string; title: string; projectId?: string }[];
  projects: { _id: string; name: string }[];
  labels: { _id: string; name: string; color: string }[];
}

export function GlobalSearch() {
  const { searchOpen, closeSearch, openDetail } = useUIStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSearch} />
      <div className="animate-fade-in relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <SearchIcon size={16} className="text-text-dim" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, labels..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text-dim outline-none" />
          <button onClick={closeSearch} className="text-text-dim hover:text-text"><X size={16} /></button>
        </div>
        {results && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.tasks.length === 0 && results.projects.length === 0 && results.labels.length === 0 && (
              <p className="py-4 text-center text-sm text-text-dim">No results found.</p>
            )}
            {results.tasks.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-text-dim">Tasks</p>
                {results.tasks.map((t) => (
                  <button key={t._id} onClick={() => { openDetail(t._id); closeSearch(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-text hover:bg-surface-1">
                    {t.title}
                  </button>
                ))}
              </div>
            )}
            {results.projects.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-text-dim">Projects</p>
                {results.projects.map((p) => (
                  <button key={p._id} onClick={() => { router.push(`/projects/${p._id}`); closeSearch(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-text hover:bg-surface-1">
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {results.labels.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-semibold text-text-dim">Labels</p>
                {results.labels.map((l) => (
                  <div key={l._id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {loading && <p className="py-4 text-center text-xs text-text-dim">Searching...</p>}
      </div>
    </div>
  );
}
