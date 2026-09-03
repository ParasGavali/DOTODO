"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { ShareDialog } from "@/components/share/share-dialog";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [ownerKey, setOwnerKey] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      setSpaceId(d.spaceId);
      setRoomId(d.roomId ?? null);
    });
    const key = localStorage.getItem("dotodo_owner_key");
    if (key) setOwnerKey(key);
  }, []);

  const handleCopy = (what: "key" | "room") => {
    const value = what === "key" ? ownerKey : roomId ?? "";
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "sharing", label: "Sharing" },
    { id: "export", label: "Export Data" },
    { id: "shortcuts", label: "Keyboard Shortcuts" },
  ];

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="mt-6 flex gap-6">
        <nav className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary/10 text-primary-1" : "text-text-muted hover:bg-surface-1"
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="text-sm font-medium mb-2">Room ID</h3>
                <p className="text-xs text-text-dim mb-3">Share this Room ID with others so they can find and join your space.</p>
                {roomId ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-border bg-bg px-4 py-3 font-mono text-lg font-bold tracking-widest text-primary-1 select-all">
                      {roomId}
                    </div>
                    <button
                      onClick={() => handleCopy("room")}
                      className="shrink-0 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      {copied === "room" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-text-dim">No Room ID found for this space.</p>
                )}
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="text-sm font-medium mb-2">Owner Key</h3>
                <p className="text-xs text-text-dim mb-3">Your Owner Key is the only way to access your space. Keep it safe.</p>
                {ownerKey ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-border bg-bg px-4 py-3 font-mono text-lg font-bold tracking-widest text-primary-1 select-all">
                      {ownerKey}
                    </div>
                    <button
                      onClick={() => handleCopy("key")}
                      className="shrink-0 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      {copied === "key" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                    <p className="text-sm text-warning">
                      Key not found in browser storage. If you cleared your browser data, you may need to access your space again with your key.
                    </p>
                  </div>
                )}
                <p className="mt-3 text-xs text-warning">If you lose your key and clear browser data, you will lose access to your data permanently.</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="text-sm font-medium mb-2">Appearance</h3>
                <p className="text-xs text-text-dim">Dark theme is currently the only option. More themes coming soon.</p>
              </div>
            </div>
          )}

          {activeTab === "sharing" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="text-sm font-medium mb-2">Share Your Space</h3>
                <p className="text-xs text-text-dim mb-3">Generate a share link that lets others view or edit your tasks without creating an account.</p>
                <button onClick={() => setShowShare(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dim">
                  Generate Share Link
                </button>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="text-sm font-medium mb-2">Export Your Data</h3>
                <p className="text-xs text-text-dim mb-3">Download all your tasks, projects, and labels.</p>
                <a href="/api/export" download
                  className="inline-block rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-surface-1">
                  Download JSON
                </a>
              </div>
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="text-sm font-medium mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {[
                  { key: "N", desc: "New task (Quick Add)" },
                  { key: "/", desc: "Search" },
                  { key: "F", desc: "Toggle Focus Mode" },
                  { key: "Esc", desc: "Close panel / modal" },
                  { key: "C", desc: "Complete task (in Focus Mode)" },
                  { key: "← →", desc: "Navigate tasks (in Focus Mode)" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-xs text-text-dim">{s.desc}</span>
                    <kbd className="rounded border border-border bg-surface-1 px-2 py-0.5 text-xs font-mono text-text-muted">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showShare && spaceId && <ShareDialog spaceId={spaceId} onClose={() => setShowShare(false)} />}
    </div>
  );
}
