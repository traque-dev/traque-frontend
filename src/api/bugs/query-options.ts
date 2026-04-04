import { queryOptions } from '@tanstack/react-query';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import {
  getBugActivities,
  getBugById,
  getBugComments,
  getBugReproductionSteps,
  getBugStatistics,
  getBugs,
  getProjectBugLabels,
} from './index';

export const getBugsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId],
    queryFn: () => getBugs(organizationId, projectId),
  });

export const getBugByIdQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, bugId],
    queryFn: () => getBugById(organizationId, projectId, bugId),
  });

export const getBugStatisticsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, 'statistics'],
    queryFn: () => getBugStatistics(organizationId, projectId),
  });

export const getBugCommentsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, bugId, 'comments'],
    queryFn: () => getBugComments(organizationId, projectId, bugId),
  });

export const getProjectBugLabelsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, 'labels'],
    queryFn: () => getProjectBugLabels(organizationId, projectId),
  });

export const getBugReproductionStepsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, bugId, 'steps'],
    queryFn: () => getBugReproductionSteps(organizationId, projectId, bugId),
  });

export const getBugActivitiesQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  bugId: string,
) =>
  queryOptions({
    queryKey: ['bugs', organizationId, projectId, bugId, 'activities'],
    queryFn: () => getBugActivities(organizationId, projectId, bugId),
  });
