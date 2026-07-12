import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard roles={[ROLES.TEACHER]}>{children}</AuthGuard>;
}
