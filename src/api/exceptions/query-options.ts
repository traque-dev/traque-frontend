import { queryOptions } from '@tanstack/react-query';
import type { Exception } from '@/types/exception';
import type { Issue } from '@/types/issue';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import type { ExceptionDailyStatisticsParams } from './index';
import {
  getExceptionById,
  getExceptionDailyStatistics,
  getExceptions,
} from './index';

export const getExceptionsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
  pageable: Pageable<Exception>,
) =>
  queryOptions({
    queryKey: ['exceptions', organizationId, projectId, issueId, pageable],
    queryFn: () => getExceptions(organizationId, projectId, issueId, pageable),
  });

export const getExceptionByIdQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  exceptionId: Exception['id'],
) =>
  queryOptions({
    queryKey: ['exception', organizationId, projectId, exceptionId],
    queryFn: () => getExceptionById(organizationId, projectId, exceptionId),
  });

export const getExceptionDailyStatisticsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  params: ExceptionDailyStatisticsParams,
) =>
  queryOptions({
    queryKey: ['exceptionsDailyStatistics', organizationId, projectId, params],
    queryFn: () =>
      getExceptionDailyStatistics(organizationId, projectId, params),
  });
