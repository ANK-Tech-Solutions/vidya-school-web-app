import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={[ROLES.STAFF]}>{children}</AuthGuard>;
}
