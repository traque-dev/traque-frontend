import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { type } from 'arktype';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { useProjectIssues } from '@/api/issues/hooks';
import type { IssueFilters } from '@/api/issues/types';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import { DataTable } from '@/components/data-table';
import { IssueSeverityBadge } from '@/components/issue-severity-badge';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { issuesDatePresetRanges } from '@/constants/issues-date-preset-ranges';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';
import { EventEnvironment } from '@/types/event-environment';
import type { Issue } from '@/types/issue';
import type { Pageable } from '@/types/pageable';

const issuesSearchParams = type({
  'projectId?': 'string',
  sort: type('string').default('lastSeen:DESC'),
  page: type('number').default(1),
  size: type('number').default(20),
  'environments?': type.valueOf(EventEnvironment).array(),
  'from?': type('string.date'),
  'to?': type('string.date'),
});

export const Route = createFileRoute('/_authenticated/dashboard/issues')({
  component: IssuesPage,
  validateSearch: issuesSearchParams,
  loaderDeps: ({ search }) => ({
    projectId: search.projectId,
  }),
  loader: async ({ context, deps }) => {
    const { data: activeOrganization, error } =
      await auth.organization.getFullOrganization();

    if (error) throw error;

    if (!activeOrganization) {
      throw notFound({
        data: {
          type: 'organization',
        },
      });
    }

    const projects = await context.queryClient.ensureQueryData(
      getProjectsQueryOptions(activeOrganization.id),
    );

    if (projects?.length === 0) {
      throw notFound({
        data: {
          type: 'projects',
        },
      });
    }

    if (!deps.projectId) {
      throw redirect({
        search: (prev) => ({
          ...prev,
          projectId: projects[0].id,
        }),
      });
    }

    return {
      title: 'Issues',
      activeOrganization,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  notFoundComponent: OrganizationProjectGate,
  errorComponent: () => <div>Error</div>,
});

function IssuesPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { projectId, page, size, environments, sort, from, to } =
    Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOptions(activeOrganization.id),
  );

  const pageable = useMemo<Pageable<Issue>>(
    () => ({ page, size, sort: [sort] as Pageable<Issue>['sort'] }),
    [page, size, sort],
  );

  const filters = useMemo<IssueFilters>(() => {
    const dateFrom = from
      ? dayjs(from).startOf('day').toISOString()
      : undefined;
    const dateTo = to ? dayjs(to).endOf('day').toISOString() : undefined;
    return {
      environments: environments?.length ? environments : undefined,
      dateFrom,
      dateTo,
    };
  }, [from, to, environments]);

  const { data: issuesPage, isLoading } = useProjectIssues(
    activeOrganization.id,
    projectId,
    pageable,
    filters,
  );

  const totalPages = issuesPage?.meta.totalPages ?? 1;

  const [sortKey, sortDir] = sort.split(':');

  const sorting = useMemo<SortingState>(() => {
    if (!sortKey) return [];
    return [{ id: sortKey, desc: sortDir === 'DESC' }];
  }, [sortKey, sortDir]);

  const columns = useMemo<ColumnDef<Issue>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Issue',
        cell: ({ row }) => (
          <div className="truncate font-medium max-w-[520px]">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ getValue }) => (
          <IssueSeverityBadge severity={String(getValue()) as any} />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <IssueStatusBadge status={String(getValue()) as any} />
        ),
      },
      {
        accessorKey: 'firstSeen',
        header: 'First seen',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
        enableSorting: true,
      },
      {
        accessorKey: 'lastSeen',
        header: 'Last seen',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
        enableSorting: true,
      },
      {
        accessorKey: 'eventCount',
        header: 'Events',
        cell: ({ getValue }) => String(getValue()),
        enableSorting: true,
      },
      {
        accessorKey: 'id',
        header: '',
        cell: ({ row }) => (
          <Link
            to="/dashboard/issues/$issueId"
            params={{ issueId: row.original.id! }}
            search={{ projectId: projectId! }}
          >
            <Button variant="ghost" size="icon" className="size-6">
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        ),
      },
    ],
    [projectId],
  );

  const handleSortingChange = (next: SortingState) => {
    const nextSort = next[0]
      ? `${next[0].id}:${next[0].desc ? 'DESC' : 'ASC'}`
      : undefined;
    navigate({
      search: (prev) => ({
        ...prev,
        sort: nextSort ?? prev.sort,
        page: 1,
      }),
    });
  };

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Issues</h1>
          <p className="text-muted-foreground text-sm">
            Explore, and filter issues across your projects
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={projectId}
            onValueChange={(v) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  projectId: v,
                  page: 1,
                }),
              });
            }}
          >
            <SelectTrigger size="sm" className="min-w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects
                ?.filter((p) => Boolean(p.id))
                .map((p) => (
                  <SelectItem key={p.id as string} value={p.id as string}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="size-4" />
                {from && to
                  ? `${dayjs(from).format('ll')} – ${dayjs(to).format('ll')}`
                  : 'Time range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {issuesDatePresetRanges.map((r) => (
                    <Button
                      key={r.label}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            from: r.from.toISOString(),
                            to: r.to.toISOString(),
                          }),
                        });
                      }}
                    >
                      {r.label}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          from: undefined,
                          to: undefined,
                        }),
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={
                    from && to
                      ? {
                          from: new Date(from),
                          to: new Date(to),
                        }
                      : undefined
                  }
                  onSelect={(range) => {
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        from: range?.from?.toISOString(),
                        to: range?.to?.toISOString(),
                      }),
                    });
                  }}
                  numberOfMonths={2}
                  showOutsideDays
                />
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="size-4" /> Environments
                {environments && environments.length > 0 ? (
                  <Badge variant="secondary">{environments.length}</Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Environments</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(EventEnvironment).map((env) => (
                <DropdownMenuCheckboxItem
                  key={env}
                  checked={environments?.includes(env)}
                  onCheckedChange={(checked) => {
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        environments: checked
                          ? [...(prev.environments ?? []), env]
                          : (prev.environments ?? []).filter((e) => e !== env),
                      }),
                    });
                  }}
                >
                  {env}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={sortKey}
            onValueChange={(v) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  sort: `${v}:${sortDir}`,
                  page: 1,
                }),
              });
            }}
          >
            <SelectTrigger size="sm" className="min-w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstSeen">First seen</SelectItem>
              <SelectItem value="lastSeen">Last seen</SelectItem>
              <SelectItem value="eventCount">Event count</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  sort: `${sortKey}:${sortDir === 'ASC' ? 'DESC' : 'ASC'}`,
                }),
              });
            }}
            aria-label="Toggle sort direction"
          >
            {sortDir === 'ASC' ? (
              <>
                <SortAscIcon className="size-4" /> Asc
              </>
            ) : (
              <>
                <SortDescIcon className="size-4" /> Desc
              </>
            )}
          </Button>
        </div>
      </div>

      <DataTable<Issue>
        columns={columns}
        data={issuesPage?.items ?? []}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        emptyText="No issues found. Adjust filters to see results."
        pagination={{
          page,
          size,
          totalPages,
          onPageChange: (nextPage) =>
            navigate({
              search: (prev) => ({
                ...prev,
                page: nextPage,
              }),
            }),
          onSizeChange: (nextSize) =>
            navigate({
              search: (prev) => ({
                ...prev,
                size: nextSize,
                page: 1,
              }),
            }),
          pageSizeOptions: [10, 20, 50],
        }}
        pageDataMeta={issuesPage?.meta}
      />
    </div>
  );
}
