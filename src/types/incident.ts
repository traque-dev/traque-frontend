import type { Base } from '@/types/base';

export type IncidentStatus =
  | 'ONGOING'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'STARTED';

export type Incident = Base & {
  monitorId: string;
  monitorName?: string;
  monitorUrl?: string;
  status: IncidentStatus;
  cause?: string;
  startedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  durationSeconds?: number;
};

export type TimelineEntryType =
  | 'STARTED'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'COMMENT'
  | 'POSTMORTEM';

export type TimelineEntry = Base & {
  type: TimelineEntryType;
  content?: string;
  authorName?: string;
  authorEmail?: string;
};
