import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { type } from 'arktype';
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  Circle,
  Clock,
  Minus,
  User,
  XCircle,
} from 'lucide-react';
import { getBugsQueryOptions } from '@/api/bugs/query-options';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
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
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import type { BugPriority, BugStatus, Bug as BugType } from '@/types/bug';

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const searchSchema = type({
  'projectId?': 'string',
  'status?': 'string',
  'priority?': 'string',
});

export const Route = createFileRoute('/_authenticated/dashboard/bugs/')({
  component: BugsPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ projectId: search.projectId }),
  loader: async ({ context, deps }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({ data: { type: 'organization' } });
    }

    const projects = await context.queryClient.ensureQueryData(
      getProjectsQueryOptions(activeOrganization.id),
    );

    if (!projects?.length) {
      throw notFound({ data: { type: 'projects' } });
    }

    if (!deps.projectId) {
      throw redirect({
        search: (prev) => ({ ...prev, projectId: projects[0].id }),
      });
    }

    await context.queryClient.ensureQueryData(
      getBugsQueryOptions(activeOrganization.id, deps.projectId),
    );

    return { activeOrganization };
  },
  pendingComponent: () => null,
  notFoundComponent: OrganizationProjectGate,
});

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  BugStatus,
  { label: string; icon: React.ElementType; badge: string; dot: string }
> = {
  OPEN: {
    label: 'Open',
    icon: Circle,
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
    dot: 'text-blue-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    badge:
      'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
    dot: 'text-orange-500',
  },
  RESOLVED: {
    label: 'Resolved',
    icon: CheckCircle2,
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
    dot: 'text-emerald-500',
  },
  CLOSED: {
    label: 'Closed',
    icon: XCircle,
    badge: 'bg-muted text-muted-foreground border-border',
    dot: 'text-muted-foreground',
  },
  WONT_FIX: {
    label: "Won't Fix",
    icon: Minus,
    badge:
      'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900',
    dot: 'text-purple-500',
  },
};

const PRIORITY_CONFIG: Record<
  BugPriority,
  { label: string; dot: string; badge: string }
> = {
  CRITICAL: {
    label: 'Critical',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900',
  },
  HIGH: {
    label: 'High',
    dot: 'bg-orange-500',
    badge:
      'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
  },
  MEDIUM: {
    label: 'Medium',
    dot: 'bg-yellow-500',
    badge:
      'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900',
  },
  LOW: {
    label: 'Low',
    dot: 'bg-green-500',
    badge:
      'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900',
  },
};

const STATUS_TABS: Array<{ value: BugStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'WONT_FIX', label: "Won't Fix" },
];

// ---------------------------------------------------------------------------
// Bug card
// ---------------------------------------------------------------------------

function BugCard({ bug, projectId }: { bug: BugType; projectId: string }) {
  const statusCfg = STATUS_CONFIG[bug.status];
  const priorityCfg = PRIORITY_CONFIG[bug.priority];
  const StatusIcon = statusCfg.icon;

  return (
    <Link
      to="/dashboard/bugs/$bugId"
      params={{ bugId: bug.id }}
      search={{ projectId }}
      className="block"
    >
      <Card className="shadow-none transition-colors hover:bg-muted/30 cursor-pointer">
        <CardContent className="flex items-center gap-4 py-4 px-5">
          {/* Priority dot */}
          <div
            className={cn(
              'size-2.5 rounded-full flex-shrink-0 mt-0.5',
              priorityCfg.dot,
            )}
          />

          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm leading-tight truncate max-w-[480px]">
                {bug.title}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={cn('text-[10px] px-1.5 py-0', statusCfg.badge)}>
                <StatusIcon className="size-3 mr-1" />
                {statusCfg.label}
              </Badge>
              <Badge
                className={cn('text-[10px] px-1.5 py-0', priorityCfg.badge)}
              >
                {priorityCfg.label}
              </Badge>
              {bug.environment && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {bug.environment}
                </span>
              )}
              {bug.reporterName && (
                <span className="md:inline-flex hidden items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {bug.reporterName}
                </span>
              )}
            </div>
          </div>

          {/* Right: date + arrow */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {dayjs(bug.createdAt).format('ll')}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function BugsPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { projectId, status, priority } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOptions(activeOrganization.id),
  );

  const { data: bugsPage } = useSuspenseQuery(
    getBugsQueryOptions(activeOrganization.id, projectId),
  );

  const allBugs = bugsPage?.items ?? [];

  const activeStatus = (status as BugStatus | 'ALL') ?? 'ALL';
  const activePriority = (priority as BugPriority | undefined) ?? undefined;

  const filtered = allBugs.filter((b) => {
    if (activeStatus !== 'ALL' && b.status !== activeStatus) return false;
    if (activePriority && b.priority !== activePriority) return false;
    return true;
  });

  const counts = allBugs.reduce<Record<string, number>>(
    (acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }),
    {},
  );

  const openCount = (counts['OPEN'] ?? 0) + (counts['IN_PROGRESS'] ?? 0);

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bugs</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage bug reports across your project
          </p>
        </div>
        {openCount > 0 && (
          <Badge variant="destructive" className="tabular-nums">
            {openCount} open
          </Badge>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Project select */}
        <Select
          value={projectId}
          onValueChange={(v) =>
            navigate({ search: (prev) => ({ ...prev, projectId: v }) })
          }
        >
          <SelectTrigger size="sm" className="min-w-44">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects
              ?.filter((p) => Boolean(p.id))
              .map((p) => (
                <SelectItem key={p.id!} value={p.id!}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select
          value={activePriority ?? 'ALL'}
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                priority: v === 'ALL' ? undefined : v,
              }),
            })
          }
        >
          <SelectTrigger size="sm" className="min-w-36">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {(Object.keys(PRIORITY_CONFIG) as BugPriority[]).map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      PRIORITY_CONFIG[p].dot,
                    )}
                  />
                  {PRIORITY_CONFIG[p].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 flex-wrap border-b pb-0">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count =
            tab.value === 'ALL' ? allBugs.length : (counts[tab.value] ?? 0);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    status: tab.value === 'ALL' ? undefined : tab.value,
                  }),
                })
              }
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bug list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Bug className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">
              {allBugs.length === 0
                ? 'No bugs reported'
                : 'No bugs match filters'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {allBugs.length === 0
                ? 'Bug reports submitted via the SDK or dashboard will appear here.'
                : 'Try adjusting the status or priority filter.'}
            </p>
          </div>
          {activeStatus !== 'ALL' || activePriority ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    status: undefined,
                    priority: undefined,
                  }),
                })
              }
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((bug) => (
            <BugCard key={bug.id} bug={bug} projectId={projectId!} />
          ))}
          <p className="text-xs text-muted-foreground px-1 pt-1">
            {filtered.length} bug{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== allBugs.length &&
              ` of ${allBugs.length} total`}
          </p>
        </div>
      )}
    </div>
  );
}
