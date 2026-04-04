import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAcknowledgeIncident,
  useResolveIncident,
} from '@/api/incidents/hooks';
import { getIncidentsQueryOptions } from '@/api/incidents/query-options';
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
import { dayjs } from '@/lib/dayjs';
import type { Incident, IncidentStatus } from '@/types/incident';

export const Route = createFileRoute(
  '/_authenticated/dashboard/uptime/incidents/',
)({
  component: IncidentsPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: { type: 'organization' },
      });
    }

    await context.queryClient.ensureQueryData(
      getIncidentsQueryOptions(activeOrganization.id),
    );

    return { activeOrganization };
  },
  pendingComponent: () => <div>Loading...</div>,
});

const STATUS_CONFIG: Record<
  IncidentStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
    icon: React.ElementType;
  }
> = {
  ONGOING: {
    label: 'Ongoing',
    className: 'bg-red-500/10 text-red-600 border-red-200',
    dotClassName: 'text-red-500',
    icon: AlertTriangle,
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    dotClassName: 'text-yellow-500',
    icon: Eye,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    dotClassName: 'text-emerald-500',
    icon: CheckCircle2,
  },
  STARTED: {
    label: 'Started',
    className: 'bg-blue-500/10 text-blue-600 border-blue-200',
    dotClassName: 'text-blue-500',
    icon: AlertTriangle,
  },
};

function formatDuration(seconds?: number): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function IncidentCard({
  incident,
  organizationId,
}: {
  incident: Incident;
  organizationId: string;
}) {
  const { mutate: acknowledge } = useAcknowledgeIncident(organizationId);
  const { mutate: resolve } = useResolveIncident(organizationId);

  const config = STATUS_CONFIG[incident.status];
  const isOngoing = incident.status === 'ONGOING';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';
  const isResolved = incident.status === 'RESOLVED';

  const duration =
    incident.durationSeconds ??
    (incident.resolvedAt
      ? dayjs(incident.resolvedAt).diff(dayjs(incident.startedAt), 'second')
      : dayjs().diff(dayjs(incident.startedAt), 'second'));

  return (
    <Link
      to="/dashboard/uptime/incidents/$incidentId"
      params={{ incidentId: incident.id! }}
      className="block"
    >
      <Card
        className={`shadow-none hover:bg-muted/30 transition-colors cursor-pointer ${
          isOngoing ? 'border-red-200 dark:border-red-900/40' : ''
        }`}
      >
        <CardContent className="flex items-center justify-between py-4 px-5">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                isOngoing
                  ? 'bg-red-500/10 text-red-500'
                  : isAcknowledged
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              <config.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {incident.monitorName ??
                    `Incident #${incident.id?.slice(0, 8)}`}
                </span>
                <Badge className={`text-[10px] shrink-0 ${config.className}`}>
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {incident.cause && (
                  <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {incident.cause}
                  </span>
                )}
                {incident.monitorUrl && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden sm:inline">
                    {incident.monitorUrl}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-muted-foreground">
                {dayjs(incident.startedAt).format('ll LT')}
              </div>
              <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatDuration(duration)}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/uptime/incidents/$incidentId"
                    params={{ incidentId: incident.id! }}
                  >
                    <ExternalLink className="size-4 mr-2" /> View details
                  </Link>
                </DropdownMenuItem>
                {!isResolved && (
                  <>
                    <DropdownMenuSeparator />
                    {isOngoing && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          acknowledge(incident.id!, {
                            onSuccess: () =>
                              toast.success('Incident acknowledged'),
                            onError: () => toast.error('Failed to acknowledge'),
                          });
                        }}
                      >
                        <Eye className="size-4 mr-2" /> Acknowledge
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        resolve(incident.id!, {
                          onSuccess: () => toast.success('Incident resolved'),
                          onError: () => toast.error('Failed to resolve'),
                        });
                      }}
                    >
                      <CheckCircle2 className="size-4 mr-2" /> Resolve
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function IncidentsPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { data: incidentsPage } = useSuspenseQuery(
    getIncidentsQueryOptions(activeOrganization.id),
  );

  const incidents = incidentsPage?.items;

  console.log(incidents);

  const ongoing =
    incidents?.filter(
      (i) => i.status === 'ONGOING' || i.status === 'STARTED',
    ) ?? [];
  const acknowledged =
    incidents?.filter((i) => i.status === 'ACKNOWLEDGED') ?? [];
  const resolved = incidents?.filter((i) => i.status === 'RESOLVED') ?? [];

  const hasIncidents = incidents && incidents.length > 0;

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage downtime incidents across your monitors
          </p>
        </div>
        {hasIncidents && (
          <div className="flex items-center gap-2">
            {ongoing.length > 0 && (
              <Badge variant="destructive" className="tabular-nums">
                {ongoing.length} ongoing
              </Badge>
            )}
            {acknowledged.length > 0 && (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 tabular-nums">
                {acknowledged.length} acknowledged
              </Badge>
            )}
          </div>
        )}
      </div>

      {!hasIncidents ? (
        <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">All clear</h2>
            <p className="text-muted-foreground max-w-md">
              No incidents have been recorded. Your monitors are running
              smoothly. Incidents will appear here when a monitor detects
              downtime.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {ongoing.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Circle className="size-2.5 fill-current text-red-500" />
                <h2 className="text-sm font-semibold text-red-600">
                  Ongoing ({ongoing.length})
                </h2>
              </div>
              <div className="space-y-2">
                {ongoing.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    organizationId={activeOrganization.id!}
                  />
                ))}
              </div>
            </section>
          )}

          {acknowledged.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Circle className="size-2.5 fill-current text-yellow-500" />
                <h2 className="text-sm font-semibold text-yellow-600">
                  Acknowledged ({acknowledged.length})
                </h2>
              </div>
              <div className="space-y-2">
                {acknowledged.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    organizationId={activeOrganization.id!}
                  />
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Circle className="size-2.5 fill-current text-emerald-500" />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Resolved ({resolved.length})
                </h2>
              </div>
              <div className="space-y-2">
                {resolved.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    organizationId={activeOrganization.id!}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
