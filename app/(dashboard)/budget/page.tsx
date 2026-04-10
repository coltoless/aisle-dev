import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function BudgetPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Budget"
        description="Track estimates, quotes, and what’s left across every category."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Charts and category detail will appear here.</p>
    </div>
  );
}
