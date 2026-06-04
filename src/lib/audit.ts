import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "./mongodb";
import mongoose from "mongoose";

interface LogAuditParams {
  actorUserId?: string | mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string | mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
}

export async function logAudit({
  actorUserId,
  action,
  entityType,
  entityId,
  metadata,
}: LogAuditParams) {
  try {
    await connectToDatabase();
    
    const parsedActorUserId = actorUserId ? new mongoose.Types.ObjectId(actorUserId.toString()) : undefined;
    const parsedEntityId = entityId ? new mongoose.Types.ObjectId(entityId.toString()) : undefined;
    
    await AuditLog.create({
      actorUserId: parsedActorUserId,
      action,
      entityType,
      entityId: parsedEntityId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
