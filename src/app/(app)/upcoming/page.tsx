"use client";

export default function UpcomingPage() {
  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Upcoming</h1>
      <p className="mt-1 text-sm text-text-muted">What&apos;s on the horizon.</p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl opacity-20">&#x1F4C5;</div>
        <p className="text-sm text-text-dim">No upcoming tasks.</p>
      </div>
    </div>
  );
}
