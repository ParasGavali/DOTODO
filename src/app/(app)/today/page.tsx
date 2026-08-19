"use client";

export default function TodayPage() {
  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Today</h1>
      <p className="mt-1 text-sm text-text-muted">What needs to happen now.</p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl opacity-20">&#x2728;</div>
        <p className="text-sm text-text-dim">You&apos;re clear for today.</p>
      </div>
    </div>
  );
}
