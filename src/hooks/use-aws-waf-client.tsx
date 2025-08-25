import { WAFV2Client } from '@aws-sdk/client-wafv2';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useAwsWafCredentials } from '@/api/integrations/aws/waf/hooks';
import { auth } from '@/lib/auth';
import { queryClient } from '@/main';

type UseWAFClientResult = {
  client: WAFV2Client | undefined;
  isLoading: boolean;
  error: unknown;
  isConnected: boolean;

  cleanClient(): void;
  disconnect(): void;
};

/**
 * Custom hook to return a memoized AWS WAFV2Client for the active organization.
 *
 * It uses the `useAwsWafCredentialsQuery` hook to load credentials, and once
 * the credentials are available, it creates (or reuses) a cached WAFV2Client.
 *
 * @returns {Object} An object containing:
 *   - client: The memoized WAFV2Client instance (or null if not ready),
 *   - isLoading: A boolean indicating whether credentials are still being loaded,
 *   - error: Any error that occurred during credentials fetching.
 */
export const useAwsWafClient = (): UseWAFClientResult => {
  const { data: activeOrganization } = auth.useActiveOrganization();

  const organizationId = activeOrganization?.id;

  const {
    data: creds,
    isLoading,
    error,
  } = useAwsWafCredentials(organizationId);

  const clientKey = ['aws-waf-client', organizationId, creds?.accessKeyId];

  const { data: client } = useQuery({
    queryKey: clientKey,
    queryFn: creds
      ? () => {
          return new WAFV2Client({
            region: creds.region,
            credentials: {
              accessKeyId: creds.accessKeyId,
              secretAccessKey: creds.secretAccessKey,
            },
          });
        }
      : skipToken,
  });

  const cleanClient = () => {
    queryClient.setQueryData(
      ['integrations-aws-waf-get-aws-waf-creds', organizationId],
      null,
    );
    queryClient.setQueryData(clientKey, null);
  };

  const disconnect = () => {
    cleanClient();
  };

  return {
    isConnected: !!creds,
    client,
    isLoading,
    error,
    cleanClient,
    disconnect,
  };
};
