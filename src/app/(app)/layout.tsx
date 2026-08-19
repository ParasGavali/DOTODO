"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Calendar,
  CheckCircle2,
  Folder,
  Sparkles,
  Settings,
  Sun,
  ChevronDown,
  Menu,
  X,
  Clock,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Today", href: "/today", icon: Sun },
  { label: "Upcoming", href: "/upcoming", icon: Clock },
];

const ORGANIZE_ITEMS = [
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Completed", href: "/completed", icon: CheckCircle2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("DOTODO");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.spaceId) {
          router.replace("/");
        }
      })
      .catch(() => router.replace("/"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link href="/inbox" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">DOTODO</span>
              <span className="text-xs font-medium text-primary-1">Think it.</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-dim hover:text-text"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* Main */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary-1"
                    : "text-text-muted hover:bg-surface-1 hover:text-text"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}

            {/* Projects section */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  Projects
                </span>
              </div>
              <Link
                href="/projects"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/projects" || pathname.startsWith("/projects/")
                    ? "bg-primary/10 text-primary-1"
                    : "text-text-muted hover:bg-surface-1 hover:text-text"
                )}
              >
                <Folder size={18} />
                All Projects
              </Link>
            </div>

            {/* Organize */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  Organize
                </span>
              </div>
              {ORGANIZE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary-1"
                      : "text-text-muted hover:bg-surface-1 hover:text-text"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* AI */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  Intelligence
                </span>
              </div>
              <Link
                href="/ai"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/ai"
                    ? "bg-primary/10 text-primary-1"
                    : "text-text-muted hover:bg-surface-1 hover:text-text"
                )}
              >
                <Sparkles size={18} />
                AI
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-3 space-y-1">
            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/settings")
                  ? "bg-primary/10 text-primary-1"
                  : "text-text-muted hover:bg-surface-1 hover:text-text"
              )}
            >
              <Settings size={18} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface/50 px-4 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-muted hover:text-text"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <span className="text-sm font-medium text-text-dim">{spaceName}</span>
        </header>

        {/* Page content */}
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
