import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  MousePointerClick,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDeleteShortLink } from '@/api/short-links/hooks';
import {
  getShortLinkBreakdownQueryOptions,
  getShortLinkByIdQueryOptions,
  getShortLinkClicksQueryOptions,
  getShortLinkStatsQueryOptions,
  getShortLinkTimeseriesQueryOptions,
} from '@/api/short-links/query-options';
import { DataTable } from '@/components/data-table';
import { ShortLinkClicksChart } from '@/components/short-link-clicks-chart';
import { ShortLinkEditSheet } from '@/components/short-link-edit-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Separator } from '@/components/ui/separator';
import { dayjs } from '@/lib/dayjs';
import type {
  ClickBreakdownDimension,
  ClickDeviceType,
  ClickTimePeriod,
  ShortLinkClick,
} from '@/types/short-link';

export const Route = createFileRoute(
  '/_authenticated/dashboard/short-links/$shortLinkId/',
)({
  component: ShortLinkDetailPage,
  loader: async ({ context, params }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    await context.queryClient.ensureQueryData(
      getShortLinkByIdQueryOptions(activeOrganization.id, params.shortLinkId),
    );
    context.queryClient.ensureQueryData(
      getShortLinkStatsQueryOptions(activeOrganization.id, params.shortLinkId),
    );
    context.queryClient.ensureQueryData(
      getShortLinkTimeseriesQueryOptions(
        activeOrganization.id,
        params.shortLinkId,
        'week',
      ),
    );

    return { activeOrganization, shortLinkId: params.shortLinkId };
  },
});

const DEVICE_LABELS: Record<ClickDeviceType, string> = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  TABLET: 'Tablet',
  BOT: 'Bot',
  UNKNOWN: 'Unknown',
};

const DIMENSION_OPTIONS: { value: ClickBreakdownDimension; label: string }[] = [
  { value: 'country', label: 'Countries' },
  { value: 'referer', label: 'Referrers' },
  { value: 'device', label: 'Devices' },
  { value: 'browser', label: 'Browsers' },
  { value: 'os', label: 'Operating systems' },
];

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Short URL copied');
  } catch {
    toast.error('Failed to copy');
  }
}

function ShortLinkDetailPage() {
  const { activeOrganization, shortLinkId } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();

  const [period, setPeriod] = useState<ClickTimePeriod>('week');
  const [dimension, setDimension] =
    useState<ClickBreakdownDimension>('country');
  const [clicksPage, setClicksPage] = useState(1);
  const [clicksSize, setClicksSize] = useState(10);
  const [editOpen, setEditOpen] = useState(false);

  const { data: link } = useSuspenseQuery(
    getShortLinkByIdQueryOptions(activeOrganization.id, shortLinkId),
  );

  const { data: stats } = useQuery(
    getShortLinkStatsQueryOptions(activeOrganization.id, shortLinkId),
  );

  const { data: timeseries } = useQuery(
    getShortLinkTimeseriesQueryOptions(
      activeOrganization.id,
      shortLinkId,
      period,
    ),
  );

  const { data: breakdown } = useQuery(
    getShortLinkBreakdownQueryOptions(
      activeOrganization.id,
      shortLinkId,
      dimension,
      10,
    ),
  );

  const { data: clicksData, isLoading: clicksLoading } = useQuery(
    getShortLinkClicksQueryOptions(activeOrganization.id, shortLinkId, {
      page: clicksPage,
      size: clicksSize,
      sort: ['clickedAt:DESC'],
    }),
  );

  const { mutate: remove, isPending: isDeleting } = useDeleteShortLink(
    activeOrganization.id,
  );

  const expired =
    link.expiresAt != null && dayjs(link.expiresAt).isBefore(dayjs());
  const limitReached =
    link.clickLimit != null && link.clickCount >= link.clickLimit;

  const statusBadge = expired ? (
    <Badge variant="secondary">Expired</Badge>
  ) : limitReached ? (
    <Badge variant="secondary">Limit reached</Badge>
  ) : link.isActive ? (
    <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );

  const breakdownMax = useMemo(
    () => Math.max(1, ...(breakdown ?? []).map((b) => b.count)),
    [breakdown],
  );

  const clickColumns = useMemo<ColumnDef<ShortLinkClick>[]>(
    () => [
      {
        accessorKey: 'clickedAt',
        header: 'Time',
        cell: ({ getValue }) => dayjs(String(getValue())).format('ll LT'),
      },
      {
        accessorKey: 'country',
        header: 'Location',
        cell: ({ row }) => {
          const { city, region, country } = row.original;
          const parts = [city, region, country].filter(Boolean);
          return parts.length > 0 ? (
            <span className="text-sm">{parts.join(', ')}</span>
          ) : (
            <span className="text-muted-foreground">Unknown</span>
          );
        },
      },
      {
        accessorKey: 'deviceType',
        header: 'Device',
        cell: ({ getValue }) => {
          const device = getValue() as ClickDeviceType;
          return (
            <Badge variant="secondary" className="text-xs font-normal">
              {DEVICE_LABELS[device] ?? device}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'browser',
        header: 'Browser',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <span className="text-sm">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'os',
        header: 'OS',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <span className="text-sm">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'refererDomain',
        header: 'Referrer',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <span className="text-sm truncate max-w-[160px] block">
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground">Direct</span>
          );
        },
      },
      {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <span className="text-sm">{value}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'isBot',
        header: 'Bot',
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge variant="outline" className="text-xs">
              Bot
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="pt-6 space-y-6 pb-4">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {link.title || link.slug}
          </h1>
          {statusBadge}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4 mr-1" /> Open
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete short link</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{' '}
                  <span className="font-mono">{link.shortUrl}</span> and all of
                  its recorded clicks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    remove(shortLinkId, {
                      onSuccess: () => {
                        toast.success('Short link deleted');
                        navigate({ to: '/dashboard/short-links' });
                      },
                      onError: () => toast.error('Failed to delete'),
                    })
                  }
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-primary hover:underline"
        >
          {link.shortUrl}
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => copyToClipboard(link.shortUrl)}
          aria-label="Copy short URL"
        >
          <Copy className="size-3" />
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<MousePointerClick className="size-4" />}
          label="Total clicks"
          value={(stats?.totalClicks ?? link.clickCount).toLocaleString()}
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Unique visitors"
          value={(stats?.uniqueVisitors ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<MousePointerClick className="size-4" />}
          label="Today"
          value={(stats?.clicksToday ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<MousePointerClick className="size-4" />}
          label="Last 7 days"
          value={(stats?.clicksLast7Days ?? 0).toLocaleString()}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Clicks over time</div>
                <div className="text-xs text-muted-foreground">
                  {period === 'day'
                    ? 'Hourly clicks over the last 24 hours'
                    : period === 'week'
                      ? 'Daily clicks over the last 7 days'
                      : 'Daily clicks over the last 30 days'}
                </div>
              </div>
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as ClickTimePeriod)}
              >
                <SelectTrigger className="w-32" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ShortLinkClicksChart data={timeseries ?? []} period={period} />
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-1">Recent clicks</div>
            <div className="text-xs text-muted-foreground mb-3">
              Raw click events recorded for this link
            </div>
            <DataTable<ShortLinkClick>
              columns={clickColumns}
              data={clicksData?.items ?? []}
              isLoading={clicksLoading}
              emptyText="No clicks recorded yet"
              className="[&>div]:rounded-sm"
              pagination={{
                page: clicksPage,
                size: clicksSize,
                totalPages: clicksData?.meta.totalPages ?? 1,
                onPageChange: setClicksPage,
                onSizeChange: (s) => {
                  setClicksSize(s);
                  setClicksPage(1);
                },
                pageSizeOptions: [10, 20, 50],
              }}
              pageDataMeta={clicksData?.meta}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border p-4">
            <div className="text-sm font-semibold mb-3">Link details</div>
            <div className="space-y-3 text-sm">
              <DetailRow label="Destination">
                <a
                  href={link.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                >
                  <span className="truncate">{link.destinationUrl}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </DetailRow>
              <DetailRow label="Domain">{link.domain}</DetailRow>
              <DetailRow label="Slug">
                <span className="font-mono text-xs">{link.slug}</span>
              </DetailRow>
              <DetailRow label="Clicks">
                {link.clickCount.toLocaleString()}
                {link.clickLimit != null
                  ? ` / ${link.clickLimit.toLocaleString()}`
                  : ''}
              </DetailRow>
              <DetailRow label="Click limit">
                {link.clickLimit != null
                  ? link.clickLimit.toLocaleString()
                  : 'Unlimited'}
              </DetailRow>
              <DetailRow label="Expires">
                {link.expiresAt
                  ? dayjs(link.expiresAt).format('ll LT')
                  : 'Never'}
              </DetailRow>
              <DetailRow label="Last clicked">
                {stats?.lastClickedAt || link.lastClickedAt
                  ? dayjs(stats?.lastClickedAt ?? link.lastClickedAt).format(
                      'll LT',
                    )
                  : 'Never'}
              </DetailRow>
              <DetailRow label="Created">
                {dayjs(link.createdAt).format('ll LT')}
              </DetailRow>
              {link.description ? (
                <div className="pt-1">
                  <div className="text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{link.description}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Breakdown</div>
              <Select
                value={dimension}
                onValueChange={(v) =>
                  setDimension(v as ClickBreakdownDimension)
                }
              >
                <SelectTrigger className="w-40" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {breakdown && breakdown.length > 0 ? (
              <div className="space-y-2.5">
                {breakdown.map((item, i) => {
                  const label =
                    item.key == null
                      ? 'Unknown'
                      : dimension === 'device'
                        ? (DEVICE_LABELS[item.key as ClickDeviceType] ??
                          item.key)
                        : item.key;
                  return (
                    <div key={`${item.key ?? 'unknown'}-${i}`}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="truncate max-w-[180px]">{label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${(item.count / breakdownMax) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No data captured yet
              </p>
            )}
          </div>
        </div>
      </div>

      <ShortLinkEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        organizationId={activeOrganization.id}
        link={link}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
