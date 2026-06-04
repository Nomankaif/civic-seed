import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IContractorProfile extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  tradeCategories: string[];
  skills: string[];
  serviceLocations: string[];
  yearsOfExperience: number;
  completedProjectsCount: number;
  rating: number;
  available: boolean;
  verificationStatus: "UNVERIFIED" | "DEMO_VERIFIED";
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractorProfileSchema = new Schema<IContractorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true },
    description: { type: String, required: true },
    tradeCategories: [{ type: String }],
    skills: [{ type: String }],
    serviceLocations: [{ type: String }],
    yearsOfExperience: { type: Number, required: true },
    completedProjectsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    available: { type: Boolean, default: true },
    verificationStatus: { type: String, enum: ["UNVERIFIED", "DEMO_VERIFIED"], default: "UNVERIFIED" },
    profileImageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ContractorProfile || mongoose.model<IContractorProfile>("ContractorProfile", ContractorProfileSchema);
