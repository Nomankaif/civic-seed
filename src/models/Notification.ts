import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface INotification extends MongooseDocument {
  recipientUserId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  relatedProjectId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true }, // e.g. "ASSIGNMENT", "GPS", "SUBMISSION", "PAYMENT", "SYSTEM"
  relatedProjectId: { type: Schema.Types.ObjectId, ref: "Project" },
  isRead: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
