import { Schema, type InferSchemaType, type Types } from "mongoose";
import { registerModel } from "@/lib/db";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    website: String,
    description: String,
    verified: { type: Boolean, default: false },
    source: String,
  },
  { timestamps: true },
);

export type CompanyRecord = InferSchemaType<typeof CompanySchema> & { _id: Types.ObjectId };

export const Company = registerModel("Company", CompanySchema);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const Category = registerModel("Category", CategorySchema);

const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    siteName: { type: String, default: "UAEJobPortal" },
    tagline: { type: String, default: "Find Your Next Job in the UAE" },
    jobsPerPage: { type: Number, default: 20 },
    expireUnseenAfterDays: { type: Number, default: 21 },
    requireJobApproval: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Settings = registerModel("Settings", SettingsSchema);
