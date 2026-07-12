export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const ROLES = {
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export const ROUTES = {
  login: "/login",
  admin: "/admin",
  driver: "/driver",
  teacher: "/teacher",
  student: "/student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_BRANDING = {
  appName: "ANK-School-managment",
  appIconUrl: "https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV",
} as const;
