import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-teal-500/10", className)} {...props}>{children}</select>;
}
