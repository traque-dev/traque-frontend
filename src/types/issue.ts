import type { Base } from '@/types/base';
import type { IssueSeverity } from '@/types/issue-severity';
import type { IssueStatus } from '@/types/issue-status';

export type Issue = Base & {
  name: string;
  status: IssueStatus;
  severity: IssueSeverity;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
};
