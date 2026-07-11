import type { Role } from "@/lib/constants";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  roles: Role[];
  schoolId?: number;
  schoolName?: string;
}
