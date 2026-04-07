import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import { type } from 'arktype';
import {
  ArrowLeft,
  ChevronDown,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  FileIcon,
  Lightbulb,
  Loader2,
  MessageSquare,
  Rocket,
  Send,
  Sparkles,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getFeedbackById } from '@/api/feedback';
import {
  useChangeFeedbackPriority,
  useChangeFeedbackStatus,
  useCreateFeedbackComment,
  useDeleteFeedbackComment,
  useFeedbackActivities,
  useFeedbackComments,
} from '@/api/feedback/hooks';
import { getFeedbackByIdQueryOptions } from '@/api/feedback/query-options';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import type {
  FeedbackActivityType,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from '@/types/feedback';
import type { FileDTO } from '@/types/file';

const searchSchema = type({ 'projectId?': 'string' });

export const Route = createFileRoute(
  '/_authenticated/dashboard/feedback/$feedbackId/',
)({
  component: FeedbackDetailPage,
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
      getFeedbackByIdQueryOptions(
        activeOrganization.id,
        projectId,
        params.feedbackId,
      ),
    );

    return { activeOrganization, projectId };
  },
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
        className="size-3.5"
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
    label: 'Feature Request',
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

const ACTIVITY_CONFIG: Record<
  FeedbackActivityType,
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
  COMMENT_ADDED: {
    label: 'Comment added',
    icon: MessageSquare,
    color: 'text-purple-500 bg-purple-500/10',
  },
};

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

function getFileKind(mimeType: string): 'image' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentsSection({ files }: { files: FileDTO[] }) {
  const [lightbox, setLightbox] = useState<FileDTO | null>(null);

  const images = files.filter((f) => getFileKind(f.mimeType) === 'image');
  const videos = files.filter((f) => getFileKind(f.mimeType) === 'video');
  const others = files.filter((f) => getFileKind(f.mimeType) === 'other');

  return (
    <Section title="Attachments">
      <div className="space-y-3">
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setLightbox(file)}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="absolute inset-0 size-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((file) => (
              <div key={file.id} className="overflow-hidden rounded-xl border">
                <video
                  src={file.url}
                  controls
                  preload="metadata"
                  className="w-full max-h-64 bg-black"
                />
                <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
                  <span className="flex-1 truncate text-xs font-medium">
                    {file.originalName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="overflow-hidden rounded-xl border divide-y">
            {others.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <FileIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!lightbox}
        onOpenChange={(open) => !open && setLightbox(null)}
      >
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-2">
          {lightbox && (
            <img
              src={lightbox.url}
              alt={lightbox.originalName}
              className="max-h-[85vh] w-full rounded object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}

function FeedbackDetailPage() {
  const router = useRouter();
  const { feedbackId } = Route.useParams();
  const { projectId } = Route.useSearch();
  const { activeOrganization, projectId: loaderProjectId } =
    Route.useLoaderData();

  const resolvedProjectId = projectId ?? loaderProjectId;
  const orgId = activeOrganization.id;

  const [commentText, setCommentText] = useState('');

  const { data: feedback } = useSuspenseQuery({
    queryKey: ['feedback', orgId, resolvedProjectId, feedbackId],
    queryFn: () => getFeedbackById(orgId, resolvedProjectId, feedbackId),
  });

  const { data: comments, isLoading: loadingComments } = useFeedbackComments(
    orgId,
    resolvedProjectId,
    feedbackId,
    { page: 1, size: 100 },
  );

  const { data: activities, isLoading: loadingActivities } =
    useFeedbackActivities(orgId, resolvedProjectId, feedbackId, {
      page: 1,
      size: 100,
    });

  const { mutate: changeStatus, isPending: changingStatus } =
    useChangeFeedbackStatus(orgId, resolvedProjectId, feedbackId);

  const { mutate: changePriority, isPending: changingPriority } =
    useChangeFeedbackPriority(orgId, resolvedProjectId, feedbackId);

  const { mutate: createComment, isPending: postingComment } =
    useCreateFeedbackComment(orgId, resolvedProjectId, feedbackId);

  const { mutate: deleteComment } = useDeleteFeedbackComment(
    orgId,
    resolvedProjectId,
    feedbackId,
  );

  const statusCfg = STATUS_CONFIG[feedback.status];
  const priorityCfg = PRIORITY_CONFIG[feedback.priority];
  const typeCfg = TYPE_CONFIG[feedback.type];
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(feedback.id);
      toast.success('Feedback ID copied');
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
            {feedback.title}
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

        <div className="flex items-center gap-2 shrink-0">
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
                {(Object.keys(STATUS_CONFIG) as FeedbackStatus[]).map((s) => {
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
                      className={cn(feedback.status === s && 'bg-accent')}
                    >
                      <Icon className={cn('size-3.5 mr-2', cfg.iconColor)} />
                      {cfg.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

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
                {(Object.keys(PRIORITY_CONFIG) as FeedbackPriority[]).map(
                  (p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <DropdownMenuItem
                        key={p}
                        onClick={() =>
                          changePriority(
                            { priority: p },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `Priority changed to ${cfg.label}`,
                                ),
                              onError: () =>
                                toast.error('Failed to change priority'),
                            },
                          )
                        }
                        className={cn(feedback.priority === p && 'bg-accent')}
                      >
                        <span
                          className={cn('size-2 rounded-full mr-2', cfg.dot)}
                        />
                        {cfg.label}
                      </DropdownMenuItem>
                    );
                  },
                )}
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
            label: 'Type',
            value: typeCfg.label,
            icon: TypeIcon,
            color: '',
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
            label: 'Created',
            value: dayjs(feedback.createdAt).format('ll'),
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
          <Section title="Description">
            {feedback.description ? (
              <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {feedback.description}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed py-6">
                <p className="text-sm text-muted-foreground">
                  No description provided
                </p>
              </div>
            )}
          </Section>

          {/* Attachments */}
          {feedback.files && feedback.files.length > 0 && (
            <AttachmentsSection files={feedback.files} />
          )}

          {/* Comments */}
          <Section title="Comments">
            <div className="rounded-xl border overflow-hidden">
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

              <div className="border-t bg-muted/10 px-4 py-3 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
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
                    {postingComment ? 'Posting...' : 'Comment'}
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
              <DetailRow label="Feedback ID">
                <span className="font-mono text-xs text-muted-foreground">
                  {feedback.id.slice(0, 8)}...
                </span>
              </DetailRow>
              <DetailRow label="Type">
                <Badge className={cn('text-[10px]', typeCfg.badge)}>
                  <TypeIcon className="size-3 mr-1" />
                  {typeCfg.label}
                </Badge>
              </DetailRow>
              <DetailRow label="Source">
                <Badge variant="secondary" className="text-[10px]">
                  {feedback.source}
                </Badge>
              </DetailRow>
              {feedback.impact && (
                <DetailRow label="Impact">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {feedback.impact.toLowerCase()}
                  </Badge>
                </DetailRow>
              )}
              {feedback.assigneeName && (
                <DetailRow label="Assignee">
                  <span className="text-xs flex items-center gap-1 justify-end">
                    <User className="size-3" />
                    {feedback.assigneeName}
                  </span>
                </DetailRow>
              )}
              <DetailRow label="Created">
                <span className="text-xs">
                  {dayjs(feedback.createdAt).format('ll LT')}
                </span>
              </DetailRow>
              <DetailRow label="Updated">
                <span className="text-xs">
                  {dayjs(feedback.updatedAt).format('ll LT')}
                </span>
              </DetailRow>
            </CardContent>
          </Card>

          {/* Submitter card */}
          {(feedback.submitterName ||
            feedback.submitterEmail ||
            feedback.reporterName) && (
            <Card className="shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  Submitter
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {(feedback.submitterName || feedback.reporterName) && (
                  <DetailRow label="Name">
                    <span className="text-xs">
                      {feedback.submitterName ?? feedback.reporterName}
                    </span>
                  </DetailRow>
                )}
                {feedback.submitterEmail && (
                  <DetailRow label="Email">
                    <a
                      href={`mailto:${feedback.submitterEmail}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {feedback.submitterEmail}
                    </a>
                  </DetailRow>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <pre className="text-[11px] font-mono text-muted-foreground overflow-auto rounded-lg bg-muted/40 p-3 max-h-40">
                  {JSON.stringify(feedback.metadata, null, 2)}
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
