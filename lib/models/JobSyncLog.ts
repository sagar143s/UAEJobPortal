import { Schema, type InferSchemaType, type Types } from "mongoose";
import { registerModel } from "@/lib/db";

const JobSyncLogSchema = new Schema(
  {
    sourceId: { type: Schema.Types.ObjectId, ref: "JobSource", required: true, index: true },
    sourceName: { type: String, required: true },
    trigger: { type: String, enum: ["manual", "cron", "worker"], required: true },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    status: {
      type: String,
      enum: ["running", "success", "partial", "failed"],
      required: true,
    },
    fetchedCount: { type: Number, default: 0 },
    uaeCount: { type: Number, default: 0 },
    importedCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    errors: { type: [String], default: [] },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

JobSyncLogSchema.index({ sourceId: 1, startedAt: -1 });

export type JobSyncLogRecord = InferSchemaType<typeof JobSyncLogSchema> & {
  _id: Types.ObjectId;
};

export const JobSyncLog = registerModel("JobSyncLog", JobSyncLogSchema);
