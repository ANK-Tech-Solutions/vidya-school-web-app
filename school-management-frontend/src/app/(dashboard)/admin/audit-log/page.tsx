"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auditLogService } from "@/services/audit-log.service";
import type { AuditLogRow } from "@/types/audit-log";

const SIZE = 50;

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    auditLogService
      .list({ action: search || undefined, page, size: SIZE })
      .then((data) => {
        setRows(data.content);
        setTotalPages(Math.max(data.totalPages, 1));
      })
      .catch(() => toast.error("Could not load audit log"))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="Every create, update, and delete performed across the admin, platform, and fleet APIs."
      />
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <Input
          value={search}
          onChange={(event) => {
            setPage(0);
            setSearch(event.target.value);
          }}
          placeholder="Filter by action (e.g. POST /api/v1/admin/students)"
          className="max-w-md"
        />
        <Button variant="outline" onClick={load}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Area</th>
              <th className="px-5 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-5 py-3 text-[var(--muted-foreground)]">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 font-medium">{row.username ?? (row.userId ? `#${row.userId}` : "—")}</td>
                <td className="px-5 py-3 font-mono text-xs">{row.action}</td>
                <td className="px-5 py-3">{row.entityType ? <Badge variant="slate">{row.entityType}</Badge> : "—"}</td>
                <td className="px-5 py-3 text-[var(--muted-foreground)]">{row.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading audit log…</p>
        ) : !rows.length ? (
          <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No audit entries match your filter yet.</p>
        ) : null}
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
