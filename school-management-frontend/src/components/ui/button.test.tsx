import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label and supplied button attributes", () => {
    render(
      <Button variant="outline" type="submit">
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.className).toContain("border");
  });
});
