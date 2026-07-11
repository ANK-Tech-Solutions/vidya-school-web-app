import { AuthGuard } from "@/components/auth/auth-guard";
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AuthGuard roles={["ADMIN"]}>{children}</AuthGuard>; }
