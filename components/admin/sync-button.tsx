"use client";

import { useState } from "react";
import { syncSourceAction } from "@/app/actions/admin";

export function SyncButton({ sourceId }: { sourceId: string }) {
  const [state, setState] = useState<"idle" | "running" | Awaited<ReturnType<typeof syncSourceAction>>>("idle");

  async function onClick() {
    setState("running");
    const result = await syncSourceAction(sourceId);
    setState(result);
  }

  return (
    <div className="space-y-3">
      <button className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={state === "running"} onClick={onClick} type="button">
        {state === "running" ? "Sync started..." : "Sync Now"}
      </button>
      {state !== "idle" && state !== "running" && (
        <div className="rounded-2xl border border-line bg-card p-4 text-sm">
          <p className="font-medium">{state.status === "failed" ? "Sync failed" : "Sync finished"}</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li>Fetched: {state.fetchedCount}</li>
            <li>UAE Jobs: {state.uaeCount}</li>
            <li>New: {state.importedCount}</li>
            <li>Updated: {state.updatedCount}</li>
            <li>Skipped: {state.skippedCount}</li>
            <li>Duplicates: {state.duplicateCount}</li>
            {state.errorCount > 0 && <li>Failed: {state.errorCount}</li>}
          </ul>
          {state.message && <p className="mt-2 text-danger">{state.message}</p>}
          {state.errors.map((error) => (
            <p key={error} className="mt-1 text-danger">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}
