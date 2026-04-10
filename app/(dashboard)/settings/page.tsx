import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function SettingsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Settings"
        description="Account details and wedding profile preferences."
      />
      <p className="text-sm text-[var(--color-text-muted)]">Editable profile and preferences will appear here.</p>
    </div>
  );
}
