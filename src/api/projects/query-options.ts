import { queryOptions } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import { getProjectById, getProjects } from './index';

export const getProjectsQueryOptions = (organizationId: Organization['id']) =>
  queryOptions({
    queryKey: ['projects', organizationId],
    queryFn: () => getProjects(organizationId),
  });

export const getProjectByIdQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) =>
  queryOptions({
    queryKey: ['project', organizationId, projectId],
    queryFn: () => getProjectById(organizationId, projectId),
  });
