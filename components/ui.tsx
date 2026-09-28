export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-heading">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-muted">{body}</p>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "today" | "urgent" }) {
  const tones = {
    default: "bg-[#e7f3ef] text-primary",
    today: "bg-[#f4e4c4] text-today",
    urgent: "bg-[#f8e4e4] text-danger",
  };
  return <span className={`px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const inputClass =
  "h-11 w-full border border-line bg-white px-3 text-sm outline-none ring-primary/30 placeholder:text-muted/70 focus:ring-2";

export const labelClass = "mb-1.5 block text-sm font-medium";
