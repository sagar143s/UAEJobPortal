import { Schema, type InferSchemaType, type Types } from "mongoose";
import { registerModel } from "@/lib/db";

const WalkInSchema = new Schema(
  {
    interviewDate: { type: Date, required: true },
    startTime: String,
    endTime: String,
    contact: String,
    email: String,
    address: String,
    mapUrl: String,
  },
  { _id: false },
);

const JobSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    companySlug: { type: String, required: true, index: true },
    location: { type: String, required: true },
    emirate: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    requirements: String,
    benefits: String,
    salaryMin: Number,
    salaryMax: Number,
    salaryText: String,
    currency: String,
    salaryPeriod: String,
    employmentType: String,
    experience: String,
    experienceText: String,
    category: String,
    categorySlug: { type: String, index: true },
    skills: { type: [String], default: [] },
    source: { type: String, required: true, index: true },
    sourceName: { type: String, required: true },
    sourceType: { type: String, required: true },
    sourceJobId: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    applicationType: { type: String, enum: ["external", "internal"], required: true },
    publishedAt: Date,
    expiresAt: Date,
    lastSeenAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "PENDING", "CLOSED"],
      default: "ACTIVE",
      index: true,
    },
    attributionText: String,
    isWalkIn: { type: Boolean, default: false, index: true },
    isUrgent: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    verifiedEmployer: { type: Boolean, default: false },
    walkIn: WalkInSchema,
    fingerprint: { type: String, required: true, index: true },
    contentHash: { type: String, required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

JobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true });
JobSchema.index({ status: 1, publishedAt: -1 });
JobSchema.index({ status: 1, emirate: 1, publishedAt: -1 });
JobSchema.index({ status: 1, categorySlug: 1, publishedAt: -1 });
JobSchema.index({ status: 1, isWalkIn: 1, "walkIn.interviewDate": 1 });
JobSchema.index({ status: 1, lastSeenAt: 1 });
JobSchema.index({ expiresAt: 1, status: 1 });
JobSchema.index({
  title: "text",
  company: "text",
  skills: "text",
  location: "text",
  description: "text",
});

export type JobRecord = InferSchemaType<typeof JobSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Job = registerModel("Job", JobSchema);
