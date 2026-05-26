import xss from "xss";

export function sanitizeString(value: string): string {
  return xss(value.trim(), {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}

/** Deep-clean strings in JSON bodies/queries for XSS. */
export function sanitizeDeep<T>(input: T): T {
  if (typeof input === "string") {
    return sanitizeString(input) as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeDeep(item)) as T;
  }
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      out[key] = sanitizeDeep(val);
    }
    return out as T;
  }
  return input;
}
