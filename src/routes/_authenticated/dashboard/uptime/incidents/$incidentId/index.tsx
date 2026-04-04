import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from '@tanstack/react-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  acknowledgeIncident,
  addIncidentComment,
  resolveIncident,
} from '@/api/incidents';
import {
  getIncidentByIdQueryOptions,
  getIncidentTimelineQueryOptions,
} from '@/api/incidents/query-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { dayjs } from '@/lib/dayjs';
import type { IncidentStatus, TimelineEntryType } from '@/types/incident';

export const Route = createFileRoute(
  '/_authenticated/dashboard/uptime/incidents/$incidentId/',
)({
  component: IncidentDetailPage,
  loader: async ({ context, params }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(
      getIncidentByIdQueryOptions(activeOrganization.id, params.incidentId),
    );

    context.queryClient.ensureQueryData(
      getIncidentTimelineQueryOptions(activeOrganization.id, params.incidentId),
    );

    return {
      activeOrganization,
      incidentId: params.incidentId,
    };
  },
});

const STATUS_CONFIG: Record<
  IncidentStatus,
  { label: string; badgeClassName: string; icon: React.ElementType }
> = {
  ONGOING: {
    label: 'Ongoing',
    badgeClassName: 'bg-red-500/10 text-red-600',
    icon: AlertTriangle,
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    badgeClassName: 'bg-yellow-500/10 text-yellow-600',
    icon: Eye,
  },
  RESOLVED: {
    label: 'Resolved',
    badgeClassName: 'bg-emerald-500/10 text-emerald-600',
    icon: CheckCircle2,
  },
  STARTED: {
    label: 'Started',
    badgeClassName: 'bg-blue-500/10 text-blue-600',
    icon: AlertTriangle,
  },
};

const TIMELINE_ICON: Record<TimelineEntryType, React.ElementType> = {
  STARTED: AlertTriangle,
  ACKNOWLEDGED: Eye,
  RESOLVED: CheckCircle2,
  COMMENT: MessageSquare,
  POSTMORTEM: MessageSquare,
};

const TIMELINE_COLOR: Record<TimelineEntryType, string> = {
  STARTED: 'text-red-500 bg-red-500/10',
  ACKNOWLEDGED: 'text-yellow-500 bg-yellow-500/10',
  RESOLVED: 'text-emerald-500 bg-emerald-500/10',
  COMMENT: 'text-blue-500 bg-blue-500/10',
  POSTMORTEM: 'text-purple-500 bg-purple-500/10',
};

const TIMELINE_LABEL: Record<TimelineEntryType, string> = {
  STARTED: 'Incident started',
  ACKNOWLEDGED: 'Incident acknowledged',
  RESOLVED: 'Incident resolved',
  COMMENT: 'Comment',
  POSTMORTEM: 'Post-mortem',
};

function formatDuration(seconds?: number): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return `${days}d ${remainHours}h`;
}

function IncidentDetailPage() {
  const { activeOrganization, incidentId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [commentText, setCommentText] = useState('');

  const { data: incident } = useSuspenseQuery(
    getIncidentByIdQueryOptions(activeOrganization.id, incidentId),
  );

  const {
    data: timeline,
    refetch: refetchTimeline,
    isRefetching: isRefetchingTimeline,
  } = useQuery(
    getIncidentTimelineQueryOptions(activeOrganization.id, incidentId),
  );

  const statusConfig = STATUS_CONFIG[incident.status];
  const StatusIcon = statusConfig.icon;
  const isOngoing = incident.status === 'ONGOING';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';
  const isResolved = incident.status === 'RESOLVED';

  const duration =
    incident.durationSeconds ??
    (incident.resolvedAt
      ? dayjs(incident.resolvedAt).diff(dayjs(incident.startedAt), 'second')
      : dayjs().diff(dayjs(incident.startedAt), 'second'));

  const { mutate: acknowledge, isPending: isAcknowledging } = useMutation({
    mutationFn: () => acknowledgeIncident(activeOrganization.id, incidentId),
    onSuccess: () => {
      toast.success('Incident acknowledged');
      queryClient.invalidateQueries({
        queryKey: ['incidents', activeOrganization.id],
      });
    },
    onError: () => toast.error('Failed to acknowledge incident'),
  });

  const { mutate: resolve, isPending: isResolving } = useMutation({
    mutationFn: () => resolveIncident(activeOrganization.id, incidentId),
    onSuccess: () => {
      toast.success('Incident resolved');
      queryClient.invalidateQueries({
        queryKey: ['incidents', activeOrganization.id],
      });
    },
    onError: () => toast.error('Failed to resolve incident'),
  });

  const { mutate: postComment, isPending: isPostingComment } = useMutation({
    mutationFn: () =>
      addIncidentComment(activeOrganization.id, incidentId, {
        content: commentText,
      }),
    onSuccess: () => {
      toast.success('Comment added');
      setCommentText('');
      queryClient.invalidateQueries({
        queryKey: ['incidents', activeOrganization.id, incidentId, 'timeline'],
      });
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(incidentId);
      toast.success('Incident ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {incident.monitorName ?? `Incident #${incident.id?.slice(0, 8)}`}
          </h1>
          <Badge className={`shrink-0 ${statusConfig.badgeClassName}`}>
            <StatusIcon className="size-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isOngoing && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => acknowledge()}
              disabled={isAcknowledging}
            >
              <Eye className="size-4 mr-1" /> Acknowledge
            </Button>
          )}
          {!isResolved && (
            <Button
              size="sm"
              variant="default"
              onClick={() => resolve()}
              disabled={isResolving}
            >
              <CheckCircle2 className="size-4 mr-1" /> Resolve
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleCopyId}>
            <Copy className="size-4 mr-1" /> Copy ID
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="size-4" />
              <span className="text-xs">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-semibold ${
                  isOngoing
                    ? 'text-red-600'
                    : isAcknowledged
                      ? 'text-yellow-600'
                      : 'text-emerald-600'
                }`}
              >
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="size-4" />
              <span className="text-xs">Duration</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {formatDuration(duration)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="size-4" />
              <span className="text-xs">Started</span>
            </div>
            <div className="text-sm font-medium">
              {dayjs(incident.startedAt).format('ll LT')}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="size-4" />
              <span className="text-xs">Resolved</span>
            </div>
            <div className="text-sm font-medium">
              {incident.resolvedAt
                ? dayjs(incident.resolvedAt).format('ll LT')
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Timeline</div>
                <div className="text-xs text-muted-foreground">
                  Incident activity and updates
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchTimeline()}
                disabled={isRefetchingTimeline}
              >
                <RefreshCcw
                  className={`size-4 mr-1 ${isRefetchingTimeline ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {timeline && timeline.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
                <div className="space-y-4">
                  {timeline.map((entry) => {
                    const Icon = TIMELINE_ICON[entry.type] ?? MessageSquare;
                    const colorClass =
                      TIMELINE_COLOR[entry.type] ??
                      'text-muted-foreground bg-muted';
                    const label = TIMELINE_LABEL[entry.type] ?? entry.type;

                    return (
                      <div key={entry.id} className="relative flex gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full z-10 ${colorClass}`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 pt-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {entry.createdAt
                                ? dayjs(entry.createdAt).format('ll LT')
                                : ''}
                            </span>
                          </div>
                          {entry.authorName && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              by {entry.authorName}
                            </div>
                          )}
                          {entry.content && (
                            <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                              {entry.content}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No timeline entries yet
              </div>
            )}

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="text-sm font-medium">Add a comment</div>
              <Textarea
                placeholder="Write a comment or post-mortem note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => postComment()}
                  disabled={!commentText.trim() || isPostingComment}
                >
                  {isPostingComment ? (
                    <>
                      <Loader2 className="size-4 mr-1 animate-spin" />{' '}
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-1" /> Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-3">Incident Details</div>
            <div className="space-y-3 text-sm">
              <DetailRow label="Incident ID">
                <span className="font-mono text-xs truncate max-w-[140px] block">
                  {incident.id}
                </span>
              </DetailRow>
              <DetailRow label="Status">
                <Badge className={`text-xs ${statusConfig.badgeClassName}`}>
                  {statusConfig.label}
                </Badge>
              </DetailRow>
              {incident.cause && (
                <DetailRow label="Cause">
                  <span className="text-xs">{incident.cause}</span>
                </DetailRow>
              )}
              <DetailRow label="Started">
                {dayjs(incident.startedAt).format('ll LT')}
              </DetailRow>
              {incident.acknowledgedAt && (
                <DetailRow label="Acknowledged">
                  {dayjs(incident.acknowledgedAt).format('ll LT')}
                </DetailRow>
              )}
              {incident.resolvedAt && (
                <DetailRow label="Resolved">
                  {dayjs(incident.resolvedAt).format('ll LT')}
                </DetailRow>
              )}
              <DetailRow label="Duration">{formatDuration(duration)}</DetailRow>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-3">Related Monitor</div>
            <div className="space-y-3 text-sm">
              <DetailRow label="Monitor">
                {incident.monitorName ?? '—'}
              </DetailRow>
              {incident.monitorUrl && (
                <DetailRow label="URL">
                  <a
                    href={incident.monitorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-xs"
                  >
                    <span className="truncate max-w-[140px]">
                      {incident.monitorUrl}
                    </span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </DetailRow>
              )}
              {incident.monitorId && (
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link
                      to="/dashboard/uptime/monitors/$monitorId"
                      params={{ monitorId: incident.monitorId }}
                    >
                      View Monitor
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
