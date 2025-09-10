import { Link } from '@tanstack/react-router';
import { useExceptionDailyStatistics } from '@/api/exceptions/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import type { Organization } from '@/types/organization';
import type { Project } from '@/types/project';
import { CodeLinear, DangerLinear, SettingsLinear } from './icons';
import { ProjectExceptionsChart } from './project-exceptions-chart';

type Props = {
  organizationId: Organization['id'];
  project: Project;
};

export function ProjectExceptionsChartCard({ organizationId, project }: Props) {
  const { data: exceptionDailyStatistics = [] } = useExceptionDailyStatistics(
    organizationId,
    project.id,
    {
      from: dayjs().subtract(20, 'days').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD'),
    },
  );

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
        <ProjectExceptionsChart data={exceptionDailyStatistics} />
      </CardContent>
    </Card>
  );
}
