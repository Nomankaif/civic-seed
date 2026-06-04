import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IUser extends MongooseDocument {
  clerkUserId: string; // Will store "mock_xxx" or Clerk user id
  email: string;
  fullName: string;
  role: "CLIENT" | "CONTRACTOR" | "ADMIN";
  profileImageUrl?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ["CLIENT", "CONTRACTOR", "ADMIN"], required: true },
    profileImageUrl: { type: String },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
