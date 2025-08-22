import qs from 'query-string';
import { axios } from '@/api/axios';
import type { IssueFilters } from '@/api/issues/types';
import type { Issue } from '@/types/issue';
import type { IssueSeverity } from '@/types/issue-severity';
import type { IssueStatus } from '@/types/issue-status';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

export async function getProjectIssues(
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Issue>,
  filters?: IssueFilters,
): Promise<Page<Issue>> {
  const query = qs.stringify(
    {
      ...pageable,
      ...filters,
    },
    { arrayFormat: 'comma', skipNull: true, skipEmptyString: true },
  );

  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/issues?${query}`;

  const { data } = await axios.get<Page<Issue>>(url);

  return data;
}

export async function getProjectIssueById(
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
): Promise<Issue> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}`;

  const { data } = await axios.get<Issue>(url);

  return data;
}

export async function changeIssueStatus(
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
  status: IssueStatus,
): Promise<void> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/status`;

  const { data } = await axios.put(url, {
    status,
  });

  return data;
}

export async function changeIssueSeverity(
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
  severity: IssueSeverity,
): Promise<void> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/severity`;

  const { data } = await axios.put(url, {
    severity,
  });

  return data;
}
