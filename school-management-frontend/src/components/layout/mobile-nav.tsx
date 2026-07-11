"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import type { Role } from "@/lib/constants";
export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)} aria-label="Open navigation" className="rounded-xl p-2 lg:hidden"><Menu size={21} /></button>{open && <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"><div className="flex h-full w-72 flex-col bg-[var(--sidebar)]"><button onClick={() => setOpen(false)} aria-label="Close navigation" className="m-4 ml-auto rounded-xl p-2"><X size={20} /></button><Sidebar role={role} mobile /></div></div>}</>;
}
