import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  uploadedByUserId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  fileUrl: string;
  cloudinaryPublicId: string;
  resourceType: string; // e.g. "image", "raw" (pdf, doc)
  originalFileName: string;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone" },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    resourceType: { type: String, default: "image", required: true },
    originalFileName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
