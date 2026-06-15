import { useQueries, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Link2,
  MousePointerClick,
  Plus,
  Siren,
  TriangleAlert,
} from 'lucide-react';
import { getExceptionDailyStatisticsQueryOptions } from '@/api/exceptions/query-options';
import { getIncidentsQueryOptions } from '@/api/incidents/query-options';
import { getMonitorsQueryOptions } from '@/api/monitors/query-options';
import { getActiveOrganizationQueryOptions } from '@/api/organizations/options';
import { getProjects } from '@/api/projects';
import { getShortLinksQueryOptions } from '@/api/short-links/query-options';
import { BoxMinimalisticLinear } from '@/components/icons/box-minimalistic-linear';
import { ChartSquareLinear } from '@/components/icons/chart-square-linear';
import { UserRoundedLinear } from '@/components/icons/user-rounded-linear';
import { WidgetAddLinear } from '@/components/icons/widget-add-linear';
import { ProjectExceptionsChart } from '@/components/project-exceptions-chart';
import { ProjectExceptionsChartCard } from '@/components/project-exceptions-chart-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dayjs } from '@/lib/dayjs';
import type { Incident, IncidentStatus } from '@/types/incident';
import type { MonitorStatus } from '@/types/monitor';
import type { Pageable } from '@/types/pageable';
import type { ShortLink } from '@/types/short-link';

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.queryClient.ensureQueryData(
      getActiveOrganizationQueryOptions(),
    );

    if (!activeOrganization) {
      throw notFound();
    }

    const projects = await getProjects(activeOrganization.id);

    // Warm caches for the overview panels (non-blocking).
    context.queryClient.ensureQueryData(
      getMonitorsQueryOptions(activeOrganization.id),
    );
    context.queryClient.ensureQueryData(
      getIncidentsQueryOptions(activeOrganization.id),
    );

    return {
      title: 'Dashboard',
      activeOrganization,
      projects,
    };
  },
  pendingComponent: () => null,
  errorComponent: () => <div>I'll create error component, I promise</div>,
  notFoundComponent: DashboardNotFound,
});

const MONITOR_STATUS: Record<
  MonitorStatus,
  { label: string; dot: string; text: string }
> = {
  UP: { label: 'Operational', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  DOWN: { label: 'Down', dot: 'bg-red-500', text: 'text-red-600' },
  PAUSED: {
    label: 'Paused',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  PENDING: { label: 'Pending', dot: 'bg-yellow-500', text: 'text-yellow-600' },
  MAINTENANCE: {
    label: 'Maintenance',
    dot: 'bg-blue-500',
    text: 'text-blue-600',
  },
};

const INCIDENT_BADGE: Record<IncidentStatus, string> = {
  STARTED: 'bg-red-500/10 text-red-600',
  ONGOING: 'bg-red-500/10 text-red-600',
  ACKNOWLEDGED: 'bg-amber-500/10 text-amber-600',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600',
};

const TOP_LINKS_SORT = ['clickCount:DESC'] as Pageable<ShortLink>['sort'];

function DashboardPage() {
  const { projects, activeOrganization } = Route.useLoaderData();
  const organizationId = activeOrganization.id;

  const memberCount =
    (activeOrganization as { members?: unknown[] }).members?.length ?? 0;

  const exceptionsRange = {
    from: dayjs().subtract(20, 'days').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
  };

  const exceptions = useQueries({
    queries: projects.map((project) =>
      getExceptionDailyStatisticsQueryOptions(
        organizationId,
        project.id,
        exceptionsRange,
      ),
    ),
    combine: (results) => {
      const totals = new Map<string, number>();
      for (const result of results) {
        for (const point of result.data ?? []) {
          totals.set(point.date, (totals.get(point.date) ?? 0) + point.count);
        }
      }
      const points = Array.from(totals, ([date, count]) => ({
        date,
        count,
      })).sort((a, b) => a.date.localeCompare(b.date));
      return {
        points,
        total: points.reduce((sum, point) => sum + point.count, 0),
      };
    },
  });

  const { data: linksPage } = useQuery(
    getShortLinksQueryOptions(organizationId, {
      page: 1,
      size: 100,
      sort: TOP_LINKS_SORT,
    }),
  );
  const links = linksPage?.items ?? [];
  const topLinks = links.slice(0, 5);
  const totalLinkClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const linkCount = linksPage?.meta.totalItems ?? links.length;

  const { data: monitorsPage } = useQuery(
    getMonitorsQueryOptions(organizationId),
  );
  const monitors = monitorsPage?.items ?? [];
  const monitorsUp = monitors.filter((m) => m.status === 'UP').length;
  const monitorsDown = monitors.filter((m) => m.status === 'DOWN').length;

  const { data: incidentsPage } = useQuery(
    getIncidentsQueryOptions(organizationId),
  );
  const incidents = incidentsPage?.items ?? [];
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="pt-6 pb-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {activeOrganization.name} · {projects.length}{' '}
            {projects.length === 1 ? 'project' : 'projects'} · {memberCount}{' '}
            {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/short-links">
              <Link2 className="size-4" /> Short links
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard/projects/new">
              <Plus className="size-4" /> New project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TriangleAlert className="size-4" />}
          label="Exceptions (21d)"
          value={exceptions.total.toLocaleString()}
          hint={`Across ${projects.length} ${
            projects.length === 1 ? 'project' : 'projects'
          }`}
        />
        <StatCard
          icon={<MousePointerClick className="size-4" />}
          label="Short link clicks"
          value={totalLinkClicks.toLocaleString()}
          hint={`${linkCount.toLocaleString()} ${
            linkCount === 1 ? 'link' : 'links'
          }`}
          to="/dashboard/short-links"
        />
        <StatCard
          icon={<Activity className="size-4" />}
          label="Monitors up"
          value={monitors.length > 0 ? `${monitorsUp}/${monitors.length}` : '—'}
          hint={
            monitors.length === 0
              ? 'No monitors yet'
              : monitorsDown > 0
                ? `${monitorsDown} down`
                : 'All operational'
          }
          tone={monitorsDown > 0 ? 'danger' : 'default'}
          to="/dashboard/uptime/monitors"
        />
        <StatCard
          icon={<Siren className="size-4" />}
          label="Active incidents"
          value={activeIncidents.length.toLocaleString()}
          hint={activeIncidents.length === 0 ? 'All clear' : 'Needs attention'}
          tone={activeIncidents.length > 0 ? 'danger' : 'default'}
          to="/dashboard/uptime/incidents"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Exceptions over time"
            description="All projects combined · last 21 days"
          >
            {projects.length === 0 ? (
              <EmptyHint text="No projects to track yet." />
            ) : exceptions.points.length === 0 ? (
              <EmptyHint text="No exceptions recorded in this period." />
            ) : (
              <ProjectExceptionsChart data={exceptions.points} />
            )}
          </Panel>

          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-sm font-semibold">Exceptions by project</h2>
              <span className="text-xs text-muted-foreground">
                {projects.length}{' '}
                {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            {projects.length === 0 ? (
              <Panel>
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BoxMinimalisticLinear className="size-5" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Create your first project to start tracking exceptions and
                    events.
                  </p>
                  <Button asChild size="sm">
                    <Link to="/dashboard/projects/new">
                      <Plus className="size-4" /> New project
                    </Link>
                  </Button>
                </div>
              </Panel>
            ) : (
              <div className="divide-y rounded-xl border bg-card overflow-hidden">
                {projects.map((project) => (
                  <ProjectExceptionsChartCard
                    key={project.id}
                    organizationId={organizationId}
                    project={project}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Panel
            title="Service status"
            action={<PanelLink to="/dashboard/uptime/monitors" />}
          >
            {monitors.length === 0 ? (
              <EmptyHint text="No uptime monitors yet." />
            ) : (
              <ul className="space-y-3">
                {monitors.slice(0, 6).map((monitor) => {
                  const status = MONITOR_STATUS[monitor.status ?? 'PENDING'];
                  return (
                    <li
                      key={monitor.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`inline-flex size-2 shrink-0 rounded-full ${status.dot}`}
                        />
                        <span className="text-sm truncate">{monitor.name}</span>
                      </div>
                      <span className={`text-xs shrink-0 ${status.text}`}>
                        {status.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Active incidents"
            action={<PanelLink to="/dashboard/uptime/incidents" />}
          >
            {activeIncidents.length === 0 ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" />
                No active incidents
              </div>
            ) : (
              <ul className="space-y-3">
                {activeIncidents.slice(0, 5).map((incident) => (
                  <IncidentRow key={incident.id} incident={incident} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Top short links"
            action={<PanelLink to="/dashboard/short-links" />}
          >
            {topLinks.length === 0 ? (
              <EmptyHint text="No short links yet." />
            ) : (
              <ul className="space-y-3">
                {topLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      to="/dashboard/short-links/$shortLinkId"
                      params={{ shortLinkId: link.id }}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium font-mono truncate group-hover:text-primary">
                          {link.slug}
                        </div>
                        {link.title ? (
                          <div className="text-xs text-muted-foreground truncate">
                            {link.title}
                          </div>
                        ) : null}
                      </div>
                      <span className="text-sm tabular-nums shrink-0">
                        {link.clickCount.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'default',
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'danger';
  to?: string;
}) {
  const content = (
    <div className="rounded-xl border bg-card p-4 h-full transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
        {to ? <ArrowUpRight className="size-3 ms-auto opacity-50" /> : null}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? (
        <div
          className={`mt-0.5 text-xs ${
            tone === 'danger' ? 'text-red-600' : 'text-muted-foreground'
          }`}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      {title ? (
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            {description ? (
              <div className="text-xs text-muted-foreground">{description}</div>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function PanelLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
    >
      View all <ArrowUpRight className="size-3" />
    </Link>
  );
}

function IncidentRow({ incident }: { incident: Incident }) {
  return (
    <li>
      <Link
        to="/dashboard/uptime/incidents/$incidentId"
        params={{ incidentId: incident.id! }}
        className="flex items-start justify-between gap-2 group"
      >
        <div className="min-w-0">
          <div className="text-sm truncate group-hover:text-primary">
            {incident.monitorName ?? incident.cause ?? 'Incident'}
          </div>
          <div className="text-xs text-muted-foreground">
            Started {dayjs(incident.startedAt).format('ll LT')}
          </div>
        </div>
        <Badge
          className={`shrink-0 border-none text-xs ${INCIDENT_BADGE[incident.status]}`}
        >
          {incident.status.toLowerCase()}
        </Badge>
      </Link>
    </li>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>
  );
}

function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <WidgetAddLinear className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your organization
        </h1>
        <p className="text-muted-foreground max-w-xl">
          You don&apos;t have an active organization yet. Create one to start
          adding projects, tracking exceptions, and collaborating with your
          team.
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BoxMinimalisticLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Projects</div>
            <div className="text-muted-foreground">Organize work</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRoundedLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Team</div>
            <div className="text-muted-foreground">Invite members</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChartSquareLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Insights</div>
            <div className="text-muted-foreground">Dashboards & alerts</div>
          </div>
        </div>
      </div>
      <div>
        <Button asChild className="min-w-56">
          <Link to="/onboarding">Create organization</Link>
        </Button>
      </div>
    </div>
  );
}
