import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6">
      <ComingSoon
        title="Account"
        description="We're putting the finishing touches on this feature. Thanks for your patience!"
        eta="2025-08-24"
      />
    </div>
  );
}
