import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/dashboard/integrations')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6">
      <ComingSoon
        title="Integrations"
        description="We're putting the finishing touches on this feature. Thanks for your patience!"
        eta="2025-08-24"
      />
    </div>
  );
}
