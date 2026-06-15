import { queryOptions } from '@tanstack/react-query';
import {
  getShortLinkBreakdown,
  getShortLinkById,
  getShortLinkClicks,
  getShortLinkStats,
  getShortLinks,
  getShortLinkTimeseries,
} from '@/api/short-links';
import type { ShortLinkFilters } from '@/api/short-links/types';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type {
  ClickBreakdownDimension,
  ClickTimePeriod,
  ShortLink,
  ShortLinkClick,
} from '@/types/short-link';

export const getShortLinksQueryOptions = (
  organizationId: Organization['id'],
  pageable: Pageable<ShortLink>,
  filters?: ShortLinkFilters,
) =>
  queryOptions({
    queryKey: [
      'short-links',
      organizationId,
      pageable.page,
      pageable.size,
      pageable.sort?.join('|') ?? '',
      filters?.search ?? '',
      filters?.isActive ?? '',
    ],
    queryFn: () => getShortLinks(organizationId, pageable, filters),
    staleTime: 30_000,
  });

export const getShortLinkByIdQueryOptions = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
) =>
  queryOptions({
    queryKey: ['short-links', organizationId, shortLinkId],
    queryFn: () => getShortLinkById(organizationId, shortLinkId),
  });

export const getShortLinkClicksQueryOptions = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  pageable: Pageable<ShortLinkClick>,
) =>
  queryOptions({
    queryKey: [
      'short-links',
      organizationId,
      shortLinkId,
      'clicks',
      pageable.page,
      pageable.size,
      pageable.sort?.join('|') ?? '',
    ],
    queryFn: () => getShortLinkClicks(organizationId, shortLinkId, pageable),
  });

export const getShortLinkStatsQueryOptions = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
) =>
  queryOptions({
    queryKey: ['short-links', organizationId, shortLinkId, 'stats'],
    queryFn: () => getShortLinkStats(organizationId, shortLinkId),
  });

export const getShortLinkTimeseriesQueryOptions = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  period: ClickTimePeriod = 'week',
) =>
  queryOptions({
    queryKey: [
      'short-links',
      organizationId,
      shortLinkId,
      'timeseries',
      period,
    ],
    queryFn: () => getShortLinkTimeseries(organizationId, shortLinkId, period),
  });

export const getShortLinkBreakdownQueryOptions = (
  organizationId: Organization['id'],
  shortLinkId: ShortLink['id'],
  dimension: ClickBreakdownDimension = 'country',
  limit = 10,
) =>
  queryOptions({
    queryKey: [
      'short-links',
      organizationId,
      shortLinkId,
      'breakdown',
      dimension,
      limit,
    ],
    queryFn: () =>
      getShortLinkBreakdown(organizationId, shortLinkId, dimension, limit),
  });
