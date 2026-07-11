"use client";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type Field = { name: string; label: string; type?: string; hint?: string };
type RecordValue = { id: number; active?: boolean };
export function EntityManager<T extends RecordValue>({ title, fields, list, create, update, deactivate, row }: { title: string; fields: Field[]; list: (params?: Record<string, unknown>) => Promise<{ content: T[] }>; create: (value: never) => Promise<unknown>; update: (id: number, value: never) => Promise<unknown>; deactivate?: (id: number) => Promise<unknown>; row: (item: T) => React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]), [loading, setLoading] = useState(true), [editing, setEditing] = useState<T | null>(null), [open, setOpen] = useState(false), [target, setTarget] = useState<T | null>(null); const form = useForm<Record<string, unknown>>();
  const load = useCallback(() => { setLoading(true); list({ size: 100 }).then((data) => setItems(data.content)).catch(() => toast.error(`Could not load ${title.toLowerCase()}`)).finally(() => setLoading(false)); }, [list, title]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const show = (item?: T) => { setEditing(item ?? null); form.reset(item ?? {}); setOpen(true); };
  const save = async (value: Record<string, unknown>) => { try { if (editing) await update(editing.id, value as never); else await create(value as never); toast.success(`${title.slice(0, -1)} saved`); setOpen(false); load(); } catch { toast.error(`Could not save ${title.slice(0, -1).toLowerCase()}`); } };
  const remove = async () => { if (!target || !deactivate) return; try { await deactivate(target.id); toast.success(`${title.slice(0, -1)} deactivated`); setTarget(null); load(); } catch { toast.error("Could not deactivate record"); } };
  return <><DataTable title={`${items.length} ${title.toLowerCase()}`} actions={<Button size="sm" onClick={() => show()}>Add {title.slice(0, -1)}</Button>}><div className="hidden md:block"><table className="w-full text-left text-sm"><tbody>{loading ? <tr><td className="p-4"><Skeleton className="h-12 w-full" /></td></tr> : items.map((item) => <tr key={item.id} className="border-t"><td className="p-4">{row(item)}</td><td className="w-24 pr-4 text-right"><button className="p-2 text-[var(--primary)]" onClick={() => show(item)} aria-label="Edit"><Pencil size={16} /></button>{item.active !== false && deactivate && <button className="p-2 text-red-500" onClick={() => setTarget(item)} aria-label="Deactivate"><Power size={16} /></button>}</td></tr>)}</tbody></table></div>{!loading && !items.length && <EmptyState title={`No ${title.toLowerCase()} found`} action={{ label: `Add ${title.slice(0, -1)}`, onClick: () => show() }} />}<div className="divide-y md:hidden">{items.map((item) => <div key={item.id} className="p-4">{row(item)}</div>)}</div></DataTable><Dialog open={open} onClose={() => setOpen(false)} title={`${editing ? "Edit" : "Add"} ${title.slice(0, -1)}`}><form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(save)}>{fields.map((field) => <div key={field.name}><Label>{field.label}</Label><Input className="mt-1" type={field.type} {...form.register(field.name)} />{field.hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.hint}</p>}</div>)}<div className="sm:col-span-2 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div></form></Dialog><ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={remove} /></>;
}
