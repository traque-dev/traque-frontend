import { useMutation, useQuery } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import {
  getActiveSubscriptionQueryOptions,
  getCheckoutMutationOptions,
  getOpenPortalMutationOptions,
} from './options';

export const useActiveSubscription = (organizationId: Organization['id']) => {
  return useQuery(getActiveSubscriptionQueryOptions(organizationId));
};

export const useOpenBillingPortal = () => {
  return useMutation(getOpenPortalMutationOptions());
};

export const useCheckout = (
  productSlug: string,
  organizationId: Organization['id'],
) => {
  return useMutation(getCheckoutMutationOptions(productSlug, organizationId));
};
