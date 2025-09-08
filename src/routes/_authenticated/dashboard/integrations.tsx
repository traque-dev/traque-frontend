import { createFileRoute, notFound } from '@tanstack/react-router';
import { AwsWafIntegrationCard } from '@/components/integrations/aws-waf/aws-waf-integration-card';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/dashboard/integrations')({
  component: IntegrationsPage,
  loader: async () => {
    const { data: activeOrganization } =
      await auth.organization.getFullOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: {
          type: 'organization',
        },
      });
    }
  },
  notFoundComponent: OrganizationProjectGate,
});

function IntegrationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools to bring security insights into Traque.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <AwsWafIntegrationCard />
      </div>
    </div>
  );
}
