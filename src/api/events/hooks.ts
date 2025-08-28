import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/types/event';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import { getProjectEventsQueryOptions } from './query-options';

export const useProjectEvents = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Event>,
) => {
  return useQuery(
    getProjectEventsQueryOptions(organizationId, projectId, pageable),
  );
};
