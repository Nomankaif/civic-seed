import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IProjectAssignment extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  clientUserId: mongoose.Types.ObjectId;
  contractorUserId: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  assignedAt: Date;
  respondedAt?: Date;
  notes?: string;
}

const ProjectAssignmentSchema = new Schema<IProjectAssignment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    clientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contractorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"], default: "PENDING", required: true },
    assignedAt: { type: Date, default: Date.now, required: true },
    respondedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ProjectAssignment || mongoose.model<IProjectAssignment>("ProjectAssignment", ProjectAssignmentSchema);
