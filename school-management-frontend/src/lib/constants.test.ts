import { describe, expect, it } from "vitest";
import { ROLES } from "./constants";

describe("ROLES", () => {
  it("exposes the supported application role values", () => {
    expect(ROLES).toEqual({
      ADMIN: "ADMIN",
      DRIVER: "DRIVER",
      STUDENT: "STUDENT",
      PARENT: "PARENT",
    });
  });
});
