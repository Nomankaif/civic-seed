import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IContactRequest extends MongooseDocument {
  fullName: string;
  email: string;
  organization?: string;
  phone?: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  organization: { type: String },
  phone: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ["NEW", "READ", "RESOLVED"], default: "NEW", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ContactRequest || mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
