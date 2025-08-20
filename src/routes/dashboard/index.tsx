import { createFileRoute, notFound } from '@tanstack/react-router';
import { getProjects } from '@/api/projects';
import { ProjectExceptionsChart } from '@/components/project-exceptions-chart';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/')({
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
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>I'll create error component, I promise</div>,
  notFoundComponent: () => <div>Not found</div>,
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
