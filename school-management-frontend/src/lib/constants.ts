export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const ROLES = {
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export const ROUTES = {
  login: "/login",
  admin: "/admin",
  driver: "/driver",
  student: "/student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
