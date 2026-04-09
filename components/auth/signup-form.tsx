"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle, signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-[440px] border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
          Create your account
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
            const result = await signUp(formData);
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
            <Label htmlFor="password" className="text-[var(--color-text-secondary)]">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[var(--color-text-secondary)]">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
          >
            Create Account
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
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Log in →
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
