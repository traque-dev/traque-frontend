import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { getProjects } from '@/api/projects';
import { BoxMinimalisticLinear } from '@/components/icons/box-minimalistic-linear';
import { ChartSquareLinear } from '@/components/icons/chart-square-linear';
import { UserRoundedLinear } from '@/components/icons/user-rounded-linear';
import { WidgetAddLinear } from '@/components/icons/widget-add-linear';
import { ProjectExceptionsChart } from '@/components/project-exceptions-chart';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
  loader: async () => {
    const { data: activeOrganization } =
      await auth.organization.getFullOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    const projects = await getProjects(activeOrganization.id);

    return {
      title: 'Dashboard',
      activeOrganization,
      projects,
    };
  },
  pendingComponent: () => null,
  errorComponent: () => <div>I'll create error component, I promise</div>,
  notFoundComponent: DashboardNotFound,
});

function DashboardPage() {
  const { projects, activeOrganization } = Route.useLoaderData();

  return (
    <div className="grid auto-rows-min @2xl:grid-cols-2 *:-ms-px *:-mt-px -m-px">
      {projects.map((project) => (
        <ProjectExceptionsChart
          key={project.id}
          organizationId={activeOrganization.id}
          project={project}
        />
      ))}
    </div>
  );
}

function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <WidgetAddLinear className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your organization
        </h1>
        <p className="text-muted-foreground max-w-xl">
          You don&apos;t have an active organization yet. Create one to start
          adding projects, tracking exceptions, and collaborating with your
          team.
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BoxMinimalisticLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Projects</div>
            <div className="text-muted-foreground">Organize work</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRoundedLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Team</div>
            <div className="text-muted-foreground">Invite members</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChartSquareLinear className="size-5" />
          </div>
          <div className="text-sm text-left">
            <div className="font-medium">Insights</div>
            <div className="text-muted-foreground">Dashboards & alerts</div>
          </div>
        </div>
      </div>
      <div>
        <Button asChild className="min-w-56">
          <Link to="/settings/organizations/new">Create organization</Link>
        </Button>
      </div>
    </div>
  );
}
