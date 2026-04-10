import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in — Aisle",
};

function decodeOAuthErrorParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string | string[] };
}) {
  const raw = searchParams.error;
  const encoded = Array.isArray(raw) ? raw[0] : raw;
  const initialError = encoded ? decodeOAuthErrorParam(encoded) : null;

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <LoginForm initialError={initialError} />
    </div>
  );
}
