import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDispute extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  raisedByUserId: mongoose.Types.ObjectId;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED_DEMO";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone" },
    raisedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "UNDER_REVIEW", "RESOLVED_DEMO"], default: "OPEN", required: true },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", DisputeSchema);
