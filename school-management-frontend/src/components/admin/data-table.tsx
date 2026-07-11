import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function DataTable({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) {
  return <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">{title && <h2 className="font-display text-lg font-bold">{title}</h2>}{actions}</div><div className="overflow-x-auto">{children}</div></Card>;
}
