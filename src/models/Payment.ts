import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IPayment extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  clientUserId: mongoose.Types.ObjectId;
  contractorUserId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeConnectedAccountId?: string;
  status: "NOT_FUNDED" | "PAYMENT_PENDING" | "FUNDED_TEST_MODE" | "RELEASE_ELIGIBLE" | "RELEASED_TEST_MODE" | "FAILED_TEST_MODE" | "REFUND_REQUESTED_DEMO";
  isTestMode: boolean;
  fundedAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true },
    clientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contractorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD", required: true },
    stripePaymentIntentId: { type: String },
    stripeConnectedAccountId: { type: String },
    status: {
      type: String,
      enum: ["NOT_FUNDED", "PAYMENT_PENDING", "FUNDED_TEST_MODE", "RELEASE_ELIGIBLE", "RELEASED_TEST_MODE", "FAILED_TEST_MODE", "REFUND_REQUESTED_DEMO"],
      default: "NOT_FUNDED",
      required: true,
    },
    isTestMode: { type: Boolean, default: true, required: true },
    fundedAt: { type: Date },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
