import { describe, it, expect } from "vitest";
import { sanitizeString, sanitizeDeep } from "../../src/utils/sanitize.util.js";

describe("sanitize.util", () => {
  it("strips script tags from strings", () => {
    const input = '<script>alert("xss")</script>Hello';
    const out = sanitizeString(input);
    expect(out).not.toContain("<script>");
    expect(out).toContain("Hello");
  });

  it("sanitizes nested objects", () => {
    const out = sanitizeDeep({
      name: "<img src=x onerror=alert(1)>Anzal",
      nested: { bio: "<b>ok</b>" },
    });
    expect(out.name).not.toContain("onerror");
  });
});
