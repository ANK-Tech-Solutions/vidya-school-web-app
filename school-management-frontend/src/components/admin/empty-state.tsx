import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title = "Nothing here yet", description = "Create your first record to get started.", action }: { title?: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center"><span className="rounded-2xl bg-teal-500/10 p-4 text-[var(--primary)]"><Inbox size={26} /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm text-[var(--muted-foreground)]">{description}</p>{action && <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>}</div>;
}
