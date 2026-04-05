import type { Base } from '@/types/base';
import type { FileDTO } from '@/types/file';

export type BugStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'WONT_FIX';

export type BugPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type BugSource = 'SDK' | 'DASHBOARD' | 'BROWSER_EXTENSION';

export type BugLabel = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  color: string;
};

export type BugReproductionStep = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  description: string;
};

export type Bug = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string | null;
  status: BugStatus;
  priority: BugPriority;
  environment: string | null;
  expectedBehavior: string | null;
  actualBehavior: string | null;
  browserContext: Record<string, unknown> | null;
  serverContext: Record<string, unknown> | null;
  breadcrumbs: string[] | null;
  metadata: Record<string, unknown> | null;
  source: BugSource;
  reporterId: string | null;
  reporterName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  exceptionId: string | null;
  labels: BugLabel[] | null;
  steps: BugReproductionStep[] | null;
  files: FileDTO[] | null;
};

export type CreateBugReproductionStepDTO = {
  description: string;
  order: number;
};

export type CreateBugDTO = {
  title: string;
  priority: BugPriority;
  description?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  exceptionId?: string;
  steps?: CreateBugReproductionStepDTO[];
};

export type UpdateBugDTO = {
  title?: string;
  description?: string;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
};

export type ChangeBugStatusDTO = {
  status: BugStatus;
};

export type ChangeBugPriorityDTO = {
  priority: BugPriority;
};

export type AssignBugDTO = {
  /** Set to null to unassign */
  assigneeId?: string | null;
};

export type AddBugLabelDTO = {
  labelId: string;
};

export type ViewportDTO = {
  width: number;
  height: number;
};

export type BugBrowserContextDTO = {
  url?: string;
  userAgent?: string;
  viewport?: ViewportDTO;
};

export type BugServerContextDTO = {
  hostname?: string;
  runtime?: string;
  version?: string;
};

export type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';

export type BreadcrumbType = 'LOG' | 'NAVIGATION' | 'HTTP' | 'ERROR';

export type BreadcrumbDTO = {
  timestamp: string;
  type: BreadcrumbType;
  level?: BreadcrumbLevel;
  message?: string;
  data?: Record<string, unknown>;
};

export type CaptureBugDTO = {
  title: string;
  description?: string;
  priority?: BugPriority;
  environment?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  steps?: CreateBugReproductionStepDTO[];
  browserContext?: BugBrowserContextDTO;
  serverContext?: BugServerContextDTO;
  breadcrumbs?: BreadcrumbDTO[];
  metadata?: Record<string, unknown>;
  exceptionId?: string;
  source?: string;
  fileIds?: string[];
};

export type BugComment = Base & {
  id: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  authorId: string;
  authorName: string;
  parentId: string | null;
};

export type CreateBugCommentDTO = {
  body: string;
  parentId?: string;
};

export type UpdateBugCommentDTO = {
  body: string;
};

export type CreateBugLabelDTO = {
  name: string;
  /** Hex color code (e.g. #ff0000) */
  color: string;
};

export type UpdateBugLabelDTO = {
  name?: string;
  /** Hex color code (e.g. #ff0000) */
  color?: string;
};

export type UpdateBugReproductionStepDTO = {
  description?: string;
  order?: number;
};

export type StepOrder = {
  id: string;
  order: number;
};

export type ReorderBugReproductionStepsDTO = {
  steps: StepOrder[];
};

export type BugActivityType =
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'LABEL_ADDED'
  | 'LABEL_REMOVED'
  | 'COMMENT_ADDED';

export type BugActivity = Base & {
  id: string;
  createdAt: string;
  type: BugActivityType;
  oldValue: string | null;
  newValue: string | null;
  actorId: string | null;
  actorName: string | null;
};

export type PositiveResponse = {
  /** The result of the operation, always "OK" */
  result: 'OK';
};
