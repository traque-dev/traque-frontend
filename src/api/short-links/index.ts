import qs from 'query-string';
import { axios } from '@/api/axios';
import type { ShortLinkFilters } from '@/api/short-links/types';
import type { PositiveResponse } from '@/types/bug';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Pageable } from '@/types/pageable';
import type {
  ClickBreakdownDimension,
  ClickTimePeriod,
  CreateShortLinkDTO,
  ShortLink,
  ShortLinkBreakdownItem,
  ShortLinkClick,
  ShortLinkStats,
  ShortLinkTimePoint,
  UpdateShortLinkDTO,
} from '@/types/short-link';

const base = (orgId: string) => `/api/v1/organizations/${orgId}/short-links`;

export async function getShortLinks(
  organizationId: Organization['id'],
  pageable: Pageable<ShortLink>,
  filters?: ShortLinkFilters,
): Promise<Page<ShortLink>> {
  const query = qs.stringify(
    {
      ...pageable,
      ...filters,
    },
    { arrayFormat: 'comma', skipNull: true, skipEmptyString: true },
  );

  const { data } = await axios.get<Page<ShortLink>>(
    `${base(organizationId!)}?${query}`,
  );

  return data;
}

export async function getShortLinkById(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
): Promise<ShortLink> {
  const { data } = await axios.get<ShortLink>(
    `${base(organizationId!)}/${shortLinkId}`,
  );

  return data;
}

export async function createShortLink(
  organizationId: Organization['id'],
  dto: CreateShortLinkDTO,
): Promise<ShortLink> {
  const { data } = await axios.post<ShortLink>(base(organizationId!), dto);

  return data;
}

export async function updateShortLink(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  dto: UpdateShortLinkDTO,
): Promise<ShortLink> {
  const { data } = await axios.patch<ShortLink>(
    `${base(organizationId!)}/${shortLinkId}`,
    dto,
  );

  return data;
}

export async function deleteShortLink(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId!)}/${shortLinkId}`,
  );

  return data;
}

export async function getShortLinkClicks(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  pageable: Pageable<ShortLinkClick>,
): Promise<Page<ShortLinkClick>> {
  const query = qs.stringify(
    { ...pageable },
    { arrayFormat: 'comma', skipNull: true, skipEmptyString: true },
  );

  const { data } = await axios.get<Page<ShortLinkClick>>(
    `${base(organizationId!)}/${shortLinkId}/clicks?${query}`,
  );

  return data;
}

export async function getShortLinkStats(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
): Promise<ShortLinkStats> {
  const { data } = await axios.get<ShortLinkStats>(
    `${base(organizationId!)}/${shortLinkId}/stats`,
  );

  return data;
}

export async function getShortLinkTimeseries(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  period: ClickTimePeriod = 'week',
): Promise<ShortLinkTimePoint[]> {
  const { data } = await axios.get<ShortLinkTimePoint[]>(
    `${base(organizationId!)}/${shortLinkId}/timeseries`,
    { params: { period } },
  );

  return data;
}

export async function getShortLinkBreakdown(
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  dimension: ClickBreakdownDimension = 'country',
  limit = 10,
): Promise<ShortLinkBreakdownItem[]> {
  const { data } = await axios.get<ShortLinkBreakdownItem[]>(
    `${base(organizationId!)}/${shortLinkId}/breakdown`,
    { params: { dimension, limit } },
  );

  return data;
}
