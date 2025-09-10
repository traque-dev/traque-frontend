import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { CustomTooltipContent } from '@/components/charts-extra';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { dayjs } from '@/lib/dayjs';
import type { ExceptionDailyStatistic } from '@/types/exception';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type Props = {
  data: ExceptionDailyStatistic[];
};

export function ProjectExceptionsChart({ data }: Props) {
  const id = useId();

  const firstDate = data?.[0]?.date as string | undefined;
  const lastDate = data?.[data.length - 1]?.date as string | undefined;

  if (!data) return null;
  if (firstDate === undefined || lastDate === undefined) return null;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
    >
      <BarChart
        accessibilityLayer
        data={data}
        maxBarSize={20}
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
          dataKey="date"
          tickLine={false}
          tickMargin={12}
          ticks={firstDate && lastDate ? [firstDate, lastDate] : undefined}
          tickFormatter={(value) => dayjs(String(value)).format('MMM DD')}
          stroke="var(--border)"
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          content={
            <CustomTooltipContent
              colorMap={{ count: 'var(--chart-1)' }}
              labelMap={{ count: 'Count' }}
              dataKeys={['count']}
              valueFormatter={(value: number) => `${value.toLocaleString()}`}
            />
          }
        />
        <Bar dataKey="count" fill={`url(#${id}-gradient)`} />
      </BarChart>
    </ChartContainer>
  );
}
