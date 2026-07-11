"use client";
import { PageHeader } from "@/components/layout/page-header";
import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { parentService } from "@/services/parent.service";
import type { Parent } from "@/types/parent";

export default function ParentsPage() { return <><PageHeader eyebrow="People" title="Parents" description="Manage parent accounts and contact details." /><EntityManager<Parent> title="Parents" fields={[{ name: "firstName", label: "First name" }, { name: "lastName", label: "Last name" }, { name: "username", label: "Username" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone" }, { name: "relationship", label: "Relationship" }, { name: "password", label: "Password", type: "password", hint: "Leave blank to use Password@123." }]} list={parentService.list} create={parentService.create} update={parentService.update} deactivate={parentService.deactivate} row={(p) => <div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{p.firstName} {p.lastName}</p><p className="text-xs text-[var(--muted-foreground)]">{p.email} · {p.phone ?? "No phone"}</p></div><Badge variant={p.active ? "default" : "slate"}>{p.active ? "Active" : "Inactive"}</Badge></div>} /></>; }
