"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSpacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/owners/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create space");
        return;
      }

      setOwnerKey(data.ownerKey);
      setRoomId(data.roomId);
      localStorage.setItem("dotodo_owner_key", data.ownerKey);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type: "room" | "key") => {
    const value = type === "room" ? roomId : ownerKey;
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    }
  };

  const handleContinue = () => {
    router.push("/inbox");
  };

  // Step 2: Show Room ID (before Owner Key)
  if (roomId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="animate-fade-in w-full max-w-md text-center">
          <div className="mb-6 text-5xl">&#x1F3E0;</div>
          <h1 className="mb-2 text-2xl font-bold">Your Room ID</h1>
          <p className="mb-8 text-text-muted">
            Share this Room ID with others so they can find and join your space.
          </p>

          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-4">
            <code className="select-all font-mono text-xl font-bold tracking-widest text-primary-1">
              {roomId}
            </code>
          </div>

          <button
            onClick={() => handleCopy("room")}
            className="mb-6 w-full rounded-lg border border-border py-2.5 text-sm text-text-muted transition-all hover:border-primary hover:text-primary"
          >
            {copied === "room" ? "Copied!" : "Copy Room ID"}
          </button>

          <button
            onClick={() => setRoomId(null)}
            className="w-full rounded-lg bg-primary py-3.5 font-medium text-white transition-all hover:bg-primary-dim active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Show Owner Key
  if (ownerKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="animate-fade-in w-full max-w-md text-center">
          <div className="mb-6 text-5xl">&#x1F511;</div>
          <h1 className="mb-2 text-2xl font-bold">Your Owner Key</h1>
          <p className="mb-8 text-text-muted">
            Save this key somewhere safe. It&apos;s the only way to access your space.
          </p>

          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-4">
            <code className="select-all font-mono text-2xl font-bold tracking-widest text-primary-1">
              {ownerKey}
            </code>
          </div>

          <button
            onClick={() => handleCopy("key")}
            className="mb-6 w-full rounded-lg border border-border py-2.5 text-sm text-text-muted transition-all hover:border-primary hover:text-primary"
          >
            {copied === "key" ? "Copied!" : "Copy to clipboard"}
          </button>

          <div className="mb-6 rounded-lg border border-warning/20 bg-warning/5 p-4">
            <p className="text-sm text-warning">
              This key will not be shown again. Write it down or save it securely.
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full rounded-lg bg-primary py-3.5 font-medium text-white transition-all hover:bg-primary-dim active:scale-[0.98]"
          >
            Enter my space
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Name input
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md text-center">
        <h1 className="mb-2 text-3xl font-bold">Create your space</h1>
        <p className="mb-8 text-text-muted">
          Enter your name to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            maxLength={100}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3.5 text-text placeholder-text-dim outline-none transition-colors focus:border-primary"
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full rounded-lg bg-primary py-3.5 font-medium text-white transition-all hover:bg-primary-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create space"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-text-dim hover:text-text-muted"
        >
          Back
        </button>
      </div>
    </div>
  );
}
