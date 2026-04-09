import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in — Aisle",
};

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <Suspense fallback={<div className="h-[420px] w-full max-w-[440px] animate-pulse rounded-xl bg-canvas-subtle" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
