import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Copy, Link2, Trash2 } from "lucide-react";

interface ShareDialogProps {
  spaceId: string;
  onClose: () => void;
}

export function ShareDialog({ spaceId, onClose }: ShareDialogProps) {
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, permission }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      const url = `${window.location.origin}/s/${data.token}`;
      setCreatedLink(url);
    },
  });

  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-in relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Share Space</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text"><X size={18} /></button>
        </div>

        {!createdLink ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted">Permission</label>
              <select value={permission} onChange={(e) => setPermission(e.target.value as "viewer" | "editor")}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text outline-none">
                <option value="viewer">Viewer - Can only view</option>
                <option value="editor">Editor - Can create and edit tasks</option>
              </select>
            </div>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dim disabled:opacity-50">
              {createMutation.isPending ? "Creating..." : "Generate share link"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Anyone with this link can access your space as a {permission}.</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 p-3">
              <Link2 size={16} className="text-text-dim" />
              <input readOnly value={createdLink}
                className="flex-1 bg-transparent text-xs text-text outline-none" />
              <button onClick={handleCopy} className="text-primary hover:text-primary-1">
                <Copy size={16} />
              </button>
            </div>
            {copied && <p className="text-xs text-success">Copied to clipboard!</p>}
            <button onClick={onClose}
              className="w-full rounded-lg border border-border py-2.5 text-sm text-text-muted hover:text-text">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
