import { syncDueSources } from "../lib/sync/engine";

const result = await syncDueSources("worker");
console.log(JSON.stringify(result, null, 2));
