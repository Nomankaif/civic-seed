import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IMilestone extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  amount: number;
  currency: string;
  dueDate?: Date;
  requiredEvidence: string[];
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED" | "PAYMENT_RELEASED";
  approvalNotes?: string;
  approvedAt?: Date;
  paymentStatus: "NOT_FUNDED" | "PAYMENT_PENDING" | "FUNDED_TEST_MODE" | "RELEASE_ELIGIBLE" | "RELEASED_TEST_MODE" | "FAILED_TEST_MODE" | "REFUND_REQUESTED_DEMO";
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD", required: true },
    dueDate: { type: Date },
    requiredEvidence: [{ type: String }],
    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "PAYMENT_RELEASED"],
      default: "NOT_STARTED",
      required: true,
    },
    approvalNotes: { type: String },
    approvedAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["NOT_FUNDED", "PAYMENT_PENDING", "FUNDED_TEST_MODE", "RELEASE_ELIGIBLE", "RELEASED_TEST_MODE", "FAILED_TEST_MODE", "REFUND_REQUESTED_DEMO"],
      default: "NOT_FUNDED",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Milestone || mongoose.model<IMilestone>("Milestone", MilestoneSchema);
