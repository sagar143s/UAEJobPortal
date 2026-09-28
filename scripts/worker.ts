import { expireStaleJobs, syncDueSources } from "../lib/sync/engine";

async function tick() {
  const synced = await syncDueSources("worker");
  const expired = await expireStaleJobs();
  console.log(JSON.stringify({ synced, expired }));
}

await tick();
setInterval(() => {
  void tick();
}, 60_000);
