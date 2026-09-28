import { Schema, type InferSchemaType, type Types } from "mongoose";
import { registerModel } from "@/lib/db";

const ViewedJobSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    viewedAt: { type: Date, required: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["candidate", "employer", "admin"], default: "candidate" },
    phone: String,
    emirate: String,
    headline: String,
    skills: { type: [String], default: [] },
    about: String,
    savedJobIds: { type: [Schema.Types.ObjectId], ref: "Job", default: [] },
    viewedJobs: { type: [ViewedJobSchema], default: [] },
  },
  { timestamps: true },
);

export type UserRecord = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };

export const User = registerModel("User", UserSchema);

const JobAlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    keyword: String,
    emirate: String,
    categorySlug: String,
    employmentType: String,
    active: { type: Boolean, default: true },
    lastNotifiedAt: Date,
  },
  { timestamps: true },
);

export const JobAlert = registerModel("JobAlert", JobAlertSchema);

const ApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobSlug: { type: String, required: true },
    jobTitle: { type: String, required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    message: String,
  },
  { timestamps: true },
);

export const Application = registerModel("Application", ApplicationSchema);
