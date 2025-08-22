import type { EventEnvironment } from '@/types/event-environment';
import type { IssueSeverity } from '@/types/issue-severity';
import type { IssueStatus } from '@/types/issue-status';

export type IssueFilters = {
  status?: IssueStatus;
  severity?: IssueSeverity;
  environments?: EventEnvironment[];
  dateFrom?: string;
  dateTo?: string;
};
