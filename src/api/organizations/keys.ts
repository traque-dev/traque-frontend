import type { QueryKey } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';

export const getActiveOrganizationKey = (): QueryKey => [
  'organization',
  'active',
];

export const getOrganizationsKey = (): QueryKey => ['organizations'];

export const getOrganizationByIdKey = (
  organizationId: Organization['id'],
): QueryKey => ['organizations', organizationId];

export const getCreateOrganizationMutationKey = (): QueryKey => [
  'organization',
  'create',
];

export const getUpdateOrganizationMutationKey = (
  organizationId: Organization['id'],
): QueryKey => ['organization', 'update', organizationId];

export const getDeleteOrganizationMutationKey = (
  organizationId: Organization['id'],
): QueryKey => ['organization', 'delete', organizationId];
