import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLogDocument extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  module: string;
  action: string;
  entityId?: mongoose.Types.ObjectId;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, required: true },
    actorRole: { type: String, required: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    entityId: Schema.Types.ObjectId,
    oldData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    ipAddress: String,
    deviceInfo: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "audit_logs" },
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });

const AuditLog: Model<IAuditLogDocument> = mongoose.model<IAuditLogDocument>(
  "AuditLog",
  auditLogSchema,
);

export default AuditLog;
