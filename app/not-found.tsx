import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">Page not found</h1>
      <p className="text-sm text-[var(--color-text-muted)]">That URL does not exist or may have moved.</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
