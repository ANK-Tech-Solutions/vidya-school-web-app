export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
  VEHICLE_INCHARGE: "VEHICLE_INCHARGE",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  STAFF: "STAFF",
} as const;

export const ROUTES = {
  login: "/login",
  platform: "/platform",
  admin: "/admin",
  driver: "/driver",
  incharge: "/incharge",
  teacher: "/teacher",
  student: "/student",
  staff: "/staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Highest-priority role wins when a user has multiple roles. */
export const ROLE_HOME_PRIORITY: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.VEHICLE_INCHARGE,
  ROLES.TEACHER,
  ROLES.DRIVER,
  ROLES.STAFF,
  ROLES.STUDENT,
  ROLES.PARENT,
];

export function primaryRole(roles: readonly string[] | undefined): Role | null {
  if (!roles?.length) return null;
  for (const role of ROLE_HOME_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

export function homeRouteForRoles(roles: readonly string[] | undefined): string {
  const role = primaryRole(roles);
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return ROUTES.platform;
    case ROLES.ADMIN:
      return ROUTES.admin;
    case ROLES.VEHICLE_INCHARGE:
      return ROUTES.incharge;
    case ROLES.TEACHER:
      return ROUTES.teacher;
    case ROLES.DRIVER:
      return ROUTES.driver;
    case ROLES.STAFF:
      return ROUTES.staff;
    case ROLES.STUDENT:
    case ROLES.PARENT:
      return ROUTES.student;
    default:
      return ROUTES.login;
  }
}

export const DEFAULT_BRANDING = {
  appName: "ANK-School-managment",
  appIconUrl: "https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV",
} as const;
