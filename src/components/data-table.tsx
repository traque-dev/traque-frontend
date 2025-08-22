import type {
  ColumnDef,
  Table as ReactTableInstance,
  SortingState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SortAscIcon, SortDescIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Page } from '@/types/page';

export type DataTablePaginationProps = {
  page: number;
  size: number;
  totalPages?: number;
  onPageChange?: (nextPage: number) => void;
  onSizeChange?: (nextSize: number) => void;
  pageSizeOptions?: number[];
};

export type DataTableProps<TData extends Record<string, unknown>> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  className?: string;
  /** Enable manual sorting and control it from the outside */
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState) => void;
  /** Optional loader/empty text */
  isLoading?: boolean;
  emptyText?: string;
  /** Optional pagination controls */
  pagination?: DataTablePaginationProps;
  /** Provide full Page<T> and we will infer pagination text from meta if present */
  pageDataMeta?: Page<TData>['meta'];
  /** Row click handler */
  onRowClick?: (row: TData) => void;
};

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  className,
  manualSorting = false,
  sorting,
  onSortingChange,
  isLoading,
  emptyText = 'No records found',
  pagination,
  pageDataMeta,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting,
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const next =
        typeof updater === 'function' ? updater(sorting ?? []) : updater;
      onSortingChange(next);
    },
    state: { sorting: sorting ?? [] },
  });

  const totalPages = useMemo(() => {
    return pageDataMeta?.totalPages ?? pagination?.totalPages ?? 1;
  }, [pageDataMeta?.totalPages, pagination?.totalPages]);

  const currentPage = pageDataMeta?.currentPage ?? pagination?.page ?? 1;

  const basePages = useMemo(() => {
    return [1, 2, 3].filter((n) => n >= 1 && n <= totalPages);
  }, [totalPages]);

  const shouldShowLast = useMemo(() => totalPages > 3, [totalPages]);

  const hasGapBeforeLast = useMemo(() => {
    if (!shouldShowLast) return false;

    const lastBase = basePages[basePages.length - 1] ?? 0;
    return totalPages - lastBase > 1;
  }, [shouldShowLast, basePages, totalPages]);

  return (
    <div className={cn('space-y-3 pb-2', className)}>
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === 'asc' ? (
                        <SortAscIcon className="size-3" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <SortDescIcon className="size-3" />
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground px-1 w-fit">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination className="w-fit">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange?.(Math.max(1, currentPage - 1));
                  }}
                />
              </PaginationItem>
              {basePages.map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      pagination.onPageChange?.(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {hasGapBeforeLast ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              {shouldShowLast ? (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={totalPages === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      pagination.onPageChange?.(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange?.(
                      Math.min(totalPages, currentPage + 1),
                    );
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex items-center gap-2">
            {pagination.pageSizeOptions && pagination.onSizeChange ? (
              <div className="flex items-center gap-1">
                {pagination.pageSizeOptions.map((s) => (
                  <Button
                    key={s}
                    variant={s === pagination.size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => pagination.onSizeChange?.(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { ReactTableInstance };
