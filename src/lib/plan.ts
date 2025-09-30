import { redirect } from '@tanstack/react-router';
import type { Organization } from 'better-auth/plugins/organization';
import { getActiveSubscriptionQueryOptions } from '@/api/billing';
import { config } from '@/config';
import { queryClient } from '@/main';
import type { Plan } from '@/types/billing';

type VerifyPlanAccessParams = {
  activeOrganization: Organization;
};

export function verifyPlanAccess(plan: Plan) {
  return async ({ activeOrganization }: VerifyPlanAccessParams) => {
    if (config.deployment.isSelfHosted || plan === 'free') return null;

    const subscription = await queryClient.ensureQueryData(
      getActiveSubscriptionQueryOptions(activeOrganization.id),
    );

    if (subscription?.plan !== plan) {
      throw redirect({
        to: '/plus',
      });
    }

    return subscription;
  };
}
