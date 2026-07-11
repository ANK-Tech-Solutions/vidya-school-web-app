"use client";

import { useEffect, useState } from "react";
import { Download, Route, Users, TriangleAlert, BusFront, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reportService } from "@/services/report.service";
import type { AttendanceReportRow, DriverPerformanceRow, ReportSummary, TripReportRow } from "@/types/reports";

type Tab = "summary" | "trips" | "attendance" | "drivers";
const tabs: { id: Tab; label: string }[] = [{ id: "summary", label: "Summary" }, { id: "trips", label: "Trips" }, { id: "attendance", label: "Attendance" }, { id: "drivers", label: "Drivers" }];
const dateTime = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const csvValue = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trips, setTrips] = useState<TripReportRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceReportRow[]>([]);
  const [drivers, setDrivers] = useState<DriverPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    const params = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
    Promise.all([reportService.summary(params), reportService.trips({ ...params, size: 100 }), reportService.attendance({ ...params, size: 100 }), reportService.driverPerformance(params)])
      .then(([nextSummary, nextTrips, nextAttendance, nextDrivers]) => {
        if (!current) return;
        setSummary(nextSummary); setTrips(nextTrips.content); setAttendance(nextAttendance.content); setDrivers(nextDrivers);
      }).catch(() => {
        if (current) { setSummary(null); setTrips([]); setAttendance([]); setDrivers([]); }
      }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [from, to]);

  const exportCsv = () => {
    const rows: unknown[][] = tab === "trips"
      ? [["Trip", "Started", "Bus", "Driver", "Route", "Status", "Distance (km)", "Students"], ...trips.map(t => [t.tripId, dateTime(t.startedAt), t.busNumber, t.driverName, t.routeName, t.status, t.distanceKm, t.studentsPicked])]
      : tab === "attendance"
        ? [["Recorded", "Student", "Code", "Bus", "Event", "Method"], ...attendance.map(a => [dateTime(a.recordedAt), a.studentName, a.studentCode, a.busNumber, a.eventType, a.method])]
        : tab === "drivers"
          ? [["Driver", "Completed trips", "Distance (km)", "Emergencies"], ...drivers.map(d => [d.driverName, d.completedTrips, d.distanceKm, d.emergencies])]
          : [["Metric", "Value"], ["Total trips", summary?.totalTrips], ["Completed trips", summary?.completedTrips], ["Emergency trips", summary?.emergencyTrips], ["Attendance events", summary?.totalAttendance], ["Active buses", summary?.activeBuses], ["Students transported", summary?.studentsTransported]];
    const blob = new Blob([rows.map(row => row.map(csvValue).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `${tab}-report.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <><PageHeader eyebrow="Operational intelligence" title="Reports" description="Review transport activity across your selected date range." />
    <Card className="mb-6 flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-3"><label className="text-sm font-semibold">From<input value={from} onChange={e => { setLoading(true); setFrom(e.target.value); }} type="date" className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">To<input value={to} onChange={e => { setLoading(true); setTo(e.target.value); }} type="date" className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-normal" /></label></div>
      <Button variant="outline" onClick={exportCsv}><Download size={16} />Export CSV</Button>
    </Card>
    <div className="mb-6 flex gap-1 border-b border-[var(--border)]">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-3 text-sm font-semibold ${tab === item.id ? "border-b-2 border-[var(--primary)] text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>{item.label}</button>)}</div>
    {loading ? <Card className="p-8 text-sm text-[var(--muted-foreground)]">Loading report data…</Card> : tab === "summary" ? <Summary summary={summary} /> : tab === "trips" ? <Trips rows={trips} /> : tab === "attendance" ? <Attendance rows={attendance} /> : <Drivers rows={drivers} />}
  </>;
}

function Summary({ summary }: { summary: ReportSummary | null }) {
  const cards = [{ label: "Total trips", value: summary?.totalTrips ?? 0, icon: Route }, { label: "Completed trips", value: summary?.completedTrips ?? 0, icon: BusFront }, { label: "Emergency trips", value: summary?.emergencyTrips ?? 0, icon: TriangleAlert, tone: "text-red-600" }, { label: "Attendance events", value: summary?.totalAttendance ?? 0, icon: ClipboardCheck }, { label: "Active buses", value: summary?.activeBuses ?? 0, icon: BusFront }, { label: "Students transported", value: summary?.studentsTransported ?? 0, icon: Users }];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(card => <StatCard key={card.label} {...card} />)}</div>;
}

function Table({ children }: { children: React.ReactNode }) { return <Card className="overflow-x-auto"><table className="w-full min-w-175 text-left text-sm">{children}</table></Card>; }
function Header({ children }: { children: React.ReactNode }) { return <thead className="bg-[var(--muted)] text-xs uppercase text-[var(--muted-foreground)]"><tr>{children}</tr></thead>; }
function Cell({ children }: { children: React.ReactNode }) { return <td className="border-t border-[var(--border)] px-4 py-3">{children}</td>; }

function Trips({ rows }: { rows: TripReportRow[] }) { return <Table><Header><th className="px-4 py-3">Trip</th><th>Started</th><th>Driver</th><th>Bus / Route</th><th>Status</th><th>Distance</th></Header><tbody>{rows.map(row => <tr key={row.tripId}><Cell>#{row.tripId}</Cell><Cell>{dateTime(row.startedAt)}</Cell><Cell>{row.driverName}</Cell><Cell>{row.busNumber} · {row.routeName}</Cell><Cell>{row.status}</Cell><Cell>{row.distanceKm ?? 0} km</Cell></tr>)}{!rows.length && <tr><Cell>No trips found.</Cell></tr>}</tbody></Table>; }
function Attendance({ rows }: { rows: AttendanceReportRow[] }) { return <Table><Header><th className="px-4 py-3">Recorded</th><th>Student</th><th>Code</th><th>Bus</th><th>Event</th><th>Method</th></Header><tbody>{rows.map(row => <tr key={row.attendanceId}><Cell>{dateTime(row.recordedAt)}</Cell><Cell>{row.studentName}</Cell><Cell>{row.studentCode}</Cell><Cell>{row.busNumber ?? "—"}</Cell><Cell>{row.eventType}</Cell><Cell>{row.method}</Cell></tr>)}{!rows.length && <tr><Cell>No attendance found.</Cell></tr>}</tbody></Table>; }
function Drivers({ rows }: { rows: DriverPerformanceRow[] }) { return <Table><Header><th className="px-4 py-3">Driver</th><th>Completed trips</th><th>Distance</th><th>Emergencies</th></Header><tbody>{rows.map(row => <tr key={row.driverId}><Cell>{row.driverName}</Cell><Cell>{row.completedTrips}</Cell><Cell>{row.distanceKm ?? 0} km</Cell><Cell>{row.emergencies}</Cell></tr>)}{!rows.length && <tr><Cell>No driver activity found.</Cell></tr>}</tbody></Table>; }
