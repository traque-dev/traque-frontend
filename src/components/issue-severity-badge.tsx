import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IssueSeverity } from '@/types/issue-severity';

type Props = React.ComponentProps<typeof Badge> & {
  severity: IssueSeverity;
};

const severityClassName: Record<IssueSeverity, string> = {
  LOW: 'border-none bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  MEDIUM: 'border-none bg-amber-500/15 text-amber-700 dark:text-amber-400',
  HIGH: 'border-none bg-orange-500/15 text-orange-700 dark:text-orange-400',
  CRITICAL: 'border-none bg-red-500/15 text-red-600 dark:text-red-400',
};

export function IssueSeverityBadge({
  severity,
  className,
  children,
  ...rest
}: Props) {
  return (
    <Badge
      {...rest}
      variant="outline"
      className={cn(severityClassName[severity], className)}
      aria-label={`Severity: ${severity}`}
    >
      {children ?? severity}
    </Badge>
  );
}

export default IssueSeverityBadge;
