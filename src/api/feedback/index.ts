import qs from 'query-string';
import { axios } from '@/api/axios';
import type { PositiveResponse } from '@/types/bug';
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
  FeedbackStatistics,
  UpdateFeedbackCommentDTO,
  UpdateFeedbackDTO,
} from '@/types/feedback';
import type { Organization } from '@/types/organization';
import type { Page } from '@/types/page';
import type { Pageable } from '@/types/pageable';
import type { Project } from '@/types/project';

const base = (organizationId: Organization['id'], projectId: Project['id']) =>
  `/api/v1/organizations/${organizationId}/projects/${projectId}/feedback`;

export async function getFeedback(
  organizationId: Organization['id'],
  projectId: Project['id'],
  pageable: Pageable<Feedback>,
): Promise<Page<Feedback>> {
  const query = qs.stringify(pageable, {
    arrayFormat: 'comma',
    skipNull: true,
    skipEmptyString: true,
  });

  const url = `${base(organizationId!, projectId!)}?${query}`;

  const { data } = await axios.get<Page<Feedback>>(url);

  return data;
}

export async function createFeedback(
  organizationId: Organization['id'],
  projectId: Project['id'],
  dto: CreateFeedbackDTO,
): Promise<Feedback> {
  const { data } = await axios.post<Feedback>(
    base(organizationId, projectId),
    dto,
  );
  return data;
}

export async function getFeedbackStatistics(
  organizationId: Organization['id'],
  projectId: Project['id'],
): Promise<FeedbackStatistics> {
  const { data } = await axios.get<FeedbackStatistics>(
    `${base(organizationId, projectId)}/statistics`,
  );
  return data;
}

export async function getFeedbackById(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
): Promise<Feedback> {
  const { data } = await axios.get<Feedback>(
    `${base(organizationId, projectId)}/${feedbackId}`,
  );
  return data;
}

export async function updateFeedback(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  dto: UpdateFeedbackDTO,
): Promise<Feedback> {
  const { data } = await axios.patch<Feedback>(
    `${base(organizationId, projectId)}/${feedbackId}`,
    dto,
  );
  return data;
}

export async function deleteFeedback(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId, projectId)}/${feedbackId}`,
  );
  return data;
}

export async function changeFeedbackStatus(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  dto: ChangeFeedbackStatusDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId, projectId)}/${feedbackId}/status`,
    dto,
  );
  return data;
}

export async function changeFeedbackPriority(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  dto: ChangeFeedbackPriorityDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId, projectId)}/${feedbackId}/priority`,
    dto,
  );
  return data;
}

export async function assignFeedback(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  dto: AssignFeedbackDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.put<PositiveResponse>(
    `${base(organizationId, projectId)}/${feedbackId}/assignee`,
    dto,
  );
  return data;
}

export async function submitPublicFeedback(
  projectId: Project['id'],
  dto: CreatePublicFeedbackDTO,
): Promise<PositiveResponse> {
  const { data } = await axios.post<PositiveResponse>(
    `/api/v1/projects/${projectId!}/feedback`,
    dto,
  );
  return data;
}

export async function getFeedbackComments(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackComment>,
): Promise<Page<FeedbackComment>> {
  const query = qs.stringify(pageable, {
    arrayFormat: 'comma',
    skipNull: true,
    skipEmptyString: true,
  });

  const url = `${base(organizationId, projectId)}/${feedbackId}/comments?${query}`;

  const { data } = await axios.get<Page<FeedbackComment>>(url);

  return data;
}

export async function createFeedbackComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  dto: CreateFeedbackCommentDTO,
): Promise<FeedbackComment> {
  const { data } = await axios.post<FeedbackComment>(
    `${base(organizationId, projectId)}/${feedbackId}/comments`,
    dto,
  );
  return data;
}

export async function updateFeedbackComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  commentId: string,
  dto: UpdateFeedbackCommentDTO,
): Promise<FeedbackComment> {
  const { data } = await axios.patch<FeedbackComment>(
    `${base(organizationId, projectId)}/${feedbackId}/comments/${commentId}`,
    dto,
  );
  return data;
}

export async function deleteFeedbackComment(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  commentId: string,
): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(
    `${base(organizationId, projectId)}/${feedbackId}/comments/${commentId}`,
  );
  return data;
}

export async function getFeedbackActivities(
  organizationId: Organization['id'],
  projectId: Project['id'],
  feedbackId: Feedback['id'],
  pageable: Pageable<FeedbackActivity>,
): Promise<Page<FeedbackActivity>> {
  const query = qs.stringify(pageable, {
    arrayFormat: 'comma',
    skipNull: true,
    skipEmptyString: true,
  });

  const url = `${base(organizationId, projectId)}/${feedbackId}/activities?${query}`;

  const { data } = await axios.get<Page<FeedbackActivity>>(url);

  return data;
}
