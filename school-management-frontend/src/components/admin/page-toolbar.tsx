import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PageToolbar({ search, onSearch, actionLabel, onAction }: { search: string; onSearch: (value: string) => void; actionLabel: string; onAction: () => void }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3.5 top-3 text-[var(--muted-foreground)]" size={17} /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search records…" className="pl-10" /></div><Button onClick={onAction}><Plus size={17} />{actionLabel}</Button></div>;
}
