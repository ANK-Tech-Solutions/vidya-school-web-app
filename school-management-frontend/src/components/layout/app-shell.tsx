"use client";

import type { ReactNode } from "react";
import type { Role } from "@/lib/constants";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { BrandingSync } from "./branding-sync";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";
import { useBrandingStore } from "@/stores/branding-store";

export function AppShell({ children, role }: { children: ReactNode; role: Role }) {
  const branding = useBrandingStore();
  return <div className="min-h-screen bg-[var(--background)] lg:flex"><BrandingSync authenticated /><Sidebar role={role} /><main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-7"><div className="mb-3 flex items-center lg:hidden"><MobileNav role={role} /><img src={branding.appIconUrl} alt="" className="ml-2 h-7 w-7 rounded-lg object-cover" /><span className="ml-2 font-display text-lg font-bold">{branding.appName}</span></div><Topbar /><div className="mx-auto max-w-7xl py-7">{children}</div></main><AiChatWidget /></div>;
}
