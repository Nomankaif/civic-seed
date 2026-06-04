import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface ITestimonial extends MongooseDocument {
  clientName: string;
  organization?: string;
  quote: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  clientName: { type: String, required: true },
  organization: { type: String },
  quote: { type: String, required: true },
  rating: { type: Number, default: 5, required: true },
  isApproved: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
