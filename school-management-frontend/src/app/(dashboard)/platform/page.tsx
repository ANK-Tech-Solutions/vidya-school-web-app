"use client";

import Link from "next/link";
import { Building2, UserCog } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function PlatformHomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="School provisioning"
        description="Create schools and school admin accounts. Each school admin manages their own campus."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/platform/schools">
          <Card className="h-full p-6 transition hover:border-[var(--primary)]">
            <Building2 className="text-[var(--primary)]" size={22} />
            <h2 className="mt-4 font-display text-xl font-bold">Schools</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Register schools, set codes, contact details, and branding defaults.
            </p>
          </Card>
        </Link>
        <Link href="/platform/admins">
          <Card className="h-full p-6 transition hover:border-[var(--primary)]">
            <UserCog className="text-[var(--primary)]" size={22} />
            <h2 className="mt-4 font-display text-xl font-bold">School admins</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Create ADMIN users for each school so they can sign in at the school portal.
            </p>
          </Card>
        </Link>
      </div>
    </>
  );
}
