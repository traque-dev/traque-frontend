import { useActiveSubscription } from '@/api/billing';
import { useActiveOrganization } from '@/api/organizations/hooks';
import { Badge } from '@/components/ui/badge';
import { config } from '@/config';

export function SubscriptionPlanBadge() {
  const { data: activeOrganization } = useActiveOrganization();

  const { data: subscription, isPending: isPendingSubscription } =
    useActiveSubscription(activeOrganization?.id);

  console.log({
    subscription,
  });

  if (config.deployment.isSelfHosted || isPendingSubscription) return null;

  const plan = subscription?.plan;

  const isPlus = plan === 'plus';

  return (
    <Badge variant={isPlus ? 'default' : 'outline'} className="text-[11px]">
      {isPlus ? 'Plus' : 'Free'}
    </Badge>
  );
}
