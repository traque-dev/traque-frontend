import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { type } from 'arktype';
import { Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getExceptionsQueryOptions } from '@/api/exceptions/query-options';
import { DataTable } from '@/components/data-table';
import { ExceptionDetailsDialog } from '@/components/exceptions-details-dialog';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';
import type { Exception } from '@/types/exception';
import type { Pageable } from '@/types/pageable';

const exceptionsPageSearchParamsSchema = type({
  projectId: 'string.uuid',
  page: type('number.integer').default(1),
  size: type('number.integer').default(10),
});

export const Route = createFileRoute(
  '/_authenticated/dashboard/issues_/$issueId/exceptions/',
)({
  component: ExceptionsPage,
  validateSearch: exceptionsPageSearchParamsSchema,
  loaderDeps: ({ search }) => ({
    projectId: search.projectId,
    page: search.page,
    size: search.size,
  }),
  loader: async ({ deps, context, params }) => {
    const { data: activeOrganization, error } =
      await auth.organization.getFullOrganization();

    if (error) throw error;

    if (!activeOrganization) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(
      getExceptionsQueryOptions(
        activeOrganization.id,
        deps.projectId,
        params.issueId,
        {
          page: deps.page,
          size: deps.size,
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

function ExceptionsPage() {
  const { activeOrganization, projectId } = Route.useLoaderData();
  const { page, size } = Route.useSearch();
  const { issueId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });

  const pageable = useMemo<Pageable<Exception>>(
    () => ({ page, size }),
    [page, size],
  );

  const { data: exceptionsPage, isLoading } = useSuspenseQuery(
    getExceptionsQueryOptions(
      activeOrganization.id,
      projectId,
      issueId,
      pageable,
    ),
  );

  const totalPages = exceptionsPage?.meta.totalPages ?? 1;

  const [selectedExceptionId, setSelectedExceptionId] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openDetails = (exceptionId: string) => {
    setSelectedExceptionId(exceptionId);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedExceptionId(undefined);
  };

  const columns = useMemo<ColumnDef<Exception>[]>(
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
            <div className="font-medium truncate" title={row.original.name}>
              {row.original.name}
            </div>
            <div
              className="text-muted-foreground text-xs truncate"
              title={row.original.message}
            >
              {row.original.message}
            </div>
          </div>
        ),
      },
      // {
      //   accessorKey: 'httpContext',
      //   header: 'Status',
      //   cell: ({ row }) => row.original.httpContext?.statusCode ?? '-',
      // },
      // {
      //   accessorKey: 'httpContext',
      //   header: 'Method',
      //   cell: ({ row }) =>
      //     row.original.httpContext?.method ? (
      //       <Badge variant="secondary">{row.original.httpContext.method}</Badge>
      //     ) : (
      //       '-'
      //     ),
      // },
      {
        accessorKey: 'environment',
        header: 'Env',
      },
      {
        accessorKey: 'platform',
        header: 'Platform',
      },
      // {
      //   accessorKey: 'httpContext',
      //   header: 'URL',
      //   cell: ({ row }) => (
      //     <div
      //       className="truncate max-w-[320px]"
      //       title={row.original.httpContext?.url}
      //     >
      //       {row.original.httpContext?.url ?? '-'}
      //     </div>
      //   ),
      // },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={(e) => {
              e.stopPropagation();
              if (row.original.id) openDetails(row.original.id);
            }}
            aria-label="View details"
          >
            <Eye className="size-3" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="pt-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Exceptions</h1>
        <p className="text-muted-foreground text-sm">
          Explore exceptions for this issue. Click a row to view details.
        </p>
      </div>

      <DataTable<Exception>
        columns={columns}
        data={exceptionsPage?.items ?? []}
        isLoading={isLoading}
        emptyText="No exceptions found."
        onRowClick={(row) => row.id && openDetails(row.id)}
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
        pageDataMeta={exceptionsPage?.meta}
      />

      <ExceptionDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          if (!open) closeDetails();
        }}
        organizationId={activeOrganization.id}
        projectId={projectId}
        exceptionId={selectedExceptionId}
      />
    </div>
  );
}
