import qs from 'query-string';
import { axios } from '@/api/axios';
import type { AwsWafCredentials } from '@/api/integrations/aws/waf/types';
import type { Organization } from '@/types/organization';

export async function getAwsWafCredentials(
  organizationId: Organization['id'],
): Promise<AwsWafCredentials> {
  const query = qs.stringify({
    organizationId,
  });

  const url = `/api/v1/integrations/aws/waf/credentials?${query}`;

  const { data } = await axios.get(url);

  return data;
}

export async function setAwsWafCredentials(
  organizationId: Organization['id'],
  creds: AwsWafCredentials,
): Promise<void> {
  const query = qs.stringify({
    organizationId,
  });

  const url = `/api/v1/integrations/aws/waf/credentials?${query}`;

  const { data } = await axios.post(url, creds);

  return data;
}

export async function deleteAwsWafCredentials(
  organizationId: Organization['id'],
): Promise<void> {
  const query = qs.stringify({
    organizationId,
  });

  const url = `/api/v1/integrations/aws/waf/credentials?${query}`;

  const { data } = await axios.delete(url);

  return data;
}
