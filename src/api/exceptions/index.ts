import qs from 'query-string';
import { axios } from '@/api/axios';
import type { Exception, ExceptionDailyStatistic } from '@/types/exception';
import type { Issue } from '@/types/issue';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

export async function getExceptions(
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
  pageable: Pageable<Exception>,
): Promise<Page<Exception>> {
  const query = qs.stringify({
    issueId,
    ...pageable,
  });

  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/exceptions?${query}`;

  const { data } = await axios.get<Page<Exception>>(url);

  return data;
}

export async function getExceptionById(
  organizationId: Organization['id'],
  projectId: Project['id'],
  exceptionId: Exception['id'],
): Promise<Exception> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/exceptions/${exceptionId}`;

  const { data } = await axios.get<Exception>(url);

  return data;
}

export type ExceptionDailyStatisticsParams = {
  from: string;
  to: string;
};

export async function getExceptionDailyStatistics(
  organizationId: Organization['id'],
  projectId: Project['id'],
  params: ExceptionDailyStatisticsParams,
): Promise<ExceptionDailyStatistic[]> {
  const url = `/api/v1/organizations/${organizationId}/projects/${projectId}/exceptions/statistics/daily`;

  const { data } = await axios.get<ExceptionDailyStatistic[]>(url, {
    params,
  });

  return data;
}
