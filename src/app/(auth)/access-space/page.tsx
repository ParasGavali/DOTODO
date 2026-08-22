"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessSpacePage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatKey = (value: string) => {
    const clean = value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    }
    return clean;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value);
    if (formatted.length <= 9) {
      setKey(formatted);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (key.length !== 9) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerKey: key }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid Owner Key");
        return;
      }

      localStorage.setItem("dotodo_owner_key", key);
      router.push("/inbox");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md text-center">
        <h1 className="mb-2 text-3xl font-bold">Access your space</h1>
        <p className="mb-8 text-text-muted">
          Enter your Owner Key to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={key}
            onChange={handleChange}
            placeholder="D7K4-X92M"
            autoFocus
            maxLength={9}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-widest text-text placeholder-text-dim uppercase outline-none transition-colors focus:border-primary"
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={key.length !== 9 || loading}
            className="w-full rounded-lg bg-primary py-3.5 font-medium text-white transition-all hover:bg-primary-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Accessing..." : "Enter space"}
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
