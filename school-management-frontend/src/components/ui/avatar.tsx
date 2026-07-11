import { cn } from "@/lib/utils";
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div aria-label={name} className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white", className)}>{initials}</div>;
}
