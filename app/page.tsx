import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-16">
      <p className="font-display text-5xl font-semibold text-ink">Aisle</p>
      <p className="mt-4 max-w-md text-center text-ink-secondary">
        Plan your wedding in one calm place — venues, checklist, budget, vendors, and contracts.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground shadow-card transition-colors hover:bg-accent-hover"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-md border border-line bg-canvas-card px-6 text-sm font-medium text-ink shadow-card transition-colors hover:bg-canvas-subtle"
        >
          Start planning
        </Link>
      </div>
    </div>
  );
}
