import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function VenuesPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Venues"
        description="Shortlist venues, compare options, and keep notes in one place."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Discovery and comparison tools will appear here.</p>
    </div>
  );
}
