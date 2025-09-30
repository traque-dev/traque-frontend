import type { QueryKey } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';

export const getActiveSubscriptionKey = (
  organizationId: Organization['id'],
): QueryKey => ['billing', 'subscription', organizationId];

export const getOpenPortalMutationKey = (): QueryKey => ['billing', 'portal'];

export const getCheckoutMutationKey = (
  productSlug: string,
  organizationId: Organization['id'],
): QueryKey => ['billing', 'checkout', productSlug, organizationId];
