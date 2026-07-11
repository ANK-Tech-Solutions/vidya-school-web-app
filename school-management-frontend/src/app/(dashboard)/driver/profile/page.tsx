"use client";
import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import type { DriverProfile } from "@/types/driver-ops";

export default function DriverProfilePage() {
  const form = useForm<DriverProfile>({ defaultValues: {} });
  useEffect(() => { driverOpsService.getProfile().then(form.reset).catch(() => toast.error("Could not load your profile")); }, [form]);
  const save = async (values: DriverProfile) => { try { form.reset(await driverOpsService.updateProfile(values)); toast.success("Profile saved"); } catch { toast.error("Could not save your profile"); } };
  return <><PageHeader eyebrow="Account" title="Driver profile" description="Keep your contact and licence details current." />
    <Card className="max-w-3xl p-6"><form onSubmit={form.handleSubmit(save)} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="First name"><Input {...form.register("firstName")} /></Field><Field label="Last name"><Input {...form.register("lastName")} /></Field><Field label="Email"><Input type="email" {...form.register("email")} /></Field><Field label="Phone"><Input type="tel" {...form.register("phone")} /></Field><Field label="Username"><Input {...form.register("username")} /></Field><Field label="Licence number"><Input {...form.register("licenseNumber")} /></Field><Field label="Licence expiry"><Input type="date" {...form.register("licenseExpiry")} /></Field></div><div className="flex justify-end border-t border-[var(--border)] pt-5"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save profile"}</Button></div></form></Card></>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div><Label>{label}</Label><div className="mt-1">{children}</div></div>; }
