import { axios } from '@/api/axios';
import type { Organization } from '@/types/organization';

export async function getOrganizations(): Promise<Organization[]> {
  const url = '/api/v1/organizations';

  const { data } = await axios.get<Organization[]>(url);

  return data;
}

export async function getOrganizationById(
  organizationId: Organization['id'],
): Promise<Organization> {
  const url = `/api/v1/organizations/${organizationId}`;

  const { data } = await axios.get<Organization>(url);

  return data;
}
