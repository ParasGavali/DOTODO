"use client";

export default function SettingsPage() {
  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-text-muted">Manage your space.</p>

      <div className="mt-6 max-w-2xl space-y-4">
        {[
          { label: "Account", desc: "Manage your Owner Key and email" },
          { label: "Space", desc: "Rename or configure your space" },
          { label: "Appearance", desc: "Theme and display settings" },
          { label: "Notifications", desc: "Browser and email notifications" },
          { label: "Sharing", desc: "Manage share links and members" },
          { label: "Devices", desc: "Authorized sessions" },
          { label: "Privacy", desc: "Data practices and controls" },
          { label: "Export", desc: "Download your data" },
          { label: "Keyboard Shortcuts", desc: "View all shortcuts" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-text-dim">{item.desc}</p>
            </div>
            <span className="text-text-dim">&rarr;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
