"use client";
import { Building2, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { brandingService } from "@/services/branding.service";
import { useBrandingStore } from "@/stores/branding-store";
export default function SettingsPage() { const { user } = useAuth(); const branding = useBrandingStore(); const [appName, setAppName] = useState(branding.appName); const [appIconUrl, setAppIconUrl] = useState(branding.appIconUrl); const save = async (e: React.FormEvent) => { e.preventDefault(); if (!appName.trim() || !appIconUrl.trim()) return toast.error("App name and icon URL are required"); try { const result = await brandingService.update({ appName, appIconUrl }); branding.setBranding(result); toast.success("Branding saved"); } catch { toast.error("Could not save branding"); } }; return <><PageHeader eyebrow="Configuration" title="School settings" description="Your school profile and appearance preferences." /><div className="grid gap-6 lg:grid-cols-2"><Card className="p-6"><Building2 className="text-[var(--primary)]" /><h2 className="mt-4 font-display text-xl font-bold">School information</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[var(--muted-foreground)]">School</dt><dd className="font-semibold">{user?.schoolName ?? "Not configured"}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--muted-foreground)]">Administrator</dt><dd className="font-semibold">{user?.firstName} {user?.lastName}</dd></div></dl></Card><Card className="p-6"><Palette className="text-[var(--accent)]" /><h2 className="mt-4 font-display text-xl font-bold">Branding</h2><form onSubmit={save} className="mt-5 space-y-3"><Input required value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Application name" /><Input required type="url" value={appIconUrl} onChange={(e) => setAppIconUrl(e.target.value)} placeholder="Application icon URL" /><Button type="submit">Save branding</Button></form></Card></div></>; }
