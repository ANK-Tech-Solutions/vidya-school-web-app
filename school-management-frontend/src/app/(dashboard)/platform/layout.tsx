import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={[ROLES.SUPER_ADMIN]}>{children}</AuthGuard>;
}
