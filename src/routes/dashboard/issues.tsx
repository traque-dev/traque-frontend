import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

export const Route = createFileRoute('/dashboard/issues')({
  component: IssuesPage,
});

function IssuesPage() {
  return (
    <div className="p-6">
      <ComingSoon
        title="Issues"
        description="We're putting the finishing touches on this feature. Thanks for your patience!"
        eta="2025-08-24"
      />
    </div>
  );
}
