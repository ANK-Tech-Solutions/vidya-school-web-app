import type { ReactNode } from "react";
import type { Role } from "@/lib/constants";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
export function AppShell({ children, role }: { children: ReactNode; role: Role }) {
  return <div className="min-h-screen bg-[var(--background)] lg:flex"><Sidebar role={role} /><main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-7"><div className="mb-3 flex items-center lg:hidden"><MobileNav role={role} /><span className="ml-2 font-display text-lg font-bold">Vidya Bus</span></div><Topbar /><div className="mx-auto max-w-7xl py-7">{children}</div></main></div>;
}
