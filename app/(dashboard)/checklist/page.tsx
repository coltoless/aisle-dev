import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function ChecklistPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Planning checklist"
        description="Work through phases from a year out to the week of your wedding."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Interactive checklist by phase will appear here.</p>
    </div>
  );
}
