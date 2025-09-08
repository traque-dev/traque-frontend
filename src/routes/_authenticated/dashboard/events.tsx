import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { type } from 'arktype';
import { SortAscIcon, SortDescIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useProjectEvents } from '@/api/events/hooks';
import { getProjectsQueryOptions } from '@/api/projects/query-options';
import { DataTable } from '@/components/data-table';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';
import type { Event } from '@/types/event';
import type { Pageable } from '@/types/pageable';

const eventsSearchParams = type({
  'projectId?': 'string',
  sort: type('string').default('createdAt:DESC'),
  page: type('number').default(1),
  size: type('number').default(10),
});

export const Route = createFileRoute('/_authenticated/dashboard/events')({
  component: EventsPage,
  validateSearch: eventsSearchParams,
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
      title: 'Events',
      activeOrganization,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  notFoundComponent: OrganizationProjectGate,
  errorComponent: () => <div>Error</div>,
});

function EventsPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { projectId, page, size, sort } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOptions(activeOrganization.id),
  );

  const pageable = useMemo<Pageable<Event>>(
    () => ({ page, size, sort: [sort] as Pageable<Event>['sort'] }),
    [page, size, sort],
  );

  const { data: eventsPage, isLoading } = useProjectEvents(
    activeOrganization.id,
    projectId,
    pageable,
  );

  const totalPages = eventsPage?.meta.totalPages ?? 1;

  const [sortKey, sortDir] = sort.split(':');

  const sorting = useMemo<SortingState>(() => {
    if (!sortKey) return [];
    return [{ id: sortKey, desc: sortDir === 'DESC' }];
  }, [sortKey, sortDir]);

  const columns = useMemo<ColumnDef<Event>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Event',
        cell: ({ row }) => (
          <div className="truncate font-medium max-w-[520px]">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'properties',
        header: 'Properties',
        cell: ({ row }) => {
          const entries = Object.entries(row.original.properties ?? {});
          if (entries.length === 0) {
            return <span className="text-muted-foreground">—</span>;
          }
          const shown = entries.slice(0, 3);
          const remaining = Math.max(0, entries.length - shown.length);
          return (
            <div className="flex items-center gap-1 max-w-[520px] truncate">
              {shown.map(([k, v]) => (
                <Badge key={k} variant="secondary" className="font-normal">
                  {k}: {String(v)}
                </Badge>
              ))}
              {remaining > 0 ? (
                <Badge variant="outline">+{remaining}</Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
        enableSorting: true,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
        enableSorting: true,
      },
    ],
    [],
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
          <h1 className="text-xl font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground text-sm">
            Explore and analyze events across your projects
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
              <SelectItem value="createdAt">Created</SelectItem>
              <SelectItem value="updatedAt">Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
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

      <DataTable<Event>
        columns={columns}
        data={eventsPage?.items ?? []}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        emptyText="No events found."
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
        pageDataMeta={eventsPage?.meta}
      />
    </div>
  );
}
