import { useQuery } from '@tanstack/react-query';
import { getActiveOrganizationQueryOptions } from './options';

export function useActiveOrganization() {
  return useQuery({
    ...getActiveOrganizationQueryOptions(),
    retry: false,
  });
}
