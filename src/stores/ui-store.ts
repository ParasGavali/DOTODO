import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  focusMode: boolean;
  detailPanelOpen: boolean;
  selectedTaskId: string | null;
  quickAddOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setFocusMode: (on: boolean) => void;
  openDetail: (taskId: string) => void;
  closeDetail: () => void;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  focusMode: false,
  detailPanelOpen: false,
  selectedTaskId: null,
  quickAddOpen: false,
  searchOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setFocusMode: (on) => set({ focusMode: on }),
  openDetail: (taskId) => set({ selectedTaskId: taskId, detailPanelOpen: true }),
  closeDetail: () => set({ selectedTaskId: null, detailPanelOpen: false }),
  openQuickAdd: () => set({ quickAddOpen: true }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
