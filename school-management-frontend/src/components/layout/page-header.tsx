import type { ReactNode } from "react";
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 text-[var(--muted-foreground)]">{description}</p></div>{action}</div>;
}
