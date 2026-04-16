"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">Something went wrong</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {error.message || "An unexpected error occurred. You can try again or return home."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()} className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
