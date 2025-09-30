import { createFileRoute } from '@tanstack/react-router';
import { UpdateOrganizationNameCard } from '@/components/organization/update-organization-name-card';

export const Route = createFileRoute('/_authenticated/settings/organization/')({
  component: OrganizationSettings,
});

function OrganizationSettings() {
  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Organization</h1>
          <p className="text-muted-foreground text-sm">
            Manage organization settings
          </p>
        </div>
      </div>

      <UpdateOrganizationNameCard />
    </div>
  );
}
