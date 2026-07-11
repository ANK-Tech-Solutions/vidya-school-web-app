"use client";
import { PageHeader } from "@/components/layout/page-header";
import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { driverService } from "@/services/driver.service";
import type { Driver } from "@/types/driver";

export default function DriversPage() { return <><PageHeader eyebrow="Fleet team" title="Drivers" description="Manage driver access, licences, and availability." /><EntityManager<Driver> title="Drivers" fields={[{ name: "firstName", label: "First name" }, { name: "lastName", label: "Last name" }, { name: "username", label: "Username" }, { name: "email", label: "Email", type: "email" }, { name: "licenseNumber", label: "Licence number" }, { name: "password", label: "Password", type: "password", hint: "Leave blank to use Password@123." }]} list={driverService.list} create={driverService.create} update={driverService.update} deactivate={driverService.deactivate} row={(d) => <div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{d.firstName} {d.lastName}</p><p className="text-xs text-[var(--muted-foreground)]">{d.licenseNumber} · {d.email}</p></div><Badge variant={d.online ? "default" : "slate"}>{d.online ? "Online" : "Offline"}</Badge></div>} /></>; }
