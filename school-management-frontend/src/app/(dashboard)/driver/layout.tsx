import { AuthGuard } from "@/components/auth/auth-guard";
export default function DriverLayout({ children }: { children: React.ReactNode }) { return <AuthGuard roles={["DRIVER"]}>{children}</AuthGuard>; }
