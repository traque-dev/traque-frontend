import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useExceptionDailyStatistics } from '@/api/exceptions/hooks';
import { CustomTooltipContent } from '@/components/charts-extra';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { dayjs } from '@/lib/dayjs';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import { CodeLinear, DangerLinear, SettingsLinear } from './icons';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type Props = {
  organizationId: Organization['id'];
  project: Project;
};

export function ProjectExceptionsChart({ organizationId, project }: Props) {
  const id = useId();

  const { data: exceptionDailyStatistics = [] } = useExceptionDailyStatistics(
    organizationId,
    project.id,
    {
      from: dayjs().subtract(20, 'days').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD'),
    },
  );

  const chartData = exceptionDailyStatistics.map((d) => ({
    date: d.date,
    count: d.count,
  }));

  const firstDate = chartData[0]?.date as string | undefined;
  const lastDate = chartData[chartData.length - 1]?.date as string | undefined;

  return (
    <Card className="gap-4 rounded-none border-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle>Project</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{project.name}</div>
              {/* <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                0%
              </Badge> */}
            </div>
          </div>
          <div className="inline-flex h-7 rounded-lg p-0.5 shrink-0 gap-2">
            <Link to="/dashboard/issues" search={{ projectId: project.id }}>
              <Button variant="outline" size="sm">
                <DangerLinear className="size-4" />
                Issues
              </Button>
            </Link>
            <Link to="/dashboard/events" search={{ projectId: project.id }}>
              <Button variant="outline" size="sm">
                <CodeLinear className="size-4" />
                Events
              </Button>
            </Link>
            <Link
              to="/dashboard/projects/$projectId/settings"
              params={{ projectId: project.id! }}
            >
              <Button variant="outline" size="icon" className="size-8">
                <SettingsLinear className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-base font-medium">Exceptions</div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
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
                  valueFormatter={(value: number) =>
                    `${value.toLocaleString()}`
                  }
                />
              }
            />
            <Bar dataKey="count" fill={`url(#${id}-gradient)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
