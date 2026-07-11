"use client";
import { useEffect, useState } from "react";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/empty-state";
import { adminNotificationService, notificationService } from "@/services/notification.service";
import type { BroadcastNotificationRequest, Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialBroadcast: BroadcastNotificationRequest = { title: "", body: "", type: "GENERAL" };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [broadcast, setBroadcast] = useState(initialBroadcast);
  const [sending, setSending] = useState(false);
  const load = () => notificationService.list({ size: 50 }).then((data) => setItems(data.content)).catch(() => toast.error("Could not load notifications"));
  useEffect(() => { void load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const notification = await adminNotificationService.broadcast(broadcast);
      setItems((current) => [notification, ...current]);
      setBroadcast(initialBroadcast);
      setDialogOpen(false);
      toast.success("Notification broadcast");
    } catch { toast.error("Could not broadcast notification"); } finally { setSending(false); }
  };
  return <><PageHeader eyebrow="Updates" title="Notifications" description="Recent activity and important transport updates." action={<Button onClick={() => setDialogOpen(true)}><Send size={16} />Broadcast</Button>} />
    <Card className="divide-y">{items.map((item) => <div key={item.id} className="flex gap-4 p-5"><span className="rounded-xl bg-amber-400/15 p-3 text-[var(--accent-foreground)]"><Bell size={18} /></span><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.message}</p><p className="mt-2 text-xs text-[var(--muted-foreground)]">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recent"}</p></div></div>)}{!items.length && <EmptyState title="You are all caught up" description="New transport activity will appear here." />}</Card>
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Broadcast notification"><form className="space-y-4" onSubmit={submit}><div><Label htmlFor="title">Title</Label><Input id="title" className="mt-1" maxLength={200} required value={broadcast.title} onChange={(event) => setBroadcast({ ...broadcast, title: event.target.value })} /></div><div><Label htmlFor="body">Message</Label><textarea id="body" className="mt-1 min-h-24 w-full rounded-md border bg-transparent p-2 text-sm" maxLength={1000} required value={broadcast.body} onChange={(event) => setBroadcast({ ...broadcast, body: event.target.value })} /></div><div><Label htmlFor="type">Type</Label><select id="type" className="mt-1 h-10 w-full rounded-md border bg-transparent px-2 text-sm" value={broadcast.type} onChange={(event) => setBroadcast({ ...broadcast, type: event.target.value as BroadcastNotificationRequest["type"] })}>{["GENERAL", "SYSTEM", "EMERGENCY", "BUS_STARTED", "TRIP_COMPLETED", "ATTENDANCE"].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={sending}>{sending ? "Sending…" : "Broadcast"}</Button></div></form></Dialog>
  </>;
}
