import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IMilestoneSubmission extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  contractorUserId: mongoose.Types.ObjectId;
  workSummary: string;
  completionPercentage: number;
  attachmentIds: mongoose.Types.ObjectId[];
  locationCheckinId?: mongoose.Types.ObjectId;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewStatus: "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED";
  clientComments?: string;
}

const MilestoneSubmissionSchema = new Schema<IMilestoneSubmission>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true },
    contractorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workSummary: { type: String, required: true },
    completionPercentage: { type: Number, required: true },
    attachmentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    locationCheckinId: { type: Schema.Types.ObjectId, ref: "LocationCheckin" },
    submittedAt: { type: Date, default: Date.now, required: true },
    reviewedAt: { type: Date },
    reviewStatus: { type: String, enum: ["SUBMITTED", "REVISION_REQUESTED", "APPROVED"], default: "SUBMITTED", required: true },
    clientComments: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.MilestoneSubmission || mongoose.model<IMilestoneSubmission>("MilestoneSubmission", MilestoneSubmissionSchema);
