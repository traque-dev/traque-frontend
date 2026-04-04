import { queryOptions } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import { getIncidentById, getIncidents, getIncidentTimeline } from './index';

export const getIncidentsQueryOptions = (
  organizationId: Organization['id'],
) =>
  queryOptions({
    queryKey: ['incidents', organizationId],
    queryFn: () => getIncidents(organizationId),
  });

export const getIncidentByIdQueryOptions = (
  organizationId: Organization['id'],
  incidentId: string,
) =>
  queryOptions({
    queryKey: ['incidents', organizationId, incidentId],
    queryFn: () => getIncidentById(organizationId, incidentId),
  });

export const getIncidentTimelineQueryOptions = (
  organizationId: Organization['id'],
  incidentId: string,
) =>
  queryOptions({
    queryKey: ['incidents', organizationId, incidentId, 'timeline'],
    queryFn: () => getIncidentTimeline(organizationId, incidentId),
  });
