# UAEJobPortal

UAE job aggregation site. Listings are stored in MongoDB after a server-side sync from an authorized API or feed, or when an employer posts a job. The public site stays empty until that happens.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, MongoDB, Mongoose, Auth.js, Zod.

## Local setup

```bash
npm install
cp .env.example .env.local
# set MONGODB_URI and NEXTAUTH_SECRET
npm run dev
```

Sign in once with `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create the admin user. Then open `/admin/job-sources`, add a provider, and use Sync Now.

## Connect a source

Add a folder under `lib/job-sources/<provider>/adapter.ts` that implements:

```ts
interface JobSourceAdapter {
  fetchJobs(): Promise<unknown[]>;
  normalizeJob(job: unknown): NormalizedJob | null;
}
```

Register the factory in `lib/job-sources/registry.ts`. The job pages do not need to change.

Built-in adapters: Adzuna, Jooble, JSON feed, RSS/Atom, XML feed, Greenhouse, Lever, Remotive, and direct employer posts. Each one runs only after an admin enables that source. Remotive and the ATS adapters import a listing only when its location is in the UAE.

Do not point a source at a site whose terms forbid this use. The fetch client stops on HTTP 429 and does not bypass authentication.

API keys belong in environment variables named by `apiKeyEnv` / `appIdEnv`. A key typed into the admin form is stored with `select: false` and is not rendered back to the browser.

## Scheduling

`GET /api/cron/sync` imports due sources. `GET /api/cron/expire` closes jobs past `expiresAt` and external jobs that have not been seen for the configured number of days. `GET /api/cron/alerts` emails saved alerts when `RESEND_API_KEY` and `ALERT_FROM_EMAIL` are set.

Send `Authorization: Bearer $CRON_SECRET`.

- Vercel: `vercel.json` schedules the routes. Set `CRON_SECRET` in the project.
- VPS or any crontab: `curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://uaejobportal.online/api/cron/sync`
- Long-running worker: `npm run worker`

## Tests

```bash
npm test
```

Tests cover UAE filtering, normalization, duplicate decisions, expiry, and SEO paths. They do not insert jobs.
