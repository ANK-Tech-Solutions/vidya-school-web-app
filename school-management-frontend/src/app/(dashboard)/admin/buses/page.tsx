"use client";
import { PageHeader } from "@/components/layout/page-header";
import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { busService } from "@/services/bus.service";
import type { Bus } from "@/types/bus";

export default function BusesPage() { return <><PageHeader eyebrow="Fleet" title="Buses" description="Keep every vehicle and its operating status in view." /><EntityManager<Bus> title="Buses" fields={[{ name: "busNumber", label: "Bus number" }, { name: "plateNumber", label: "Plate number" }, { name: "capacity", label: "Capacity", type: "number" }, { name: "make", label: "Make" }, { name: "model", label: "Model" }, { name: "status", label: "Status (ACTIVE, MAINTENANCE, INACTIVE, RETIRED)" }]} list={busService.list} create={busService.create} update={busService.update} deactivate={busService.deactivate} row={(b) => <div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{b.busNumber} <span className="font-normal text-[var(--muted-foreground)]">· {b.plateNumber}</span></p><p className="text-xs text-[var(--muted-foreground)]">{b.make ?? "Bus"} {b.model ?? ""} · {b.capacity} seats</p></div><Badge variant={b.status === "ACTIVE" ? "default" : b.status === "MAINTENANCE" ? "amber" : "slate"}>{b.status}</Badge></div>} /></>; }
