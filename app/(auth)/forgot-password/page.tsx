import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password — Aisle",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <ForgotPasswordForm />
    </div>
  );
}
