"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useKeyboardShortcuts() {
  const { openQuickAdd, closeQuickAdd, openSearch, closeSearch, closeDetail, focusMode, setFocusMode } =
    useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "Escape") {
        closeQuickAdd();
        closeSearch();
        closeDetail();
        if (focusMode) setFocusMode(false);
        return;
      }

      if (isInput) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openQuickAdd();
      }

      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        openSearch();
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openQuickAdd, closeQuickAdd, openSearch, closeSearch, closeDetail, focusMode, setFocusMode]);
}
