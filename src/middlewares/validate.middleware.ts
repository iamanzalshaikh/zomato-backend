import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const data = source === "query" ? req.query : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      res.status(400).json({ success: false, message });
      return;
    }
    if (source === "query") {
      Object.assign(req.query, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };
