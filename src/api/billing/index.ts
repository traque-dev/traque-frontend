export * from './hooks.ts';
export * from './options.ts';

import qs from 'query-string';
import { axios } from '@/api/axios';
import type { Subscription } from '@/types/billing';
import type { Organization } from '@/types/organization';

type GetSubscriptionsParams = {
  active?: boolean;
};

export async function getSubscriptions(
  organizationId: Organization['id'],
  params?: GetSubscriptionsParams,
): Promise<Subscription[]> {
  const query = qs.stringify(
    {
      ...params,
    },
    {
      skipNull: true,
      skipEmptyString: true,
    },
  );

  const url = `/api/v1/billing/subscriptions/${organizationId}${
    query ? `?${query}` : ''
  }`;

  const { data } = await axios.get<Subscription[]>(url);

  return data;
}
