import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {
  Activity,
  Circle,
  ExternalLink,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteMonitor,
  usePauseMonitor,
  useResumeMonitor,
} from '@/api/monitors/hooks';
import { getMonitorsQueryOptions } from '@/api/monitors/query-options';
import { GlobalLinearIcon } from '@/components/icons/global-linear';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Monitor, MonitorStatus, MonitorType } from '@/types/monitor';

export const Route = createFileRoute(
  '/_authenticated/dashboard/uptime/monitors/',
)({
  component: MonitorsPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: { type: 'organization' },
      });
    }

    await context.queryClient.ensureQueryData(
      getMonitorsQueryOptions(activeOrganization.id),
    );

    return { activeOrganization };
  },
  pendingComponent: () => <div>Loading...</div>,
});

const STATUS_CONFIG: Record<
  MonitorStatus,
  { label: string; className: string }
> = {
  UP: { label: 'Up', className: 'text-emerald-500' },
  DOWN: { label: 'Down', className: 'text-red-500' },
  PAUSED: { label: 'Paused', className: 'text-muted-foreground' },
  PENDING: { label: 'Pending', className: 'text-yellow-500' },
  MAINTENANCE: { label: 'Maintenance', className: 'text-blue-500' },
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

function MonitorStatusIndicator({ status }: { status?: MonitorStatus }) {
  const config = STATUS_CONFIG[status ?? 'PENDING'];
  return (
    <div className="flex items-center gap-1.5">
      <Circle className={`size-2.5 fill-current ${config.className}`} />
      <span className={`text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    </div>
  );
}

function MonitorCard({
  monitor,
  organizationId,
}: {
  monitor: Monitor;
  organizationId: string;
}) {
  const { mutate: pause } = usePauseMonitor(organizationId);
  const { mutate: resume } = useResumeMonitor(organizationId);
  const { mutate: remove } = useDeleteMonitor(organizationId);

  const isPaused = monitor.paused || monitor.status === 'PAUSED';

  return (
    <Link
      to="/dashboard/uptime/monitors/$monitorId"
      params={{ monitorId: monitor.id! }}
      className="block"
    >
      <Card className="shadow-none hover:bg-muted/30 transition-colors cursor-pointer">
        <CardContent className="flex items-center justify-between py-4 px-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{monitor.name}</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal shrink-0"
                >
                  {TYPE_LABELS[monitor.type] ?? monitor.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {monitor.url}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <MonitorStatusIndicator status={monitor.status} />

            {monitor.checkIntervalSeconds && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                every {formatInterval(monitor.checkIntervalSeconds)}
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/uptime/monitors/$monitorId"
                    params={{ monitorId: monitor.id! }}
                  >
                    <ExternalLink className="size-4 mr-2" /> View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    if (isPaused) {
                      resume(monitor.id!, {
                        onSuccess: () => toast.success('Monitor resumed'),
                        onError: () => toast.error('Failed to resume'),
                      });
                    } else {
                      pause(monitor.id!, {
                        onSuccess: () => toast.success('Monitor paused'),
                        onError: () => toast.error('Failed to pause'),
                      });
                    }
                  }}
                >
                  {isPaused ? (
                    <>
                      <Play className="size-4 mr-2" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="size-4 mr-2" /> Pause
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    remove(monitor.id!, {
                      onSuccess: () => toast.success('Monitor deleted'),
                      onError: () => toast.error('Failed to delete'),
                    });
                  }}
                >
                  <Trash2 className="size-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function MonitorsPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { data: monitorsPage } = useSuspenseQuery(
    getMonitorsQueryOptions(activeOrganization.id),
  );

  const monitors = monitorsPage?.items;

  console.log(monitors);

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground text-sm">
            Track uptime and performance of your services
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/uptime/monitors/new">
            <Plus className="size-4" /> Create Monitor
          </Link>
        </Button>
      </div>

      {!monitors || monitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GlobalLinearIcon className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              No monitors yet
            </h2>
            <p className="text-muted-foreground max-w-md">
              Create your first monitor to start tracking uptime and performance
              of your websites and APIs.
            </p>
          </div>
          <Button asChild className="min-w-48">
            <Link to="/dashboard/uptime/monitors/new">
              <Plus className="size-4" /> Create Monitor
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {monitors?.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              organizationId={activeOrganization.id!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
