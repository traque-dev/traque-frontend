import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AssignFeedbackDTO,
  ChangeFeedbackPriorityDTO,
  ChangeFeedbackStatusDTO,
  CreateFeedbackCommentDTO,
  CreateFeedbackDTO,
  CreatePublicFeedbackDTO,
  Feedback,
  FeedbackActivity,
  FeedbackComment,
  UpdateFeedbackCommentDTO,
  UpdateFeedbackDTO,
} from '@/types/feedback';
import type { Organization } from '@/types/organization';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';
import {
  assignFeedback,
  changeFeedbackPriority,
  changeFeedbackStatus,
  createFeedback,
  createFeedbackComment,
  deleteFeedback,
  deleteFeedbackComment,
  submitPublicFeedback,
  updateFeedback,
  updateFeedbackComment,
} from './index';
import {
  getFeedbackActivitiesQueryOptions,
  getFeedbackByIdQueryOptions,
  getFeedbackCommentsQueryOptions,
  getFeedbackQueryOptions,
  getFeedbackStatisticsQueryOptions,
} from './query-options';

const feedbackListKey = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => ['feedback', organizationId, projectId] as const;

const feedbackDetailKey = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => ['feedback', organizationId, projectId, feedbackId] as const;

export const useFeedbackList = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Feedback>,
) => useQuery(getFeedbackQueryOptions(organizationId, projectId, pageable));

export const useFeedbackStatistics = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => useQuery(getFeedbackStatisticsQueryOptions(organizationId, projectId));

export const useFeedbackById = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) =>
  useQuery(getFeedbackByIdQueryOptions(organizationId, projectId, feedbackId));

export const useFeedbackComments = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackComment>,
) =>
  useQuery(
    getFeedbackCommentsQueryOptions(
      organizationId,
      projectId,
      feedbackId,
      pageable,
    ),
  );

export const useFeedbackActivities = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackActivity>,
) =>
  useQuery(
    getFeedbackActivitiesQueryOptions(
      organizationId,
      projectId,
      feedbackId,
      pageable,
    ),
  );

export const useCreateFeedback = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeedbackDTO) =>
      createFeedback(organizationId, projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: [...feedbackListKey(organizationId, projectId), 'statistics'],
      });
    },
  });
};

export const useUpdateFeedback = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateFeedbackDTO) =>
      updateFeedback(organizationId, projectId, feedbackId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: feedbackDetailKey(organizationId, projectId, feedbackId),
      });
    },
  });
};

export const useDeleteFeedback = (
  organizationId: Organization['id'],
  projectId: Project['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Feedback['id']) =>
      deleteFeedback(organizationId, projectId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.removeQueries({
        queryKey: feedbackDetailKey(organizationId, projectId, id),
      });
      queryClient.invalidateQueries({
        queryKey: [...feedbackListKey(organizationId, projectId), 'statistics'],
      });
    },
  });
};

export const useChangeFeedbackStatus = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeFeedbackStatusDTO) =>
      changeFeedbackStatus(organizationId, projectId, feedbackId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: feedbackDetailKey(organizationId, projectId, feedbackId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'activities',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [...feedbackListKey(organizationId, projectId), 'statistics'],
      });
    },
  });
};

export const useChangeFeedbackPriority = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChangeFeedbackPriorityDTO) =>
      changeFeedbackPriority(organizationId, projectId, feedbackId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: feedbackDetailKey(organizationId, projectId, feedbackId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'activities',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [...feedbackListKey(organizationId, projectId), 'statistics'],
      });
    },
  });
};

export const useAssignFeedback = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignFeedbackDTO) =>
      assignFeedback(organizationId, projectId, feedbackId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackListKey(organizationId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: feedbackDetailKey(organizationId, projectId, feedbackId),
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'activities',
        ],
      });
    },
  });
};

export const useSubmitPublicFeedback = () =>
  useMutation({
    mutationFn: ({
      projectId,
      dto,
    }: {
      projectId: Project['id'];
      dto: CreatePublicFeedbackDTO;
    }) => submitPublicFeedback(projectId, dto),
  });

export const useCreateFeedbackComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFeedbackCommentDTO) =>
      createFeedbackComment(organizationId, projectId, feedbackId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'comments',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'activities',
        ],
      });
    },
  });
};

export const useUpdateFeedbackComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  commentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateFeedbackCommentDTO) =>
      updateFeedbackComment(
        organizationId,
        projectId,
        feedbackId,
        commentId,
        dto,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'comments',
        ],
      });
    },
  });
};

export const useDeleteFeedbackComment = (
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteFeedbackComment(organizationId, projectId, feedbackId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'comments',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...feedbackDetailKey(organizationId, projectId, feedbackId),
          'activities',
        ],
      });
    },
  });
};
