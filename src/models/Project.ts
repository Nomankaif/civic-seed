import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IProject extends MongooseDocument {
  clientUserId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  assignedContractorId?: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  address: {
    street?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  estimatedBudget: number;
  currency: string;
  requiredSkills: string[];
  startDate: Date;
  targetCompletionDate: Date;
  status: "DRAFT" | "PUBLISHED" | "CONTRACTOR_ASSIGNED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "COMPLETED" | "CLOSED" | "CANCELLED";
  attachments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    clientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    assignedContractorId: { type: Schema.Types.ObjectId, ref: "ContractorProfile" },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    estimatedBudget: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    requiredSkills: [{ type: String }],
    startDate: { type: Date, required: true },
    targetCompletionDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CONTRACTOR_ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW", "COMPLETED", "CLOSED", "CANCELLED"],
      default: "DRAFT",
    },
    attachments: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

ProjectSchema.index({ location: "2dsphere" });

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
