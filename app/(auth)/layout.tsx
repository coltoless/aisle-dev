import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aisle — Sign in",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
      <header className="flex shrink-0 justify-center pt-10 pb-6">
        <span className="font-display text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Aisle
        </span>
      </header>
      <div className="flex flex-1 flex-col items-center px-5 pb-12">{children}</div>
    </div>
  );
}
