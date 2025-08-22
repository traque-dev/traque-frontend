import { useQuery } from '@tanstack/react-query';
import { getProjectIssuesQueryOptions } from '@/api/issues/query-options';
import type { IssueFilters } from '@/api/issues/types';
import type { Issue } from '@/types/issue';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

export const useProjectIssues = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Issue>,
  filters?: IssueFilters,
) => {
  return useQuery({
    ...getProjectIssuesQueryOptions(
      organizationId,
      projectId,
      pageable,
      filters,
    ),
    enabled: Boolean(projectId),
  });
};
