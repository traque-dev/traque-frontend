import { useMutation, useQuery } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import { createProject } from '.';
import {
  getProjectByIdQueryOptions,
  getProjectsQueryOptions,
} from './query-options';

export const useProjects = (organizationId: Organization['id']) => {
  return useQuery(getProjectsQueryOptions(organizationId));
};

export const useProjectById = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  return useQuery(getProjectByIdQueryOptions(organizationId, projectId));
};

export const useCreateProject = (organizationId: Organization['id']) => {
  return useMutation({
    mutationFn: (project: Project) => createProject(organizationId, project),
  });
};
