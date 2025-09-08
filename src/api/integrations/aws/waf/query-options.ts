import {
  mutationOptions,
  queryOptions,
  skipToken,
} from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import {
  deleteAwsWafCredentials,
  getAwsWafCredentials,
  setAwsWafCredentials,
} from './index';
import type { AwsWafCredentials } from './types';

export const getAwsWafCredentialsQueryOptions = (
  organizationId: Organization['id'],
) =>
  queryOptions<AwsWafCredentials | null>({
    queryKey: ['awsWafCredentials', organizationId],
    queryFn: organizationId
      ? () => getAwsWafCredentials(organizationId)
      : skipToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

export const setAwsWafCredentialsMutationOptions = (
  organizationId: Organization['id'],
) =>
  mutationOptions({
    mutationKey: ['setAwsWafCredentials', organizationId],
    mutationFn: (creds: AwsWafCredentials) =>
      setAwsWafCredentials(organizationId, creds),
  });

export const deleteAwsWafCredentialsMutationOptions = (
  organizationId: Organization['id'],
) =>
  mutationOptions({
    mutationKey: ['deleteAwsWafCredentials', organizationId],
    mutationFn: () => deleteAwsWafCredentials(organizationId),
  });
