import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IOrganization extends MongooseDocument {
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  organizationType: "GOVERNMENT" | "PRIVATE_CUSTOMER";
  departmentOrIndustry?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    organizationType: { type: String, enum: ["GOVERNMENT", "PRIVATE_CUSTOMER"], required: true },
    departmentOrIndustry: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);
