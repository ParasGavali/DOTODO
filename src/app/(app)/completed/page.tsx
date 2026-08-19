"use client";

export default function CompletedPage() {
  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Completed</h1>
      <p className="mt-1 text-sm text-text-muted">Everything you&apos;ve done.</p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl opacity-20">&#x2705;</div>
        <p className="text-sm text-text-dim">Nothing completed yet.</p>
      </div>
    </div>
  );
}
