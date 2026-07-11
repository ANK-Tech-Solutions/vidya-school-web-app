"use client";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(<div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 sm:items-center" role="presentation" onMouseDown={onClose}>
    <section aria-modal="true" aria-labelledby="dialog-title" role="dialog" className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between"><h2 id="dialog-title" className="font-display text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"><X size={18} /></button></div>
      {children}
    </section>
  </div>, document.body);
}
