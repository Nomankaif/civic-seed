import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IAuditLog extends MongooseDocument {
  actorUserId?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // e.g. "USER_REGISTERED", "PROJECT_CREATED", "GPS_CHECKIN", "PAYMENT_RELEASED"
  entityType: { type: String, required: true }, // e.g. "User", "Project", "Payment"
  entityId: { type: Schema.Types.ObjectId },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
