import { queryOptions, skipToken } from '@tanstack/react-query';
import { config } from '@/config';
import { auth } from '@/lib/auth';
import type { Organization } from '@/types/organization';
import { getSubscriptions } from '.';
import { getActiveSubscriptionKey } from './keys';

export const getActiveSubscriptionQueryOptions = (
  organizationId: Organization['id'],
) =>
  queryOptions({
    queryKey: getActiveSubscriptionKey(organizationId),
    queryFn:
      organizationId && config.deployment.isTraqueCloud
        ? async () => {
            const subscriptions = await getSubscriptions(organizationId, {
              active: true,
            });

            return subscriptions?.[0] ?? null;
          }
        : skipToken,
  });

export const getOpenPortalMutationOptions = () => ({
  mutationFn: async () => {
    await auth.customer.portal();
    return true;
  },
});

export const getCheckoutMutationOptions = (
  productSlug: string,
  organizationId: Organization['id'],
) => ({
  mutationFn: async () => {
    await auth.checkout({
      slug: productSlug,
      referenceId: organizationId,
    });
    return true;
  },
});
