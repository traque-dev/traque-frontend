import { useQuery } from '@tanstack/react-query';
import type { Exception } from '@/types/exception';
import type { Issue } from '@/types/issue';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import type { ExceptionDailyStatisticsParams } from './index';
import {
  getExceptionByIdQueryOptions,
  getExceptionDailyStatisticsQueryOptions,
  getExceptionsQueryOptions,
} from './query-options';

export const useExceptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  issueId: Issue['id'],
  pageable: Pageable<Exception>,
) => {
  return useQuery(
    getExceptionsQueryOptions(organizationId, projectId, issueId, pageable),
  );
};

export const useExceptionById = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  exceptionId: Exception['id'],
) => {
  return useQuery(
    getExceptionByIdQueryOptions(organizationId, projectId, exceptionId),
  );
};

export const useExceptionDailyStatistics = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  params: ExceptionDailyStatisticsParams,
) => {
  return useQuery(
    getExceptionDailyStatisticsQueryOptions(organizationId, projectId, params),
  );
};
