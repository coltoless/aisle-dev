import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function ContractsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Contracts"
        description="Store agreements and get quick AI summaries of key terms."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Uploads and review will appear here.</p>
    </div>
  );
}
