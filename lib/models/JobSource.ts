import { Schema, type InferSchemaType, type Types } from "mongoose";
import { registerModel } from "@/lib/db";

const SyncSummarySchema = new Schema(
  {
    fetchedCount: { type: Number, default: 0 },
    uaeCount: { type: Number, default: 0 },
    importedCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    status: String,
  },
  { _id: false },
);

const JobSourceSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["API", "JSON", "XML", "RSS", "ATS", "MANUAL"],
      required: true,
    },
    provider: { type: String, required: true },
    apiUrl: String,
    feedUrl: String,
    apiKey: { type: String, select: false },
    apiKeyEnv: String,
    appIdEnv: String,
    enabled: { type: Boolean, default: false },
    country: { type: String, default: "AE" },
    locationFilter: { type: [String], default: [] },
    lastSyncAt: Date,
    syncInterval: { type: Number, default: 60 },
    syncMode: { type: String, enum: ["snapshot", "incremental"], default: "incremental" },
    status: {
      type: String,
      enum: ["idle", "connected", "error", "disabled"],
      default: "idle",
    },
    lastError: String,
    attributionText: String,
    termsUrl: String,
    config: { type: Schema.Types.Mixed, default: {} },
    lastSync: SyncSummarySchema,
  },
  { timestamps: true },
);

export type JobSourceRecord = InferSchemaType<typeof JobSourceSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  apiKey?: string;
};

export const JobSource = registerModel("JobSource", JobSourceSchema);
