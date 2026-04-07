import type { Base } from '@/types/base';
import type { FileDTO } from '@/types/file';

export type FeedbackType =
  | 'IDEA'
  | 'FEATURE_REQUEST'
  | 'IMPROVEMENT'
  | 'GENERAL';

export type FeedbackStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DECLINED';

export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type FeedbackImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export type FeedbackSource = 'DASHBOARD' | 'PUBLIC';

export type Feedback = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string | null;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  impact: FeedbackImpact | null;
  source: FeedbackSource;
  submitterName: string | null;
  submitterEmail: string | null;
  metadata: Record<string, unknown> | null;
  reporterId: string | null;
  reporterName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  files: FileDTO[] | null;
};

export type FeedbackStatistics = {
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
};

export type CreateFeedbackDTO = {
  title: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  description?: string;
  fileIds?: string[];
};

export type UpdateFeedbackDTO = {
  title?: string;
  description?: string;
  impact?: FeedbackImpact;
};

export type ChangeFeedbackStatusDTO = {
  status: FeedbackStatus;
};

export type ChangeFeedbackPriorityDTO = {
  priority: FeedbackPriority;
};

export type AssignFeedbackDTO = {
  /** Set to null to unassign */
  assigneeId?: string | null;
};

export type CreatePublicFeedbackDTO = {
  title: string;
  type: FeedbackType;
  description?: string;
  submitterName?: string;
  submitterEmail?: string;
  fileIds?: string[];
};

export type FeedbackComment = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  authorId: string;
  authorName: string;
  parentId: string | null;
};

export type CreateFeedbackCommentDTO = {
  body: string;
  parentId?: string;
};

export type UpdateFeedbackCommentDTO = {
  body: string;
};

export type FeedbackActivityType =
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'COMMENT_ADDED';

export type FeedbackActivity = Base & {
  id: string;
  createdAt: string;
  type: FeedbackActivityType;
  oldValue: string | null;
  newValue: string | null;
  actorId: string | null;
  actorName: string | null;
};
