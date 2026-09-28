import type { AdapterFactory } from "@/lib/job-sources/types";

export const createManualAdapter: AdapterFactory = () => ({
  async fetchJobs() {
    return [];
  },
  normalizeJob() {
    return null;
  },
});
