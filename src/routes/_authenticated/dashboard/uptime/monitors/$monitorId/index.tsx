import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  Check,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  Pause,
  Play,
  RefreshCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { deleteMonitor, pauseMonitor, resumeMonitor } from '@/api/monitors';
import {
  getMonitorAvailabilityQueryOptions,
  getMonitorByIdQueryOptions,
  getMonitorChecksQueryOptions,
  getMonitorResponseTimesQueryOptions,
  getMonitorSummaryQueryOptions,
} from '@/api/monitors/query-options';
import { DataTable } from '@/components/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { dayjs } from '@/lib/dayjs';
import type {
  MonitorCheck,
  MonitorRegion,
  MonitorStatus,
  MonitorType,
} from '@/types/monitor';

export const Route = createFileRoute(
  '/_authenticated/dashboard/uptime/monitors/$monitorId/',
)({
  component: MonitorDetailPage,
  loader: async ({ context, params }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(
      getMonitorByIdQueryOptions(activeOrganization.id, params.monitorId),
    );

    context.queryClient.ensureQueryData(
      getMonitorSummaryQueryOptions(activeOrganization.id, params.monitorId),
    );

    context.queryClient.ensureQueryData(
      getMonitorChecksQueryOptions(activeOrganization.id, params.monitorId),
    );

    return {
      activeOrganization,
      monitorId: params.monitorId,
    };
  },
});

const STATUS_CONFIG: Record<
  MonitorStatus,
  { label: string; className: string; bgClassName: string }
> = {
  UP: {
    label: 'Up',
    className: 'text-emerald-500',
    bgClassName: 'bg-emerald-500/10 text-emerald-600',
  },
  DOWN: {
    label: 'Down',
    className: 'text-red-500',
    bgClassName: 'bg-red-500/10 text-red-600',
  },
  PAUSED: {
    label: 'Paused',
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted text-muted-foreground',
  },
  PENDING: {
    label: 'Pending',
    className: 'text-yellow-500',
    bgClassName: 'bg-yellow-500/10 text-yellow-600',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    className: 'text-blue-500',
    bgClassName: 'bg-blue-500/10 text-blue-600',
  },
};

const TYPE_LABELS: Record<MonitorType, string> = {
  HTTP_UNAVAILABLE: 'HTTP',
  HTTP_KEYWORD_MISSING: 'Keyword Missing',
  HTTP_KEYWORD_PRESENT: 'Keyword Present',
  HTTP_STATUS_CODE: 'Status Code',
  PING: 'Ping',
  TCP: 'TCP',
  UDP: 'UDP',
  SMTP: 'SMTP',
  POP3: 'POP3',
  IMAP: 'IMAP',
  DNS: 'DNS',
  PLAYWRIGHT: 'Playwright',
};

const REGION_LABELS: Record<MonitorRegion, string> = {
  EUROPE: 'Europe',
  NORTH_AMERICA: 'North America',
  ASIA: 'Asia',
  AUSTRALIA: 'Australia',
};

function MonitorDetailPage() {
  const { activeOrganization, monitorId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();

  const [responsePeriod, setResponsePeriod] = useState<
    'day' | 'week' | 'month'
  >('day');

  const { data: monitor } = useSuspenseQuery(
    getMonitorByIdQueryOptions(activeOrganization.id, monitorId),
  );

  const { data: summary } = useQuery(
    getMonitorSummaryQueryOptions(activeOrganization.id, monitorId),
  );

  const {
    data: checksPage,
    refetch: refetchChecks,
    isRefetching: isRefetchingChecks,
  } = useQuery(getMonitorChecksQueryOptions(activeOrganization.id, monitorId));

  const checks = checksPage?.items;

  const { data: responseTimes } = useQuery(
    getMonitorResponseTimesQueryOptions(activeOrganization.id, monitorId, {
      period: responsePeriod,
    }),
  );

  const { data: availability } = useQuery(
    getMonitorAvailabilityQueryOptions(activeOrganization.id, monitorId),
  );

  const isPaused = monitor.paused || monitor.status === 'PAUSED';
  const statusConfig = STATUS_CONFIG[monitor.status ?? 'PENDING'];

  const { mutate: togglePause, isPending: isTogglingPause } = useMutation({
    mutationFn: () =>
      isPaused
        ? resumeMonitor(activeOrganization.id, monitorId)
        : pauseMonitor(activeOrganization.id, monitorId),
    onSuccess: () => {
      toast.success(isPaused ? 'Monitor resumed' : 'Monitor paused');
      queryClient.invalidateQueries({
        queryKey: ['monitors', activeOrganization.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['monitors', activeOrganization.id, monitorId],
      });
    },
    onError: () => toast.error('Failed to update monitor'),
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteMonitor(activeOrganization.id, monitorId),
    onSuccess: () => {
      toast.success('Monitor deleted');
      queryClient.invalidateQueries({
        queryKey: ['monitors', activeOrganization.id],
      });
      navigate({ to: '/dashboard/uptime/monitors' });
    },
    onError: () => toast.error('Failed to delete monitor'),
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(monitorId);
      toast.success('Monitor ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const checkColumns = useMemo<ColumnDef<MonitorCheck>[]>(
    () => [
      {
        accessorKey: 'checkedAt',
        header: 'Time',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const up = row.original.status === 'UP';
          return (
            <div className="flex items-center gap-1.5">
              <Circle
                className={`size-2.5 fill-current ${up ? 'text-emerald-500' : 'text-red-500'}`}
              />
              <span
                className={`text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {up ? 'Up' : 'Down'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'totalResponseMs',
        header: 'Response Time',
        cell: ({ getValue }) => {
          const ms = getValue() as number | null;
          return (
            <span className="tabular-nums text-sm">
              {ms != null ? `${ms}ms` : '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'httpStatusCode',
        header: 'Status Code',
        cell: ({ getValue }) => {
          const code = getValue() as number | null;
          return code != null ? (
            <Badge variant="secondary" className="font-mono text-xs">
              {code}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: ({ getValue }) => {
          const region = getValue() as MonitorRegion | null;
          return region ? (
            <span className="text-sm">{REGION_LABELS[region] ?? region}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'errorMessage',
        header: 'Error',
        cell: ({ getValue }) => {
          const error = getValue() as string | null;
          return error ? (
            <span className="text-xs text-red-500 truncate max-w-[200px] block">
              {error}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="pt-6 space-y-6 pb-4">
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
            {monitor.name}
          </h1>
          <Badge className={`shrink-0 ${statusConfig.bgClassName}`}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPaused ? 'default' : 'secondary'}
            onClick={() => togglePause()}
            disabled={isTogglingPause}
          >
            {isPaused ? (
              <>
                <Play className="size-4 mr-1" /> Resume
              </>
            ) : (
              <>
                <Pause className="size-4 mr-1" /> Pause
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCopyId}>
            <Copy className="size-4 mr-1" /> Copy ID
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete monitor</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{monitor.name}" and all its
                  check history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => remove()}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="size-4" />
              <span className="text-xs">Uptime</span>
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {availability?.uptimePercentage != null
                ? `${availability.uptimePercentage?.toFixed(2)}%`
                : summary?.uptimePercentage != null
                  ? `${summary.uptimePercentage?.toFixed(2)}%`
                  : '—'}
            </div>
          </CardContent>
        </Card> */}

        {/* <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="size-4" />
              <span className="text-xs">Avg Response</span>
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {summary?.avgResponseTimeMs != null
                ? `${Math.round(summary.avgResponseTimeMs)}ms`
                : '—'}
            </div>
          </CardContent>
        </Card> */}

        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="size-4" />
              <span className="text-xs">Last Check</span>
            </div>
            <div className="text-sm font-medium">
              {summary?.lastCheckedAt
                ? dayjs(summary.lastCheckedAt).format('ll LT')
                : '—'}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="size-4" />
              <span className="text-xs">Currently Up For</span>
            </div>
            <div className="text-sm font-medium">
              {summary?.currentlyUpForMs
                ? formatUptime(summary.currentlyUpForMs)
                : '—'}
            </div>
          </CardContent>
        </Card>

        {/* <Card className="shadow-none">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="size-4" />
              <span className="text-xs">Total Checks</span>
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {availability ? availability.totalChecks?.toLocaleString() : '—'}
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Card className="shadow-none border-none p-0 bg-transparent">
        <CardContent className="px-0 ">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold">Response Times</div>
                    <div className="text-xs text-muted-foreground">
                      Track performance over time
                    </div>
                  </div>
                  <Select
                    value={responsePeriod}
                    onValueChange={(v) =>
                      setResponsePeriod(v as 'day' | 'week' | 'month')
                    }
                  >
                    <SelectTrigger className="w-32" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Last 24h</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {responseTimes && responseTimes.length > 0 ? (
                  <div className="h-40 flex items-end gap-[2px]">
                    {(() => {
                      const maxMs = Math.max(
                        0,
                        ...responseTimes.map((r) => r.totalResponseMs ?? 0),
                      );
                      const displayEntries = responseTimes.slice(-60);
                      return displayEntries.map((entry, i) => {
                        const ms = entry.totalResponseMs ?? 0;
                        const heightPct = maxMs > 0 ? (ms / maxMs) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors min-w-[2px]"
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            title={`${entry.totalResponseMs != null ? `${entry.totalResponseMs}ms` : '—'} — ${dayjs(entry.checkedAt).format('ll LT')}`}
                          />
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                    No response time data available yet
                  </div>
                )}
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold">Check History</div>
                    <div className="text-xs text-muted-foreground">
                      Recent monitoring checks
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchChecks()}
                    disabled={isRefetchingChecks}
                  >
                    <RefreshCcw
                      className={`size-4 mr-1 ${isRefetchingChecks ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>

                <DataTable<MonitorCheck>
                  columns={checkColumns}
                  data={checks ?? []}
                  emptyText="No checks recorded yet"
                  className="[&>div]:border-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-3">
                  Monitor Details
                </div>
                <div className="space-y-3 text-sm">
                  <DetailRow label="URL">
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                    >
                      {monitor.url}
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </DetailRow>
                  <DetailRow label="Type">
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABELS[monitor.type] ?? monitor.type}
                    </Badge>
                  </DetailRow>
                  <DetailRow label="Method">
                    <Badge variant="outline" className="font-mono text-xs">
                      {monitor.httpMethod}
                    </Badge>
                  </DetailRow>
                  <DetailRow label="Interval">
                    {formatInterval(monitor.checkIntervalSeconds)}
                  </DetailRow>
                  <DetailRow label="Timeout">
                    {monitor.requestTimeoutSeconds}s
                  </DetailRow>
                  <DetailRow label="IP Version">{monitor.ipVersion}</DetailRow>
                  {monitor.regions && monitor.regions.length > 0 && (
                    <DetailRow label="Regions">
                      <div className="flex flex-wrap gap-1">
                        {monitor.regions.map((r) => (
                          <Badge
                            key={r}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {REGION_LABELS[r] ?? r}
                          </Badge>
                        ))}
                      </div>
                    </DetailRow>
                  )}
                  <DetailRow label="SSL Check">
                    {monitor.sslVerification ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <X className="size-4 text-muted-foreground" />
                    )}
                  </DetailRow>
                  <DetailRow label="Redirects">
                    {monitor.followRedirects ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <X className="size-4 text-muted-foreground" />
                    )}
                  </DetailRow>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-3">Notifications</div>
                <div className="space-y-2 text-sm">
                  <DetailRow label="Channels">
                    <div className="flex flex-wrap gap-1">
                      {monitor.notificationChannels?.map((ch) => (
                        <Badge
                          key={ch}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {ch}
                        </Badge>
                      )) ?? <span className="text-muted-foreground">—</span>}
                    </div>
                  </DetailRow>
                  <DetailRow label="Escalation">
                    {formatEscalation(monitor.escalationPolicy)}
                  </DetailRow>
                </div>
              </div>

              {availability && availability.length > 0 && (
                <div className="rounded-md border p-4">
                  <div className="text-sm font-semibold mb-3">Availability</div>
                  <div className="space-y-4 text-sm">
                    {availability.map((period) => (
                      <div
                        key={`${period.label}-${period.from}-${period.to}`}
                        className="space-y-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {period.label}
                        </div>
                        <DetailRow label="Uptime">
                          {period.availabilityPercent.toFixed(2)}%
                        </DetailRow>
                        <DetailRow label="Downtime">
                          {formatUptime(period.downtimeMs)}
                        </DetailRow>
                        <DetailRow label="Incidents">
                          {period.incidentCount.toLocaleString()}
                        </DetailRow>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m ${totalSeconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''}`;
  }
  const hours = Math.round(seconds / 3600);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

function formatEscalation(policy: string): string {
  const map: Record<string, string> = {
    DO_NOTHING: 'Do nothing',
    IMMEDIATELY: 'Immediately',
    WITHIN_3_MIN: 'Within 3 min',
    WITHIN_5_MIN: 'Within 5 min',
    WITHIN_10_MIN: 'Within 10 min',
  };
  return map[policy] ?? policy;
}
