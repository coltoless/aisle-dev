"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <Card className="w-full max-w-[440px] border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
          Reset password
        </CardTitle>
        <p className="text-sm text-[var(--color-text-muted)]">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sent ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-sm text-[var(--color-text-secondary)]">
            If an account exists for that email, you&apos;ll receive password reset instructions shortly.
          </p>
        ) : (
          <form
            className="space-y-4"
            action={async (formData) => {
              setError(null);
              const result = await resetPassword(formData);
              if ("error" in result) {
                setError(result.error);
              } else {
                setSent(true);
              }
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
            <Button
              type="submit"
              className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
            >
              Send reset link
            </Button>
          </form>
        )}

        {error ? (
          <p className="text-center text-sm text-[var(--color-status-error)]" role="alert">
            {error}
          </p>
        ) : null}

        <p className="text-center text-sm">
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            ← Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
