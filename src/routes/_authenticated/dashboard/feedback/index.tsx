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
  Check,
  Circle,
  Clock,
  Copy,
  Info,
  Lightbulb,
  MessageSquarePlus,
  Rocket,
  Sparkles,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { getFeedbackQueryOptions } from '@/api/feedback/query-options';
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
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from '@/types/feedback';

const searchSchema = type({
  'projectId?': 'string',
  'status?': 'string',
  'priority?': 'string',
  'type?': 'string',
});

export const Route = createFileRoute('/_authenticated/dashboard/feedback/')({
  component: FeedbackListPage,
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
      getFeedbackQueryOptions(activeOrganization.id, deps.projectId, {
        page: 1,
        size: 100,
      }),
    );

    return { activeOrganization };
  },
  pendingComponent: () => null,
  notFoundComponent: OrganizationProjectGate,
});

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; icon: React.ElementType; badge: string; iconColor: string }
> = {
  NEW: {
    label: 'New',
    icon: Circle,
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
    iconColor: 'text-blue-500',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    icon: Clock,
    badge:
      'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
    iconColor: 'text-amber-500',
  },
  PLANNED: {
    label: 'Planned',
    icon: Rocket,
    badge:
      'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900',
    iconColor: 'text-indigo-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Zap,
    badge:
      'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
    iconColor: 'text-orange-500',
  },
  COMPLETED: {
    label: 'Completed',
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
    iconColor: 'text-emerald-500',
  },
  DECLINED: {
    label: 'Declined',
    icon: XCircle,
    badge: 'bg-muted text-muted-foreground border-border',
    iconColor: 'text-muted-foreground',
  },
};

const PRIORITY_CONFIG: Record<
  FeedbackPriority,
  { label: string; dot: string; badge: string }
> = {
  HIGH: {
    label: 'High',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900',
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

const TYPE_CONFIG: Record<
  FeedbackType,
  { label: string; icon: React.ElementType; badge: string }
> = {
  IDEA: {
    label: 'Idea',
    icon: Lightbulb,
    badge:
      'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
  },
  FEATURE_REQUEST: {
    label: 'Feature',
    icon: Sparkles,
    badge:
      'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-900',
  },
  IMPROVEMENT: {
    label: 'Improvement',
    icon: Rocket,
    badge: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-900',
  },
  GENERAL: {
    label: 'General',
    icon: Zap,
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
  },
};

const STATUS_TABS: Array<{ value: FeedbackStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DECLINED', label: 'Declined' },
];

function PortalLinkBanner({ projectId }: { projectId?: string }) {
  const [copied, setCopied] = useState(false);

  const portalUrl = projectId
    ? `${window.location.origin}/portal/${projectId}/feedback`
    : null;

  const handleCopy = async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex gap-3 rounded-xl border bg-muted/30 px-4 py-3.5">
      <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <p className="text-sm font-semibold leading-tight">
            Public feedback portal
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Share this link so anyone can submit feedback for your project.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!portalUrl}
          className="group flex w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 transition-colors hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {portalUrl ?? 'No API key — generate one in project settings'}
          </span>
          <span className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

function FeedbackCard({
  feedback,
  projectId,
}: {
  feedback: Feedback;
  projectId: string;
}) {
  const statusCfg = STATUS_CONFIG[feedback.status];
  const priorityCfg = PRIORITY_CONFIG[feedback.priority];
  const typeCfg = TYPE_CONFIG[feedback.type];
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

  return (
    <Link
      to="/dashboard/feedback/$feedbackId"
      params={{ feedbackId: feedback.id }}
      search={{ projectId }}
      className="block"
    >
      <Card className="shadow-none transition-colors hover:bg-muted/30 cursor-pointer">
        <CardContent className="flex items-center gap-4 py-4 px-5">
          <div
            className={cn(
              'size-2.5 rounded-full flex-shrink-0 mt-0.5',
              priorityCfg.dot,
            )}
          />

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm leading-tight truncate max-w-[480px]">
                {feedback.title}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-[10px] px-1.5 py-0', statusCfg.badge)}>
                <StatusIcon className="size-3 mr-1" />
                {statusCfg.label}
              </Badge>
              <Badge className={cn('text-[10px] px-1.5 py-0', typeCfg.badge)}>
                <TypeIcon className="size-3 mr-1" />
                {typeCfg.label}
              </Badge>
              <Badge
                className={cn('text-[10px] px-1.5 py-0', priorityCfg.badge)}
              >
                {priorityCfg.label}
              </Badge>
              {feedback.source === 'PUBLIC' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Public
                </Badge>
              )}
              {(feedback.submitterName || feedback.reporterName) && (
                <span className="md:inline-flex hidden items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {feedback.submitterName ?? feedback.reporterName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {dayjs(feedback.createdAt).format('ll')}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeedbackListPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { projectId, status, priority, type: feedbackType } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOptions(activeOrganization.id),
  );

  const { data: feedbackPage } = useSuspenseQuery(
    getFeedbackQueryOptions(activeOrganization.id, projectId, {
      page: 1,
      size: 100,
    }),
  );

  const allFeedback = feedbackPage?.items ?? [];

  const activeStatus = (status as FeedbackStatus | 'ALL') ?? 'ALL';
  const activePriority =
    (priority as FeedbackPriority | undefined) ?? undefined;
  const activeType = (feedbackType as FeedbackType | undefined) ?? undefined;

  const filtered = allFeedback.filter((f) => {
    if (activeStatus !== 'ALL' && f.status !== activeStatus) return false;
    if (activePriority && f.priority !== activePriority) return false;
    if (activeType && f.type !== activeType) return false;
    return true;
  });

  const counts = allFeedback.reduce<Record<string, number>>(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }),
    {},
  );

  const newCount = counts['NEW'] ?? 0;

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Ideas, feature requests, and suggestions from your users
          </p>
        </div>
        {newCount > 0 && (
          <Badge className="tabular-nums bg-primary/10 text-primary border-primary/20">
            {newCount} new
          </Badge>
        )}
      </div>

      <PortalLinkBanner projectId={projectId} />

      <div className="flex flex-wrap items-center gap-2">
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

        <Select
          value={activeType ?? 'ALL'}
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                type: v === 'ALL' ? undefined : v,
              }),
            })
          }
        >
          <SelectTrigger size="sm" className="min-w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {(Object.keys(TYPE_CONFIG) as FeedbackType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const Icon = cfg.icon;
              return (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-2">
                    <Icon className="size-3.5" />
                    {cfg.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

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
            {(Object.keys(PRIORITY_CONFIG) as FeedbackPriority[]).map((p) => (
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

      <div className="flex items-center gap-1 flex-wrap border-b pb-0">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count =
            tab.value === 'ALL' ? allFeedback.length : (counts[tab.value] ?? 0);
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <MessageSquarePlus className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">
              {allFeedback.length === 0
                ? 'No feedback yet'
                : 'No feedback matches filters'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {allFeedback.length === 0
                ? 'Feedback submitted via the portal or dashboard will appear here.'
                : 'Try adjusting the status, type, or priority filter.'}
            </p>
          </div>
          {activeStatus !== 'ALL' || activePriority || activeType ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    status: undefined,
                    priority: undefined,
                    type: undefined,
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
          {filtered.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              projectId={projectId!}
            />
          ))}
          <p className="text-xs text-muted-foreground px-1 pt-1">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== allFeedback.length &&
              ` of ${allFeedback.length} total`}
          </p>
        </div>
      )}
    </div>
  );
}
