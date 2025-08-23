import { match } from 'arktype';
import { useExceptionById } from '@/api/exceptions/hooks';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { dayjs } from '@/lib/dayjs';

type ExceptionDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  projectId: string;
  exceptionId?: string;
};

const getStatusVariant = match({
  undefined: () => 'secondary',
  'number >= 500': () => 'destructive',
  'number >= 400': () => 'outline',
  'number < 400': () => 'secondary',
  default: () => 'secondary',
});

export function ExceptionDetailsDialog({
  open,
  onOpenChange,
  organizationId,
  projectId,
  exceptionId,
}: ExceptionDetailsDialogProps) {
  const { data: exception, isLoading } = useExceptionById(
    organizationId,
    projectId,
    exceptionId,
  );

  const statusCode = exception?.httpContext?.statusCode;
  const statusVariant = getStatusVariant(statusCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span className="truncate" title={exception?.name}>
              {exception?.name ?? 'Exception details'}
            </span>
            {exception?.httpContext?.method ? (
              <Badge variant="secondary" className="shrink-0">
                {exception.httpContext.method}
              </Badge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground px-1">Loading...</div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="font-medium">
                {exception?.createdAt
                  ? dayjs(exception.createdAt).format('ll LT')
                  : '-'}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium">
                {statusCode ? (
                  <Badge variant={statusVariant as any}>{statusCode}</Badge>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Client IP</div>
              <div className="font-medium">
                {exception?.httpContext?.clientIp ?? '-'}
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-3 border-b">
              <div className="text-sm font-semibold">HTTP</div>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">URL</div>
                <div
                  className="font-mono text-xs truncate max-w-[620px]"
                  title={exception?.httpContext?.url}
                >
                  {exception?.httpContext?.url ?? '-'}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">Method</div>
                <div>
                  {exception?.httpContext?.method ? (
                    <Badge variant="secondary">
                      {exception.httpContext.method}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">Status</div>
                <div>
                  {statusCode ? (
                    <Badge variant={statusVariant as any}>{statusCode}</Badge>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-3 border-b">
              <div className="text-sm font-semibold">Message</div>
            </div>
            <div className="p-3">
              <div className="text-sm text-muted-foreground">
                {exception?.message}
              </div>
            </div>
          </div>

          {exception?.details ? (
            <div className="rounded-md border">
              <div className="p-3 border-b">
                <div className="text-sm font-semibold">Details</div>
              </div>
              <div className="p-3">
                <pre className="text-xs whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-auto">
                  {exception.details}
                </pre>
              </div>
            </div>
          ) : null}

          {exception?.suggestion ? (
            <div className="rounded-md border">
              <div className="p-3 border-b">
                <div className="text-sm font-semibold">Suggested fix</div>
              </div>
              <div className="p-3">
                <div className="text-sm whitespace-pre-wrap">
                  {exception.suggestion}
                </div>
              </div>
            </div>
          ) : null}

          <Separator />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Environment</div>
              <div className="font-medium">{exception?.environment ?? '-'}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Platform</div>
              <div className="font-medium">{exception?.platform ?? '-'}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Exception ID</div>
              <div className="font-mono text-xs">{exception?.id ?? '-'}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
