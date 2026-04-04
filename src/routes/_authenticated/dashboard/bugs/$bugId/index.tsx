import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import { type } from 'arktype';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Copy,
  Loader2,
  MessageSquare,
  Minus,
  Send,
  Tag,
  Terminal,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  useBugActivities,
  useBugComments,
  useBugReproductionSteps,
  useChangeBugPriority,
  useChangeBugStatus,
  useCreateBugComment,
  useDeleteBugComment,
} from '@/api/bugs/hooks';
import { getBugByIdQueryOptions } from '@/api/bugs/query-options';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import type { BugActivityType, BugPriority, BugStatus } from '@/types/bug';

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const searchSchema = type({ 'projectId?': 'string' });

export const Route = createFileRoute('/_authenticated/dashboard/bugs/$bugId/')({
  component: BugDetailPage,
  validateSearch: searchSchema,
  loader: async ({ context, params, preload }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) throw notFound();

    const projects = await context.queryClient.ensureQueryData(
      getProjectsQueryOptions(activeOrganization.id),
    );

    const projectId =
      (preload as unknown as { projectId?: string })?.projectId ??
      projects?.[0]?.id ??
      '';

    context.queryClient.ensureQueryData(
      getBugByIdQueryOptions(activeOrganization.id, projectId, params.bugId),
    );

    return { activeOrganization, projectId };
  },
});

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  BugStatus,
  { label: string; icon: React.ElementType; badge: string; iconColor: string }
> = {
  OPEN: {
    label: 'Open',
    icon: Circle,
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
    iconColor: 'text-blue-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    badge:
      'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900',
    iconColor: 'text-orange-500',
  },
  RESOLVED: {
    label: 'Resolved',
    icon: CheckCircle2,
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
    iconColor: 'text-emerald-500',
  },
  CLOSED: {
    label: 'Closed',
    icon: XCircle,
    badge: 'bg-muted text-muted-foreground border-border',
    iconColor: 'text-muted-foreground',
  },
  WONT_FIX: {
    label: "Won't Fix",
    icon: Minus,
    badge:
      'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900',
    iconColor: 'text-purple-500',
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

const ACTIVITY_CONFIG: Record<
  BugActivityType,
  { label: string; icon: React.ElementType; color: string }
> = {
  STATUS_CHANGED: {
    label: 'Status changed',
    icon: Circle,
    color: 'text-blue-500 bg-blue-500/10',
  },
  PRIORITY_CHANGED: {
    label: 'Priority changed',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
  },
  ASSIGNEE_CHANGED: {
    label: 'Assignee changed',
    icon: User,
    color: 'text-indigo-500 bg-indigo-500/10',
  },
  LABEL_ADDED: {
    label: 'Label added',
    icon: Tag,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  LABEL_REMOVED: {
    label: 'Label removed',
    icon: Tag,
    color: 'text-muted-foreground bg-muted',
  },
  COMMENT_ADDED: {
    label: 'Comment added',
    icon: MessageSquare,
    color: 'text-purple-500 bg-purple-500/10',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground shrink-0 pt-0.5">
        {label}
      </span>
      <div className="text-sm text-right">{children}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function BugDetailPage() {
  const router = useRouter();
  const { bugId } = Route.useParams();
  const { projectId } = Route.useSearch();
  const { activeOrganization, projectId: loaderProjectId } =
    Route.useLoaderData();

  const resolvedProjectId = projectId ?? loaderProjectId;
  const orgId = activeOrganization.id;

  const [commentText, setCommentText] = useState('');

  const { data: bug } = useSuspenseQuery(
    getBugByIdQueryOptions(orgId, resolvedProjectId, bugId),
  );

  const { data: comments, isLoading: loadingComments } = useBugComments(
    orgId,
    resolvedProjectId,
    bugId,
  );

  const { data: steps, isLoading: loadingSteps } = useBugReproductionSteps(
    orgId,
    resolvedProjectId,
    bugId,
  );

  const { data: activities, isLoading: loadingActivities } = useBugActivities(
    orgId,
    resolvedProjectId,
    bugId,
  );

  const { mutate: changeStatus, isPending: changingStatus } =
    useChangeBugStatus(orgId, resolvedProjectId, bugId);

  const { mutate: changePriority, isPending: changingPriority } =
    useChangeBugPriority(orgId, resolvedProjectId, bugId);

  const { mutate: createComment, isPending: postingComment } =
    useCreateBugComment(orgId, resolvedProjectId, bugId);

  const { mutate: deleteComment } = useDeleteBugComment(
    orgId,
    resolvedProjectId,
    bugId,
  );

  const statusCfg = STATUS_CONFIG[bug.status];
  const priorityCfg = PRIORITY_CONFIG[bug.priority];
  const StatusIcon = statusCfg.icon;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(bug.id);
      toast.success('Bug ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    createComment(
      { body: commentText.trim() },
      {
        onSuccess: () => {
          toast.success('Comment added');
          setCommentText('');
        },
        onError: () => toast.error('Failed to add comment'),
      },
    );
  };

  return (
    <div className="pt-6 space-y-6 pb-12">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 shrink-0"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-base font-semibold tracking-tight truncate max-w-[480px]">
            {bug.title}
          </h1>
          <Badge className={cn('shrink-0 text-xs', statusCfg.badge)}>
            <StatusIcon className="size-3 mr-1" />
            {statusCfg.label}
          </Badge>
          <Badge className={cn('shrink-0 text-xs', priorityCfg.badge)}>
            <span
              className={cn('size-1.5 rounded-full mr-1', priorityCfg.dot)}
            />
            {priorityCfg.label}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Change status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={changingStatus}
                className="gap-1.5"
              >
                {changingStatus ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <StatusIcon className={cn('size-3.5', statusCfg.iconColor)} />
                )}
                Status
                <ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {(Object.keys(STATUS_CONFIG) as BugStatus[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={() =>
                        changeStatus(
                          { status: s },
                          {
                            onSuccess: () =>
                              toast.success(`Status changed to ${cfg.label}`),
                            onError: () =>
                              toast.error('Failed to change status'),
                          },
                        )
                      }
                      className={cn(bug.status === s && 'bg-accent')}
                    >
                      <Icon className={cn('size-3.5 mr-2', cfg.iconColor)} />
                      {cfg.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Change priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={changingPriority}
                className="gap-1.5"
              >
                {changingPriority ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span
                    className={cn('size-2 rounded-full', priorityCfg.dot)}
                  />
                )}
                Priority
                <ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">
                Change Priority
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {(Object.keys(PRIORITY_CONFIG) as BugPriority[]).map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  return (
                    <DropdownMenuItem
                      key={p}
                      onClick={() =>
                        changePriority(
                          { priority: p },
                          {
                            onSuccess: () =>
                              toast.success(`Priority changed to ${cfg.label}`),
                            onError: () =>
                              toast.error('Failed to change priority'),
                          },
                        )
                      }
                      className={cn(bug.priority === p && 'bg-accent')}
                    >
                      <span
                        className={cn('size-2 rounded-full mr-2', cfg.dot)}
                      />
                      {cfg.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleCopyId}>
            <Copy className="size-3.5" />
            Copy ID
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Status',
            value: statusCfg.label,
            icon: StatusIcon,
            color: statusCfg.iconColor,
          },
          {
            label: 'Priority',
            value: priorityCfg.label,
            icon: () => (
              <span className={cn('size-3 rounded-full', priorityCfg.dot)} />
            ),
            color: '',
          },
          {
            label: 'Reported by',
            value: bug.reporterName ?? 'Unknown',
            icon: User,
            color: 'text-muted-foreground',
          },
          {
            label: 'Created',
            value: dayjs(bug.createdAt).format('ll'),
            icon: Clock,
            color: 'text-muted-foreground',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-none">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Icon className={cn('size-3.5', color)} />
                <span className="text-xs">{label}</span>
              </div>
              <div className="text-sm font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: main content */}
        <div className="md:col-span-2 space-y-5">
          {/* Description */}
          {bug.description && (
            <Section title="Description">
              <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {bug.description}
              </div>
            </Section>
          )}

          {/* Expected / Actual behavior */}
          {(bug.expectedBehavior || bug.actualBehavior) && (
            <Section title="Behavior">
              <div className="grid gap-3 sm:grid-cols-2">
                {bug.expectedBehavior && (
                  <div className="rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                      Expected
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {bug.expectedBehavior}
                    </p>
                  </div>
                )}
                {bug.actualBehavior && (
                  <div className="rounded-xl border bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1.5">
                      Actual
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {bug.actualBehavior}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Reproduction steps */}
          <Section title="Reproduction Steps">
            {loadingSteps ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="rounded-xl border divide-y overflow-hidden">
                {[...steps]
                  .sort((a, b) => a.order - b.order)
                  .map((step, i) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 px-4 py-3 bg-card"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed py-6">
                <p className="text-sm text-muted-foreground">
                  No reproduction steps provided
                </p>
              </div>
            )}
          </Section>

          {/* Comments */}
          <Section title="Comments">
            <div className="rounded-xl border overflow-hidden">
              {/* Comment list */}
              <div className="divide-y">
                {loadingComments ? (
                  <div className="space-y-3 p-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="size-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments?.items && comments.items.length > 0 ? (
                  comments.items.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 px-4 py-3.5 group"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {comment.authorName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {comment.authorName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {dayjs(comment.createdAt).format('ll LT')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                deleteComment(comment.id, {
                                  onSuccess: () =>
                                    toast.success('Comment deleted'),
                                  onError: () =>
                                    toast.error('Failed to delete comment'),
                                })
                              }
                            >
                              <XCircle className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to comment.
                    </p>
                  </div>
                )}
              </div>

              {/* Add comment */}
              <div className="border-t bg-muted/10 px-4 py-3 space-y-2">
                <Textarea
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[72px] resize-none bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                      ⌘ Enter
                    </kbd>{' '}
                    to submit
                  </p>
                  <Button
                    size="sm"
                    onClick={handlePostComment}
                    disabled={!commentText.trim() || postingComment}
                    className="gap-1.5"
                  >
                    {postingComment ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    {postingComment ? 'Posting…' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-5">
          {/* Details card */}
          <Card className="shadow-none">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <DetailRow label="Bug ID">
                <span className="font-mono text-xs text-muted-foreground">
                  {bug.id.slice(0, 8)}…
                </span>
              </DetailRow>
              <DetailRow label="Source">
                <Badge variant="secondary" className="text-[10px]">
                  {bug.source}
                </Badge>
              </DetailRow>
              {bug.environment && (
                <DetailRow label="Environment">
                  <span className="text-xs">{bug.environment}</span>
                </DetailRow>
              )}
              {bug.assigneeName && (
                <DetailRow label="Assignee">
                  <span className="text-xs flex items-center gap-1 justify-end">
                    <User className="size-3" />
                    {bug.assigneeName}
                  </span>
                </DetailRow>
              )}
              {bug.labels && bug.labels.length > 0 && (
                <DetailRow label="Labels">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {bug.labels.map((l) => (
                      <span
                        key={l.id}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${l.color}22`,
                          color: l.color,
                          border: `1px solid ${l.color}44`,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </DetailRow>
              )}
              <DetailRow label="Created">
                <span className="text-xs">
                  {dayjs(bug.createdAt).format('ll LT')}
                </span>
              </DetailRow>
              <DetailRow label="Updated">
                <span className="text-xs">
                  {dayjs(bug.updatedAt).format('ll LT')}
                </span>
              </DetailRow>
              {/* {bug.exceptionId && (
                <DetailRow label="Exception">
                  <Link
                    to={`/dashboard/exceptions/${bug.exceptionId}`}
                    params={{ exceptionId: bug.exceptionId }}
                    search={{ projectId: projectId }}
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    {bug.exceptionId.slice(0, 8)}…
                  </Link>
                </DetailRow>
              )} */}
            </CardContent>
          </Card>

          {/* Browser context */}
          {bug.browserContext && Object.keys(bug.browserContext).length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-muted-foreground" />
                  Browser Context
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <pre className="text-[11px] font-mono text-muted-foreground overflow-auto rounded-lg bg-muted/40 p-3 max-h-40">
                  {JSON.stringify(bug.browserContext, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <Card className="shadow-none">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loadingActivities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Skeleton className="size-6 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities?.items && activities.items.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
                  <div className="space-y-3">
                    {activities.items.map((activity) => {
                      const cfg = ACTIVITY_CONFIG[activity.type] ?? {
                        label: activity.type,
                        icon: Circle,
                        color: 'text-muted-foreground bg-muted',
                      };
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={activity.id}
                          className="relative flex gap-3 pl-0"
                        >
                          <div
                            className={cn(
                              'flex size-6 shrink-0 items-center justify-center rounded-full z-10',
                              cfg.color,
                            )}
                          >
                            <Icon className="size-3" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-medium leading-tight">
                              {cfg.label}
                              {activity.oldValue && activity.newValue && (
                                <span className="text-muted-foreground font-normal">
                                  {' '}
                                  from{' '}
                                  <span className="font-medium text-foreground">
                                    {activity.oldValue}
                                  </span>{' '}
                                  to{' '}
                                  <span className="font-medium text-foreground">
                                    {activity.newValue}
                                  </span>
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {activity.actorName && (
                                <span className="text-[10px] text-muted-foreground">
                                  by {activity.actorName}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground/60">
                                {dayjs(activity.createdAt).format('ll LT')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No activity yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
