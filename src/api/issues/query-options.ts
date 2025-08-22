import { queryOptions } from '@tanstack/react-query';
import { getProjectIssueById, getProjectIssues } from '@/api/issues';
import type { IssueFilters } from '@/api/issues/types';
import type { Issue } from '@/types/issue';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

export const getProjectIssuesQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Issue>,
  filters?: IssueFilters,
) =>
  queryOptions({
    queryKey: [
      'issues',
      organizationId,
      projectId,
      pageable.page,
      pageable.size,
      pageable.sort?.join('|') ?? '',
      filters?.status ?? '',
      filters?.severity ?? '',
      (filters?.environments ?? []).join(','),
      filters?.dateFrom ?? '',
      filters?.dateTo ?? '',
    ],
    queryFn: () =>
      getProjectIssues(organizationId, projectId, pageable, filters),
    staleTime: 30_000,
  });

export const getProjectIssueByIdQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
) =>
  queryOptions({
    queryKey: ['issues', organizationId, projectId, issueId],
    queryFn: () => getProjectIssueById(organizationId, projectId, issueId),
  });
