import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import {
  deleteAwsWafCredentialsMutationOptions,
  getAwsWafCredentialsQueryOptions,
  setAwsWafCredentialsMutationOptions,
} from './query-options';

export const useAwsWafCredentials = (organizationId: Organization['id']) => {
  return useQuery(getAwsWafCredentialsQueryOptions(organizationId));
};

export const useSetAwsWafCredentials = (organizationId: Organization['id']) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...setAwsWafCredentialsMutationOptions(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['awsWafCredentials', organizationId],
      });
    },
  });
};

export const useDeleteAwsWafCredentials = (
  organizationId: Organization['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...deleteAwsWafCredentialsMutationOptions(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['awsWafCredentials', organizationId],
      });
    },
  });
};
