export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">How UAEJobPortal works</h1>
      <div className="mt-6 space-y-4 leading-7 text-[#243246]">
        <p>UAEJobPortal aggregates jobs for the United Arab Emirates. Listings are stored in MongoDB after a server-side sync from an authorized API, RSS, XML or JSON feed, an employer ATS board, or a job posted directly by an employer.</p>
        <p>The site does not scrape LinkedIn, Indeed, Bayt or other sites whose terms do not allow it. Adapters call documented APIs and feeds that an administrator configures. API keys stay in environment variables or in server-only fields and are never sent to the browser.</p>
        <p>Each external listing keeps its source name, source URL and application URL. If the provider requires attribution, that text is shown on the listing. Choosing Apply on Original Website leaves UAEJobPortal and continues on the source that owns the application.</p>
        <p>If no source is connected, the pages stay empty. Sample companies and sample jobs are not loaded.</p>
      </div>
    </section>
  );
}
