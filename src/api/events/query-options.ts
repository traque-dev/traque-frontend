import { queryOptions, skipToken } from '@tanstack/react-query';
import type { Event } from '@/types/event';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import { getEvents } from './index';

export const getProjectEventsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Event>,
) =>
  queryOptions({
    queryKey: [
      'events',
      organizationId,
      projectId,
      pageable.page,
      pageable.size,
      pageable.sort?.join('|') ?? '',
    ],
    queryFn: projectId
      ? () => getEvents(organizationId, projectId, pageable)
      : skipToken,
    staleTime: 5_000,
  });
