import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface ILocationCheckin extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  contractorUserId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const LocationCheckinSchema = new Schema<ILocationCheckin>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone" },
    contractorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    timestamp: { type: Date, default: Date.now, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

LocationCheckinSchema.index({ location: "2dsphere" });

export default mongoose.models.LocationCheckin || mongoose.model<ILocationCheckin>("LocationCheckin", LocationCheckinSchema);
