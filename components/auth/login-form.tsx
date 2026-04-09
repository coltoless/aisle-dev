"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn, signInWithGoogle } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(urlError ? decodeParam(urlError) : null);

  return (
    <Card className="w-full max-w-[440px] border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
          Welcome back
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={signInWithGoogle}>
          <Button type="submit" className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover">
            Continue with Google
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border)]" aria-hidden />
          <span className="relative bg-[var(--color-bg-card)] px-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            or
          </span>
        </div>

        <form
          className="space-y-4"
          action={async (formData) => {
            setError(null);
            const result = await signIn(formData);
            if (result?.error) setError(result.error);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--color-text-secondary)]">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password" className="text-[var(--color-text-secondary)]">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
          >
            Log In
          </Button>
        </form>

        {error ? (
          <p className="text-center text-sm text-[var(--color-status-error)]" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[var(--color-border)] pt-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--color-accent)] hover:underline">
            Start planning →
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
