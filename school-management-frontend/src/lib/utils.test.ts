import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges Tailwind classes while preserving conditional classes", () => {
    expect(cn("px-2 py-1", false && "hidden", "px-4", "text-sm")).toBe(
      "py-1 px-4 text-sm",
    );
  });
});
