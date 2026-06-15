import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from '@tanstack/react-router';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { type } from 'arktype';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  MoreVertical,
  Plus,
  Search,
  SortAscIcon,
  SortDescIcon,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDeleteShortLink, useShortLinks } from '@/api/short-links/hooks';
import { getShortLinksQueryOptions } from '@/api/short-links/query-options';
import type { ShortLinkFilters } from '@/api/short-links/types';
import { DataTable } from '@/components/data-table';
import { LinkLinearIcon } from '@/components/icons/link-linear';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dayjs } from '@/lib/dayjs';
import type { Pageable } from '@/types/pageable';
import type { ShortLink } from '@/types/short-link';

const shortLinksSearchParams = type({
  sort: type('string').default('createdAt:DESC'),
  page: type('number').default(1),
  size: type('number').default(20),
  'search?': 'string',
  'isActive?': 'boolean',
});

export const Route = createFileRoute('/_authenticated/dashboard/short-links/')({
  component: ShortLinksPage,
  validateSearch: shortLinksSearchParams,
  loaderDeps: ({ search }) => ({
    page: search.page,
    size: search.size,
    sort: search.sort,
    search: search.search,
    isActive: search.isActive,
  }),
  loader: async ({ context, deps }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({ data: { type: 'organization' } });
    }

    await context.queryClient.ensureQueryData(
      getShortLinksQueryOptions(
        activeOrganization.id,
        {
          page: deps.page,
          size: deps.size,
          sort: [deps.sort] as Pageable<ShortLink>['sort'],
        },
        { search: deps.search, isActive: deps.isActive },
      ),
    );

    return { activeOrganization };
  },
  pendingComponent: () => <div>Loading...</div>,
});

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Short URL copied');
  } catch {
    toast.error('Failed to copy');
  }
}

function ShortLinksPage() {
  const { activeOrganization } = Route.useLoaderData();
  const { page, size, sort, search, isActive } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [searchInput, setSearchInput] = useState(search ?? '');

  useEffect(() => {
    setSearchInput(search ?? '');
  }, [search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchInput.trim() || undefined;
      if (next === search) return;
      navigate({ search: (prev) => ({ ...prev, search: next, page: 1 }) });
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput, search, navigate]);

  const pageable = useMemo<Pageable<ShortLink>>(
    () => ({ page, size, sort: [sort] as Pageable<ShortLink>['sort'] }),
    [page, size, sort],
  );

  const filters = useMemo<ShortLinkFilters>(
    () => ({ search, isActive }),
    [search, isActive],
  );

  const { data: shortLinksPage, isLoading } = useShortLinks(
    activeOrganization.id,
    pageable,
    filters,
  );

  const { mutate: remove } = useDeleteShortLink(activeOrganization.id);

  const totalPages = shortLinksPage?.meta.totalPages ?? 1;

  const [sortKey, sortDir] = sort.split(':');

  const sorting = useMemo<SortingState>(() => {
    if (!sortKey) return [];
    return [{ id: sortKey, desc: sortDir === 'DESC' }];
  }, [sortKey, sortDir]);

  const statusValue =
    isActive === undefined ? 'all' : isActive ? 'active' : 'inactive';

  const columns = useMemo<ColumnDef<ShortLink>[]>(
    () => [
      {
        accessorKey: 'slug',
        header: 'Short link',
        enableSorting: true,
        cell: ({ row }) => {
          const link = row.original;
          return (
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium font-mono text-sm truncate max-w-[220px]">
                  {link.shortUrl}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(link.shortUrl);
                  }}
                  aria-label="Copy short URL"
                >
                  <Copy className="size-3" />
                </Button>
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Open short URL"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
              {link.title ? (
                <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                  {link.title}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'destinationUrl',
        header: 'Destination',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[320px] block">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'clickCount',
        header: 'Clicks',
        enableSorting: true,
        cell: ({ row }) => {
          const { clickCount, clickLimit } = row.original;
          return (
            <span className="tabular-nums text-sm">
              {clickCount.toLocaleString()}
              {clickLimit != null ? (
                <span className="text-muted-foreground"> / {clickLimit}</span>
              ) : null}
            </span>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const link = row.original;
          const expired =
            link.expiresAt != null && dayjs(link.expiresAt).isBefore(dayjs());
          if (expired) {
            return <Badge variant="secondary">Expired</Badge>;
          }
          return link.isActive ? (
            <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          );
        },
      },
      {
        accessorKey: 'lastClickedAt',
        header: 'Last click',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <span className="text-sm">{dayjs(value).format('ll LT')}</span>
          ) : (
            <span className="text-muted-foreground">Never</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll'),
      },
      {
        accessorKey: 'id',
        header: '',
        cell: ({ row }) => {
          const link = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(link.shortUrl);
                    }}
                  >
                    <Copy className="size-4 mr-2" /> Copy short URL
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4 mr-2" /> Open link
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(link.id, {
                        onSuccess: () => toast.success('Short link deleted'),
                        onError: () => toast.error('Failed to delete'),
                      });
                    }}
                  >
                    <Trash2 className="size-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                to="/dashboard/short-links/$shortLinkId"
                params={{ shortLinkId: link.id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost" size="icon" className="size-7">
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
          );
        },
      },
    ],
    [remove],
  );

  const handleSortingChange = (next: SortingState) => {
    const nextSort = next[0]
      ? `${next[0].id}:${next[0].desc ? 'DESC' : 'ASC'}`
      : undefined;
    navigate({
      search: (prev) => ({ ...prev, sort: nextSort ?? prev.sort, page: 1 }),
    });
  };

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Short Links</h1>
          <p className="text-muted-foreground text-sm">
            Create branded short links and track every click
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/short-links/new">
            <Plus className="size-4" /> Create Link
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by slug"
              className="pl-8 h-9 w-56"
            />
          </div>

          <Select
            value={statusValue}
            onValueChange={(v) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  isActive: v === 'all' ? undefined : v === 'active',
                  page: 1,
                }),
              });
            }}
          >
            <SelectTrigger size="sm" className="min-w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
              <SelectItem value="slug">Slug</SelectItem>
              <SelectItem value="clickCount">Clicks</SelectItem>
              <SelectItem value="lastClickedAt">Last click</SelectItem>
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

      {!isLoading &&
      (shortLinksPage?.items.length ?? 0) === 0 &&
      !search &&
      isActive === undefined ? (
        <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LinkLinearIcon className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              No short links yet
            </h2>
            <p className="text-muted-foreground max-w-md">
              Create your first short link to start sharing branded URLs and
              tracking clicks.
            </p>
          </div>
          <Button asChild className="min-w-48">
            <Link to="/dashboard/short-links/new">
              <Plus className="size-4" /> Create Link
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable<ShortLink>
          columns={columns}
          data={shortLinksPage?.items ?? []}
          manualSorting={true}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          emptyText="No short links match your filters."
          onRowClick={(row) =>
            navigate({
              to: '/dashboard/short-links/$shortLinkId',
              params: { shortLinkId: row.id },
            })
          }
          pagination={{
            page,
            size,
            totalPages,
            onPageChange: (nextPage) =>
              navigate({ search: (prev) => ({ ...prev, page: nextPage }) }),
            onSizeChange: (nextSize) =>
              navigate({
                search: (prev) => ({ ...prev, size: nextSize, page: 1 }),
              }),
            pageSizeOptions: [10, 20, 50],
          }}
          pageDataMeta={shortLinksPage?.meta}
        />
      )}
    </div>
  );
}
