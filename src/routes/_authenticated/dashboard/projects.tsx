import { createFileRoute, Link, notFound } from '@tanstack/react-router';

import { getProjects } from '@/api/projects';
import { WidgetAddLinear } from '@/components/icons';
import { OrganizationProjectGate } from '@/components/organization-project-gate';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/dashboard/projects')({
  component: Projects,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({
        data: {
          type: 'organization',
        },
      });
    }

    const projects = await getProjects(activeOrganization.id);

    if (projects.length === 0) {
      throw notFound({
        data: {
          type: 'projects',
        },
      });
    }

    return {
      projects,
    };
  },
  notFoundComponent: OrganizationProjectGate,
});

function Projects() {
  const { projects } = Route.useLoaderData();

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor your applications
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/projects/new">
            <WidgetAddLinear className="size-4" /> Create project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <WidgetAddLinear className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Create your first project
                </CardTitle>
                <CardDescription>
                  Set up a project to start tracking issues and events.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard/projects/new">
                <WidgetAddLinear className="size-4" /> Create project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
