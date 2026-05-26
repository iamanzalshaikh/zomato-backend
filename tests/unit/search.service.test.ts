import { describe, it, expect } from "vitest";
import { normalizeSearchQuery } from "../../src/services/search.service.js";
import { hashQuery } from "../../src/services/cache.service.js";

describe("search.service", () => {
  it("normalizes query to lowercase trimmed", () => {
    expect(normalizeSearchQuery("  BiRyAni  ")).toBe("biryani");
  });

  it("hashQuery is stable for same params", () => {
    const a = hashQuery({ q: "pizza", page: 1 });
    const b = hashQuery({ page: 1, q: "pizza" });
    expect(a).toBe(b);
  });
});
