"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { QuickAdd } from "@/components/layout/quick-add";
import { GlobalSearch } from "@/components/search/global-search";
import { FocusMode } from "@/components/focus/focus-mode";
import { TaskDetail } from "@/components/task/task-detail";
import { useUIStore } from "@/stores/ui-store";
import {
  Inbox, Calendar, CheckCircle2, Folder, Sparkles, Settings, Menu, X, Clock, Plus, Search,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Today", href: "/today", icon: Clock },
  { label: "Upcoming", href: "/upcoming", icon: Calendar },
];

const ORGANIZE_ITEMS = [
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Completed", href: "/completed", icon: CheckCircle2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { detailPanelOpen, openQuickAdd, openSearch } = useUIStore();

  useKeyboardShortcuts();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => { if (!data.spaceId) router.replace("/"); })
      .catch(() => router.replace("/"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  const NavLink = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => (
    <Link href={item.href} onClick={() => setSidebarOpen(false)}
      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        pathname === item.href ? "bg-primary/10 text-primary-1" : "text-text-muted hover:bg-surface-1 hover:text-text")}>
      <item.icon size={18} />
      {item.label}
    </Link>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-200 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link href="/inbox" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">DOTODO</span>
              <span className="hidden sm:inline text-xs font-medium text-primary-1">Think it.</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-dim hover:text-text"><X size={18} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}

            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-text-dim">Projects</span>
              <Link href="/projects" onClick={() => setSidebarOpen(false)}
                className={cn("mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/projects") ? "bg-primary/10 text-primary-1" : "text-text-muted hover:bg-surface-1 hover:text-text")}>
                <Folder size={18} /> All Projects
              </Link>
            </div>

            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-text-dim">Organize</span>
              {ORGANIZE_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
            </div>

            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-text-dim">Intelligence</span>
              <NavLink item={{ label: "AI", href: "/ai", icon: Sparkles }} />
            </div>
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            <NavLink item={{ label: "Settings", href: "/settings", icon: Settings }} />
            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-border bg-surface/50 px-4 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-text-muted hover:text-text"><Menu size={20} /></button>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={openSearch}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim hover:text-text hover:border-border-1 transition-colors">
                <Search size={14} /> Search
              </button>
              <button onClick={openQuickAdd}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dim transition-colors">
                <Plus size={14} /> New Task
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>

        {detailPanelOpen && <TaskDetail />}
      </main>

      <QuickAdd />
      <GlobalSearch />
      <FocusMode />
    </div>
  );
}
