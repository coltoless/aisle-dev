import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account — Aisle",
};

export default function SignupPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <SignupForm />
    </div>
  );
}
