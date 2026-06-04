import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IWorkOrder extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  generatedByAI: boolean;
  inputPrompt?: string;
  scopeOfWork: string;
  deliverables: string[];
  requiredSkills: string[];
  evidenceChecklist: string[];
  suggestedMilestones: Array<{
    name: string;
    description: string;
    suggestedPercentage: number;
    requiredEvidence: string[];
  }>;
  notes: string[];
  approvedByClient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    generatedByAI: { type: Boolean, default: false },
    inputPrompt: { type: String },
    scopeOfWork: { type: String, required: true },
    deliverables: [{ type: String }],
    requiredSkills: [{ type: String }],
    evidenceChecklist: [{ type: String }],
    suggestedMilestones: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        suggestedPercentage: { type: Number, required: true },
        requiredEvidence: [{ type: String }],
      },
    ],
    notes: [{ type: String }],
    approvedByClient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.WorkOrder || mongoose.model<IWorkOrder>("WorkOrder", WorkOrderSchema);
