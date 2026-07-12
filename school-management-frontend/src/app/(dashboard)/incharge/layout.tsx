import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function InchargeLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={[ROLES.VEHICLE_INCHARGE]}>{children}</AuthGuard>;
}
