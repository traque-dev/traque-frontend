import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types/issue-status';

type Props = React.ComponentProps<typeof Badge> & {
  status: IssueStatus;
};

const statusClassName: Record<IssueStatus, string> = {
  OPEN: 'border-none bg-blue-500/15 text-blue-700 dark:text-blue-400',
  RESOLVED:
    'border-none bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  IGNORED: 'border-none bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
};

export function IssueStatusBadge({
  status,
  className,
  children,
  ...rest
}: Props) {
  return (
    <Badge
      {...rest}
      variant="outline"
      className={cn(statusClassName[status], className)}
      aria-label={`Status: ${status}`}
    >
      {children ?? status}
    </Badge>
  );
}

export default IssueStatusBadge;
