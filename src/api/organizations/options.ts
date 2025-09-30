import { queryOptions } from '@tanstack/react-query';
import { auth } from '@/lib/auth';
import { getActiveOrganizationKey } from './keys';

export const getActiveOrganizationQueryOptions = () =>
  queryOptions({
    queryKey: getActiveOrganizationKey(),
    queryFn: async () => {
      const { data, error } = await auth.organization.getFullOrganization();

      if (error) throw error;

      return data;
    },
  });
