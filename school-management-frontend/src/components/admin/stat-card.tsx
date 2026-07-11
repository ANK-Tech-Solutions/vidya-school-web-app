import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon, tone = "text-[var(--primary)]" }: { label: string; value: string | number; icon: LucideIcon; tone?: string }) {
  return <Card className="p-5"><span className={`inline-flex rounded-xl bg-[var(--muted)] p-3 ${tone}`}><Icon size={20} /></span><p className="mt-6 text-3xl font-bold">{value}</p><p className="mt-1 text-sm font-medium text-[var(--muted-foreground)]">{label}</p></Card>;
}
