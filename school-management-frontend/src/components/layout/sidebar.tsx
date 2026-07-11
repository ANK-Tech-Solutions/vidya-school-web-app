"use client";
import Link from "next/link";
import { Bell, Bus, BusFront, ClipboardCheck, Gauge, GraduationCap, History, IdCard, Link2, MapPinned, Navigation, Route, Settings, User, Users, UsersRound, ChartNoAxesCombined } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

const nav = {
  ADMIN: [
    { href: "/admin", label: "Overview", icon: Gauge },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/parents", label: "Parents", icon: UsersRound },
    { href: "/admin/drivers", label: "Drivers", icon: IdCard },
    { href: "/admin/buses", label: "Buses", icon: Bus },
    { href: "/admin/routes", label: "Routes", icon: Route },
    { href: "/admin/assignments", label: "Assignments", icon: Link2 },
    { href: "/admin/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/admin/reports", label: "Reports", icon: ChartNoAxesCombined },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  DRIVER: [
    { href: "/driver", label: "Dashboard", icon: Gauge },
    { href: "/driver/route", label: "My Route", icon: MapPinned },
    { href: "/driver/students", label: "Today's Students", icon: Users },
    { href: "/driver/trip", label: "Trip Control", icon: Navigation },
    { href: "/driver/history", label: "Trip History", icon: History },
    { href: "/driver/profile", label: "Profile", icon: User },
  ],
  STUDENT: [
    { href: "/student", label: "Dashboard", icon: BusFront },
    { href: "/student/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/student/history", label: "Trip History", icon: History },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
    { href: "/student/profile", label: "Profile", icon: User },
  ],
  PARENT: [
    { href: "/student", label: "Dashboard", icon: BusFront },
    { href: "/student/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/student/history", label: "Trip History", icon: History },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
    { href: "/student/profile", label: "Profile", icon: User },
  ],
} satisfies Record<Role, { href: string; label: string; icon: typeof Gauge }[]>;

export function Sidebar({ role, mobile = false }: { role: Role; mobile?: boolean }) {
  const pathname = usePathname();
  return <aside className={cn("w-68 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] px-4 py-6", mobile ? "flex" : "hidden lg:flex")}>
    <Link href="/" className="mb-10 flex items-center gap-3 px-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-lg shadow-teal-900/20"><BusFront size={22} /></span><span className="font-display text-xl font-bold tracking-tight">Vidya Bus</span></Link>
    <nav aria-label="Main navigation" className="space-y-1">{nav[role].map(({ href, label, icon: Icon }) => {
      const active = href === "/admin" || href === "/driver" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-teal-500/12 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]")}><Icon size={18} />{label}</Link>;
    })}</nav>
    <div className="mt-auto rounded-2xl bg-[var(--primary)] p-4 text-white"><p className="text-xs font-semibold uppercase tracking-widest text-teal-100">Connected care</p><p className="mt-2 text-sm leading-5 text-teal-50">Every journey, clearly in view.</p></div>
  </aside>;
}
