"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => {}, []); return <main className="flex min-h-screen items-center justify-center p-5"><div className="glass-panel max-w-md rounded-3xl p-8 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--primary)]">A small detour</p><h1 className="mt-3 font-display text-3xl font-bold">We couldn&apos;t load this journey.</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">Please try again. If it continues, contact your school transport team.</p><Button onClick={reset} className="mt-6">Try again</Button></div></main>; }
