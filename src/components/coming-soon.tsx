import { Link } from '@tanstack/react-router';
import { Clock, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';

type ActionLink = {
  label: string;
  to: string;
};

type ComingSoonProps = {
  title?: string;
  description?: string;
  eta?: string | Date;
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
  className?: string;
  children?: React.ReactNode;
};

function formatEta(eta?: string | Date) {
  if (!eta) return null;
  if (eta instanceof Date) return dayjs(eta).format('LL');
  const parsed = dayjs(eta);
  return parsed.isValid() ? parsed.format('LL') : eta;
}

export function ComingSoon({
  title = 'Coming soon',
  description = "We're putting the finishing touches on this feature. Thanks for your patience!",
  eta,
  primaryAction,
  secondaryAction = { label: 'Back to dashboard', to: '/dashboard' },
  className,
  children,
}: ComingSoonProps) {
  const etaLabel = formatEta(eta);

  return (
    <Card className={cn('mx-auto max-w-xl text-center shadow-none', className)}>
      <CardHeader>
        <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20">
          <Sparkles className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl leading-tight">{title}</CardTitle>
        <CardDescription className="mx-auto max-w-md text-balance">
          {description}
        </CardDescription>
        {etaLabel ? (
          <div className="mt-1">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1"
            >
              <Clock className="size-3.5" /> ETA {etaLabel}
            </Badge>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {children ? (
          <div className="mx-auto max-w-md text-left">{children}</div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-center gap-2">
        {primaryAction ? (
          <Button asChild>
            <Link to={primaryAction.to}>{primaryAction.label}</Link>
          </Button>
        ) : null}
        {secondaryAction ? (
          <Button asChild variant="outline">
            <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
