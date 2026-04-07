import { queryOptions, skipToken } from '@tanstack/react-query';
import type {
  Feedback,
  FeedbackActivity,
  FeedbackComment,
} from '@/types/feedback';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import {
  getFeedback,
  getFeedbackActivities,
  getFeedbackById,
  getFeedbackComments,
  getFeedbackStatistics,
} from './index';

export const getFeedbackQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Feedback>,
) =>
  queryOptions({
    queryKey: ['feedback', organizationId, projectId, pageable],
    queryFn: () => getFeedback(organizationId, projectId, pageable),
  });

export const getFeedbackStatisticsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) =>
  queryOptions({
    queryKey: ['feedback', organizationId, projectId, 'statistics'],
    queryFn: () => getFeedbackStatistics(organizationId, projectId),
  });

export const getFeedbackByIdQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) =>
  queryOptions({
    queryKey: ['feedback', organizationId, projectId, feedbackId],
    queryFn: feedbackId
      ? () => getFeedbackById(organizationId, projectId, feedbackId)
      : skipToken,
  });

export const getFeedbackCommentsQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackComment>,
) =>
  queryOptions({
    queryKey: [
      'feedback',
      organizationId,
      projectId,
      feedbackId,
      'comments',
      pageable,
    ],
    queryFn: feedbackId
      ? () =>
          getFeedbackComments(organizationId, projectId, feedbackId, pageable)
      : skipToken,
  });

export const getFeedbackActivitiesQueryOptions = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackActivity>,
) =>
  queryOptions({
    queryKey: [
      'feedback',
      organizationId,
      projectId,
      feedbackId,
      'activities',
      pageable,
    ],
    queryFn: feedbackId
      ? () =>
          getFeedbackActivities(organizationId, projectId, feedbackId, pageable)
      : skipToken,
  });
