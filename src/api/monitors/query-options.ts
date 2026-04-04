import { queryOptions } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import {
  getMonitorAvailability,
  getMonitorById,
  getMonitorChecks,
  getMonitorResponseTimes,
  getMonitorSummary,
  getMonitors,
} from './index';

export const getMonitorsQueryOptions = (organizationId: Organization['id']) =>
  queryOptions({
    queryKey: ['monitors', organizationId],
    queryFn: () => getMonitors(organizationId),
  });

export const getMonitorByIdQueryOptions = (
  organizationId: Organization['id'],
  monitorId: string,
) =>
  queryOptions({
    queryKey: ['monitors', organizationId, monitorId],
    queryFn: () => getMonitorById(organizationId, monitorId),
  });

export const getMonitorChecksQueryOptions = (
  organizationId: Organization['id'],
  monitorId: string,
) =>
  queryOptions({
    queryKey: ['monitors', organizationId, monitorId, 'checks'],
    queryFn: () => getMonitorChecks(organizationId, monitorId),
  });

export const getMonitorSummaryQueryOptions = (
  organizationId: Organization['id'],
  monitorId: string,
) =>
  queryOptions({
    queryKey: ['monitors', organizationId, monitorId, 'summary'],
    queryFn: () => getMonitorSummary(organizationId, monitorId),
  });

export const getMonitorResponseTimesQueryOptions = (
  organizationId: Organization['id'],
  monitorId: string,
  params?: {
    region?: 'EUROPE' | 'NORTH_AMERICA' | 'ASIA' | 'AUSTRALIA';
    period?: 'day' | 'week' | 'month';
  },
) =>
  queryOptions({
    queryKey: ['monitors', organizationId, monitorId, 'response-times', params],
    queryFn: () => getMonitorResponseTimes(organizationId, monitorId, params),
  });

export const getMonitorAvailabilityQueryOptions = (
  organizationId: Organization['id'],
  monitorId: string,
  params?: { from?: string; to?: string },
) =>
  queryOptions({
    queryKey: ['monitors', organizationId, monitorId, 'availability', params],
    queryFn: () => getMonitorAvailability(organizationId, monitorId, params),
  });
