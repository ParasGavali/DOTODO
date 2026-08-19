"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.spaceId) {
          router.replace("/inbox");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="animate-fade-in mb-16 text-center">
        <h1 className="mb-2 text-6xl font-bold tracking-tight">
          DOTODO
        </h1>
        <p className="mb-6 text-xl font-medium text-primary-1">Think it. Do it.</p>
        <p className="max-w-md text-lg text-text-muted">
          Get things out of your head and get them done.
        </p>
      </div>

      {/* Actions */}
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row">
        <button
          onClick={() => router.push("/create-space")}
          className="rounded-lg bg-primary px-8 py-3.5 font-medium text-white transition-all hover:bg-primary-dim hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
        >
          Create your space
        </button>
        <button
          onClick={() => router.push("/access-space")}
          className="rounded-lg border border-border px-8 py-3.5 font-medium text-text-muted transition-all hover:border-border-1 hover:text-text active:scale-[0.98]"
        >
          Access a space
        </button>
      </div>

      {/* Footer */}
      <p className="animate-fade-in mt-20 text-sm text-text-dim">
        No account required. Your data, your key.
      </p>
    </div>
  );
}
