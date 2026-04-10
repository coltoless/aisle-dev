import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

type DashboardHomeHeaderProps = {
  partner1: string;
  partner2: string;
  subline: string;
};

export function DashboardHomeHeader({ partner1, partner2, subline }: DashboardHomeHeaderProps) {
  const title = `${partner1} & ${partner2}'s Wedding`;

  return (
    <header className="pb-6">
      <DashboardGreeting />
      <h1 className="mt-2 font-display text-[2.25rem] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h1>
      <p className="mt-2 font-sans text-sm text-[var(--color-text-muted)]">{subline}</p>
      <hr className="mt-6 border-0 border-t border-[var(--color-border)]" />
    </header>
  );
}
