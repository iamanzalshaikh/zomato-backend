import { Request, Response, NextFunction } from "express";
import { sanitizeDeep } from "../utils/sanitize.util.js";

/** Strip MongoDB operators from objects (NoSQL injection). Mutates in place — Express 5 safe. */
function stripMongoOperators(obj: Record<string, unknown>): void {
  for (const key of [...Object.keys(obj)]) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      stripMongoOperators(val as Record<string, unknown>);
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          stripMongoOperators(item as Record<string, unknown>);
        }
      }
    }
  }
}

/** Blocks NoSQL operators in body and route params */
export function mongoSanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    stripMongoOperators(req.body as Record<string, unknown>);
  }
  if (req.params && typeof req.params === "object") {
    stripMongoOperators(req.params as Record<string, unknown>);
  }
  next();
}

/** Strip HTML/script from string fields in JSON body */
export function xssSanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeDeep(req.body);
  }
  next();
}
