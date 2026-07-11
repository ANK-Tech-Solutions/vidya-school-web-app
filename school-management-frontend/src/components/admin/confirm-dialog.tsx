"use client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function ConfirmDialog({ open, onClose, onConfirm, title = "Deactivate record", description = "This record will no longer be available for active operations.", loading = false }: { open: boolean; onClose: () => void; onConfirm: () => void; title?: string; description?: string; loading?: boolean }) {
  return <Dialog open={open} onClose={onClose} title={title}><p className="text-sm text-[var(--muted-foreground)]">{description}</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={loading}>{loading ? "Deactivating…" : "Deactivate"}</Button></div></Dialog>;
}
