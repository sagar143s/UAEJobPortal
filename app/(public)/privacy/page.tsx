export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Privacy</h1>
      <div className="mt-6 space-y-4 leading-7">
        <p>You can search jobs without an account. If you register, we store your name, email, password hash, profile fields, saved jobs, alerts and the jobs you open while signed in.</p>
        <p>Applications to direct jobs store the name, email, phone and message you submit, and are visible to the employer who posted the job.</p>
        <p>API keys for job sources are not shown in the browser. We do not sell candidate data.</p>
      </div>
    </section>
  );
}
