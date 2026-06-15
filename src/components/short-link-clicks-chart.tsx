import { useId, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { CustomTooltipContent } from '@/components/charts-extra';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { dayjs } from '@/lib/dayjs';
import type { ClickTimePeriod, ShortLinkTimePoint } from '@/types/short-link';

const chartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type Props = {
  data: ShortLinkTimePoint[];
  period: ClickTimePeriod;
};

type FilledPoint = {
  date: string;
  label: string;
  clicks: number;
};

/**
 * The API only returns buckets that have clicks. Build a continuous range of
 * empty buckets for the period and merge the recorded counts on top.
 */
function fillBuckets(
  data: ShortLinkTimePoint[],
  period: ClickTimePeriod,
): FilledPoint[] {
  const unit = period === 'day' ? 'hour' : 'day';
  const count = period === 'day' ? 24 : period === 'week' ? 7 : 30;

  const counts = new Map<string, number>();
  for (const point of data) {
    const key = dayjs(point.date).startOf(unit).toISOString();
    counts.set(key, (counts.get(key) ?? 0) + point.clicks);
  }

  const end = dayjs().startOf(unit);
  const labelFormat = period === 'day' ? 'HH:mm' : 'MMM DD';

  return Array.from({ length: count }, (_, i) => {
    const bucket = end.subtract(count - 1 - i, unit);
    const key = bucket.toISOString();
    return {
      date: key,
      label: bucket.format(labelFormat),
      clicks: counts.get(key) ?? 0,
    };
  });
}

export function ShortLinkClicksChart({ data, period }: Props) {
  const id = useId();

  const filled = useMemo(() => fillBuckets(data, period), [data, period]);

  const firstLabel = filled[0]?.label;
  const lastLabel = filled[filled.length - 1]?.label;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
    >
      <BarChart
        accessibilityLayer
        data={filled}
        maxBarSize={28}
        margin={{ left: -40, right: 0, top: 12 }}
      >
        <defs>
          <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="2 2"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={12}
          ticks={firstLabel && lastLabel ? [firstLabel, lastLabel] : undefined}
          stroke="var(--border)"
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          content={
            <CustomTooltipContent
              colorMap={{ clicks: 'var(--chart-1)' }}
              labelMap={{ clicks: 'Clicks' }}
              dataKeys={['clicks']}
              valueFormatter={(value: number) => `${value.toLocaleString()}`}
            />
          }
        />
        <Bar
          dataKey="clicks"
          fill={`url(#${id}-gradient)`}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
