import mongoose from "mongoose";
import { Request } from "express";
import AuditLog from "../models/auditLog.model.js";
import { AuthRequest } from "../types/auth.types.js";
import logger from "../config/logger.js";

export interface AuditContext {
  actorId: string;
  actorRole: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim();
  }
  return req.ip;
}

export function buildAuditContext(req: AuthRequest): AuditContext {
  return {
    actorId: req.adminId ?? req.userId ?? "system",
    actorRole: req.adminRole ?? req.userRole ?? "system",
    ipAddress: getClientIp(req),
    deviceInfo: req.headers["user-agent"],
  };
}

export async function writeAuditLog(
  ctx: AuditContext,
  input: {
    module: string;
    action: string;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(ctx.actorId),
      actorRole: ctx.actorRole,
      module: input.module,
      action: input.action,
      entityId: input.entityId
        ? new mongoose.Types.ObjectId(input.entityId)
        : undefined,
      oldData: input.oldData,
      newData: input.newData,
      ipAddress: ctx.ipAddress,
      deviceInfo: ctx.deviceInfo,
    });
  } catch (error) {
    logger.warn("Audit log write failed", { error, action: input.action });
  }
}
