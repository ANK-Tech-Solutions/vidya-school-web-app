import { describe, expect, it } from "vitest";
import { ROLES, homeRouteForRoles, primaryRole } from "./constants";

describe("ROLES", () => {
  it("exposes the supported application role values", () => {
    expect(ROLES).toEqual({
      SUPER_ADMIN: "SUPER_ADMIN",
      ADMIN: "ADMIN",
      DRIVER: "DRIVER",
      VEHICLE_INCHARGE: "VEHICLE_INCHARGE",
      TEACHER: "TEACHER",
      STUDENT: "STUDENT",
      PARENT: "PARENT",
      STAFF: "STAFF",
    });
  });

  it("routes each portal role to the correct home path", () => {
    expect(homeRouteForRoles(["SUPER_ADMIN"])).toBe("/platform");
    expect(homeRouteForRoles(["ADMIN"])).toBe("/admin");
    expect(homeRouteForRoles(["DRIVER"])).toBe("/driver");
    expect(homeRouteForRoles(["VEHICLE_INCHARGE"])).toBe("/incharge");
    expect(homeRouteForRoles(["TEACHER"])).toBe("/teacher");
    expect(homeRouteForRoles(["STUDENT"])).toBe("/student");
    expect(homeRouteForRoles(["PARENT"])).toBe("/student");
    expect(homeRouteForRoles(["STAFF"])).toBe("/staff");
    expect(primaryRole(["PARENT", "SUPER_ADMIN"])).toBe("SUPER_ADMIN");
  });
});
