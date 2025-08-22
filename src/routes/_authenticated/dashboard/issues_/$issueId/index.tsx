import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { type } from 'arktype';
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Copy,
  RefreshCcw,
  Slash,
  Undo2,
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { getExceptionsQueryOptions } from '@/api/exceptions/query-options';
import { changeIssueSeverity, changeIssueStatus } from '@/api/issues';
import { getProjectIssueByIdQueryOptions } from '@/api/issues/query-options';
import { DataTable } from '@/components/data-table';
import { IssueSeverityBadge } from '@/components/issue-severity-badge';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';
import type { Exception } from '@/types/exception';
import { IssueSeverity } from '@/types/issue-severity';
import { IssueStatus } from '@/types/issue-status';

const issuePageSearchParamsSchema = type({
  projectId: 'string.uuid',
});

export const Route = createFileRoute(
  '/_authenticated/dashboard/issues_/$issueId/',
)({
  component: IssuePage,
  validateSearch: issuePageSearchParamsSchema,
  loaderDeps: ({ search }) => ({
    projectId: search.projectId,
  }),
  loader: async ({ context, params, deps }) => {
    // TODO: move active organization to context
    const { data: activeOrganization, error } =
      await auth.organization.getFullOrganization();

    if (error) throw error;

    if (!activeOrganization) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(
      getProjectIssueByIdQueryOptions(
        activeOrganization.id,
        deps.projectId,
        params.issueId,
      ),
    );

    context.queryClient.ensureQueryData(
      getExceptionsQueryOptions(
        activeOrganization.id,
        deps.projectId,
        params.issueId,
        {
          page: 1,
          size: 5,
        },
      ),
    );

    return {
      activeOrganization,
      projectId: deps.projectId,
      issueId: params.issueId,
    };
  },
});

function IssuePage() {
  const { activeOrganization, projectId, issueId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: issue } = useSuspenseQuery(
    getProjectIssueByIdQueryOptions(activeOrganization.id, projectId, issueId),
  );

  const { data: latestExceptions, refetch: refetchLatestExceptions } =
    useSuspenseQuery(
      getExceptionsQueryOptions(activeOrganization.id, projectId, issueId, {
        page: 1,
        size: 5,
      }),
    );

  const { mutate: setStatus, isPending: isSettingStatus } = useMutation({
    mutationFn: async (nextStatus: IssueStatus) =>
      changeIssueStatus(activeOrganization.id, projectId, issueId, nextStatus),
    onMutate: async (nextStatus) => {
      await queryClient.cancelQueries({
        queryKey: ['issues', activeOrganization.id, projectId, issueId],
      });
      const previous = queryClient.getQueryData<typeof issue>([
        'issues',
        activeOrganization.id,
        projectId,
        issueId,
      ]);
      queryClient.setQueryData(
        ['issues', activeOrganization.id, projectId, issueId],
        {
          ...issue,
          status: nextStatus,
        },
      );
      return { previous } as const;
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(
          ['issues', activeOrganization.id, projectId, issueId],
          ctx.previous,
        );
      }
      toast.error('Failed to update status');
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({
        queryKey: ['issues', activeOrganization.id, projectId],
        exact: false,
      });
    },
  });

  const { mutate: setSeverity, isPending: isSettingSeverity } = useMutation({
    mutationFn: async (nextSeverity: IssueSeverity) =>
      changeIssueSeverity(
        activeOrganization.id,
        projectId,
        issueId,
        nextSeverity,
      ),
    onMutate: async (nextSeverity) => {
      await queryClient.cancelQueries({
        queryKey: ['issues', activeOrganization.id, projectId, issueId],
      });
      const previous = queryClient.getQueryData<typeof issue>([
        'issues',
        activeOrganization.id,
        projectId,
        issueId,
      ]);
      queryClient.setQueryData(
        ['issues', activeOrganization.id, projectId, issueId],
        {
          ...issue,
          severity: nextSeverity,
        },
      );
      return { previous } as const;
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(
          ['issues', activeOrganization.id, projectId, issueId],
          ctx.previous,
        );
      }
      toast.error('Failed to update severity');
    },
    onSuccess: () => {
      toast.success('Severity updated');
      queryClient.invalidateQueries({
        queryKey: ['issues', activeOrganization.id, projectId],
        exact: false,
      });
    },
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(issueId);
      toast.success('Issue ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // TODO: move to a separate component
  const exceptionColumns = useMemo<ColumnDef<Exception>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Time',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
      },
      {
        accessorKey: 'name',
        header: 'Exception',
        cell: ({ row }) => (
          <div className="max-w-[520px]">
            <div className="font-medium truncate">{row.original.name}</div>
            <div className="text-muted-foreground text-xs truncate">
              {row.original.message}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'httpContext.statusCode',
        header: 'Status',
        cell: ({ row }) => row.original.httpContext?.statusCode ?? '-',
      },
      {
        accessorKey: 'httpContext.method',
        header: 'Method',
        cell: ({ row }) => row.original.httpContext?.method ?? '-',
      },
      {
        accessorKey: 'environment',
        header: 'Env',
      },
      {
        accessorKey: 'platform',
        header: 'Platform',
      },
      {
        accessorKey: 'httpContext.url',
        header: 'URL',
        cell: ({ row }) => (
          <div className="truncate max-w-[280px]">
            {row.original.httpContext?.url ?? '-'}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => {
              router.history.back();
            }}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold tracking-tight">Issue</h1>
        </div>

        <div className="flex items-center gap-2">
          {issue.status === IssueStatus.OPEN ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => setStatus(IssueStatus.RESOLVED)}
              disabled={isSettingStatus}
            >
              <Check className="size-4 mr-1" /> Resolve
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStatus(IssueStatus.OPEN)}
              disabled={isSettingStatus}
            >
              <Undo2 className="size-4 mr-1" /> Reopen
            </Button>
          )}
          {issue.status !== IssueStatus.IGNORED && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus(IssueStatus.IGNORED)}
              disabled={isSettingStatus}
            >
              <Slash className="size-4 mr-1" /> Ignore
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleCopyId}>
            <Copy className="size-4 mr-1" /> Copy ID
          </Button>
        </div>
      </div>

      <Card className="shadow-none border-none p-0">
        <CardHeader className="pb-3 px-0">
          <CardTitle className="flex items-center gap-3">
            <span className="truncate font-semibold text-lg" title={issue.name}>
              {issue.name}
            </span>
            {/* <IssueStatusBadge status={issue.status} className="shrink-0" /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  aria-label="Change severity"
                >
                  <IssueSeverityBadge severity={issue.severity} />
                  <ChevronsUpDown className="size-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Set severity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(IssueSeverity).map((sev) => (
                  <DropdownMenuItem
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    disabled={isSettingSeverity}
                  >
                    <IssueSeverityBadge severity={sev} className="mr-2" />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  aria-label="Change status"
                >
                  <IssueStatusBadge status={issue.status} />
                  <ChevronsUpDown className="size-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Set status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(IssueStatus).map((st) => (
                  <DropdownMenuItem
                    key={st}
                    onClick={() => setStatus(st)}
                    disabled={isSettingStatus}
                  >
                    <IssueStatusBadge status={st} className="mr-2" />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    First seen
                  </div>
                  <div className="font-medium">
                    {dayjs(issue.firstSeen).format('ll LT')}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Last seen</div>
                  <div className="font-medium">
                    {dayjs(issue.lastSeen).format('ll LT')}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Events</div>
                  <div className="font-medium tabular-nums">
                    {issue.eventCount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Activity</div>
                    <div className="text-xs text-muted-foreground">
                      Recent activity will appear here
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchLatestExceptions()}
                  >
                    <RefreshCcw className="size-4 mr-1" /> Refresh
                  </Button>
                </div>

                <DataTable<Exception>
                  columns={exceptionColumns}
                  data={latestExceptions?.items ?? []}
                  emptyText="No exceptions yet"
                  pageDataMeta={latestExceptions?.meta}
                  className="mt-2 [&>div]:border-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Issue ID</span>
                    <span className="font-mono">{issue.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <IssueStatusBadge status={issue.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Severity</span>
                    <IssueSeverityBadge severity={issue.severity} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
