import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function VendorsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Vendors"
        description="See who you’re researching, who’s booked, and what’s still open."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Pipeline and kanban views will appear here.</p>
    </div>
  );
}
