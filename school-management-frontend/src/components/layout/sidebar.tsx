"use client";
import Link from "next/link";
import { Bell, BookOpen, Building2, Bus, BusFront, CalendarDays, ClipboardCheck, FileCheck2, Gauge, GraduationCap, History, IdCard, Landmark, Link2, MapPinned, Navigation, NotebookPen, Route, Settings, User, UserCog, Users, UsersRound, ChartNoAxesCombined, WalletCards, School, Megaphone, ReceiptText, CircleDollarSign } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useBrandingStore } from "@/stores/branding-store";

const nav = {
  SUPER_ADMIN: [
    { href: "/platform", label: "Overview", icon: Gauge },
    { href: "/platform/schools", label: "Schools", icon: Building2 },
    { href: "/platform/admins", label: "School admins", icon: UserCog },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: Gauge },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/parents", label: "Parents", icon: UsersRound },
    { href: "/admin/teachers", label: "Teachers", icon: School },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/admin/attendance", label: "Attendance Reports", icon: ClipboardCheck },
    { href: "/admin/fees", label: "Fees", icon: WalletCards },
    { href: "/admin/salaries", label: "Salaries", icon: CircleDollarSign },
    { href: "/admin/exams", label: "Exams", icon: FileCheck2 },
    { href: "/admin/notices", label: "Notice Board", icon: Megaphone },
    { href: "/admin/leaves", label: "Leave Approvals", icon: NotebookPen },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
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
    { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/student/homework", label: "Homework", icon: BookOpen },
    { href: "/student/exams", label: "Exams", icon: FileCheck2 },
    { href: "/student/fees", label: "Fees", icon: ReceiptText },
    { href: "/student/notices", label: "Notice Board", icon: Megaphone },
    { href: "/student/leave", label: "Leave", icon: NotebookPen },
    { href: "/student/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/student/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/student/profile", label: "Profile", icon: User },
  ],
  PARENT: [
    { href: "/student", label: "Dashboard", icon: BusFront },
    { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/student/homework", label: "Homework", icon: BookOpen },
    { href: "/student/exams", label: "Exams", icon: FileCheck2 },
    { href: "/student/fees", label: "Fees", icon: ReceiptText },
    { href: "/student/notices", label: "Notice Board", icon: Megaphone },
    { href: "/student/leave", label: "Leave", icon: NotebookPen },
    { href: "/student/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/student/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/student/profile", label: "Profile", icon: User },
  ],
  TEACHER: [
    { href: "/teacher", label: "Dashboard", icon: Gauge },
    { href: "/teacher/attendance", label: "Mark Attendance", icon: ClipboardCheck },
    { href: "/teacher/homework", label: "Homework", icon: BookOpen },
    { href: "/teacher/materials", label: "Study Material", icon: Landmark },
    { href: "/teacher/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/teacher/students", label: "Students", icon: Users },
    { href: "/teacher/announcements", label: "Announcements", icon: Megaphone },
    { href: "/teacher/evaluate", label: "Evaluate", icon: FileCheck2 },
    { href: "/teacher/leave", label: "Leave", icon: NotebookPen },
    { href: "/teacher/notices", label: "Notice Board", icon: Bell },
    { href: "/teacher/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/teacher/profile", label: "Profile", icon: User },
  ],
  VEHICLE_INCHARGE: [
    { href: "/incharge", label: "Overview", icon: Gauge },
    { href: "/incharge/buses", label: "Buses", icon: Bus },
    { href: "/incharge/routes", label: "Routes", icon: Route },
    { href: "/incharge/drivers", label: "Drivers", icon: IdCard },
    { href: "/incharge/assignments", label: "Assignments", icon: Link2 },
    { href: "/incharge/tracking", label: "Live Tracking", icon: MapPinned },
    { href: "/incharge/reports", label: "Reports", icon: ChartNoAxesCombined },
  ],
  STAFF: [
    { href: "/staff", label: "Dashboard", icon: Gauge },
    { href: "/staff/notices", label: "Notice Board", icon: Megaphone },
    { href: "/staff/calendar", label: "Calendar", icon: CalendarDays },
  ],
} satisfies Record<Role, { href: string; label: string; icon: typeof Gauge }[]>;

export function Sidebar({ role, mobile = false }: { role: Role; mobile?: boolean }) {
  const pathname = usePathname();
  const branding = useBrandingStore();
  return <aside className={cn("w-68 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] px-4 py-6", mobile ? "flex" : "hidden lg:flex")}>
    <Link href="/" className="mb-10 flex items-center gap-3 px-2"><img src={branding.appIconUrl} alt="" className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-teal-900/20" /><span className="font-display text-xl font-bold tracking-tight">{branding.appName}</span></Link>
    <nav aria-label="Main navigation" className="space-y-1">{nav[role].map(({ href, label, icon: Icon }) => {
      const active =
        href === "/platform" || href === "/admin" || href === "/driver" || href === "/incharge" || href === "/teacher" || href === "/staff" || href === "/student"
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-teal-500/12 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]")}><Icon size={18} />{label}</Link>;
    })}</nav>
    <div className="mt-auto rounded-2xl bg-[var(--primary)] p-4 text-white"><p className="text-xs font-semibold uppercase tracking-widest text-teal-100">Connected care</p><p className="mt-2 text-sm leading-5 text-teal-50">Every journey, clearly in view.</p></div>
  </aside>;
}
